# Query Optimization and Patterns

## Avoiding N+1 Queries

### The Problem

```ruby
# This generates 1 query for users + N queries for posts
@users = User.all
@users.each do |user|
  puts user.posts.count  # N+1 query!
end
```

### Solutions

#### 1. Use `includes` for Eager Loading

```ruby
# Loads users and posts in 2 queries total
@users = User.includes(:posts).all
@users.each do |user|
  puts user.posts.count  # No additional query
end
```

#### 2. Use `preload` for Separate Queries

```ruby
# Always loads associations in separate queries
@users = User.preload(:posts, :comments).all
```

#### 3. Use `eager_load` for LEFT OUTER JOIN

```ruby
# Loads everything in a single JOIN query
@users = User.eager_load(:posts).all
```

#### 4. Use `joins` When You Don't Need Data

```ruby
# Only loads users, not posts
# Good for filtering or counting
@users = User.joins(:posts).where(posts: { published: true })
```

### Detection in Development

The `bullet` gem is configured in development. Check logs for N+1 warnings.

## Query Objects

Extract complex queries into dedicated classes.

### Basic Query Object

```ruby
# app/queries/active_users_query.rb
class ActiveUsersQuery
  def initialize(relation = User.all)
    @relation = relation
  end

  def call
    @relation
      .where(active: true)
      .where('last_login_at > ?', 30.days.ago)
      .order(created_at: :desc)
  end

  # Alias for convenience
  def self.call(relation = User.all)
    new(relation).call
  end
end

# Usage in controller
@users = ActiveUsersQuery.call
@premium_active_users = ActiveUsersQuery.call(User.where(premium: true))
```

### Advanced Query Object

```ruby
# app/queries/search_posts_query.rb
class SearchPostsQuery
  attr_reader :relation

  def initialize(relation = Post.all)
    @relation = relation.extending(Scopes)
  end

  def call(params)
    @relation
      .then { |r| by_keyword(r, params[:q]) }
      .then { |r| by_category(r, params[:category]) }
      .then { |r| by_date_range(r, params[:from], params[:to]) }
      .then { |r| published(r) }
      .then { |r| sorted(r, params[:sort]) }
  end

  private

  def by_keyword(relation, keyword)
    return relation if keyword.blank?

    relation.where('title ILIKE ? OR content ILIKE ?', "%#{keyword}%", "%#{keyword}%")
  end

  def by_category(relation, category)
    return relation if category.blank?

    relation.where(category: category)
  end

  def by_date_range(relation, from, to)
    relation = relation.where('published_at >= ?', from) if from.present?
    relation = relation.where('published_at <= ?', to) if to.present?
    relation
  end

  def published(relation)
    relation.where(published: true)
  end

  def sorted(relation, sort_param)
    case sort_param
    when 'recent'
      relation.order(published_at: :desc)
    when 'popular'
      relation.order(views_count: :desc)
    else
      relation.order(created_at: :desc)
    end
  end

  module Scopes
    def with_author
      includes(:user)
    end

    def with_comments_count
      left_joins(:comments).group(:id).select('posts.*, COUNT(comments.id) as comments_count')
    end
  end
end

# Usage
@posts = SearchPostsQuery.new.call(params)
@posts_with_author = SearchPostsQuery.new(Post.with_author).call(params)
```

## Performance Tips

### 1. Use `select` to Load Only Needed Columns

```ruby
# Don't load entire row if you only need specific columns
User.select(:id, :email, :name).where(active: true)
```

### 2. Use `pluck` for Simple Data

```ruby
# Returns array of IDs without instantiating models
user_ids = User.where(active: true).pluck(:id)

# Multiple columns
User.pluck(:id, :email)  # => [[1, "user1@..."], [2, "user2@..."]]
```

### 3. Use `exists?` Instead of `any?`

```ruby
# ❌ Loads records into memory
if User.where(email: email).any?
  # ...
end

# ✅ Database-level check
if User.where(email: email).exists?
  # ...
end
```

### 4. Use `find_each` for Large Datasets

```ruby
# ❌ Loads all users into memory
User.all.each do |user|
  user.send_email
end

# ✅ Processes in batches of 1000
User.find_each do |user|
  user.send_email
end

# Custom batch size
User.find_each(batch_size: 500) do |user|
  user.send_email
end
```

### 5. Use Counter Caches

```ruby
# Migration
class AddPostsCountToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :posts_count, :integer, default: 0, null: false

    User.find_each do |user|
      User.reset_counters(user.id, :posts)
    end
  end
end

# Model
class Post < ApplicationRecord
  belongs_to :user, counter_cache: true
end

# Usage (no query needed!)
@user.posts_count  # Returns cached value
```

## Index Strategy

### Always Index Foreign Keys

```ruby
class CreatePosts < ActiveRecord::Migration[8.1]
  def change
    create_table :posts do |t|
      t.references :user, null: false, foreign_key: true  # Adds index automatically
      t.timestamps
    end
  end
end
```

### Composite Indexes

```ruby
# For queries like: Post.where(user_id: 1, published: true)
add_index :posts, [:user_id, :published]

# Order matters! Index helps with:
# - WHERE user_id = 1 AND published = true ✅
# - WHERE user_id = 1 ✅
# - WHERE published = true ❌ (doesn't use index efficiently)
```

### Unique Indexes

```ruby
add_index :users, :email, unique: true
add_index :posts, [:user_id, :slug], unique: true
```

## Raw SQL When Necessary

For complex queries, raw SQL is sometimes clearer:

```ruby
# Using sanitization
User.find_by_sql([
  'SELECT users.*, COUNT(posts.id) as posts_count
   FROM users
   LEFT JOIN posts ON posts.user_id = users.id
   WHERE users.created_at > ?
   GROUP BY users.id
   HAVING COUNT(posts.id) > ?',
  30.days.ago,
  5
])

# Or use Arel (ActiveRecord's query builder)
users = User.arel_table
posts = Post.arel_table

User
  .joins(users.join(posts, Arel::Nodes::OuterJoin).on(posts[:user_id].eq(users[:id])).join_sources)
  .where(users[:created_at].gt(30.days.ago))
  .group(users[:id])
  .having(posts[:id].count.gt(5))
```

## Debugging Queries

### In Development

```ruby
# See generated SQL
User.where(active: true).to_sql

# Explain query plan
User.where(active: true).explain
```

### Using Bullet Gem

Check `log/bullet.log` for N+1 query warnings.

### Rails Query Log Tags

Queries include context like controller/action in logs automatically.

## Query Object Testing

```ruby
# spec/queries/active_users_query_spec.rb
require 'rails_helper'

RSpec.describe ActiveUsersQuery do
  describe '.call' do
    let!(:active_user) { create(:user, active: true, last_login_at: 1.day.ago) }
    let!(:inactive_user) { create(:user, active: false) }
    let!(:old_active_user) { create(:user, active: true, last_login_at: 60.days.ago) }

    it 'returns only recently active users' do
      result = described_class.call

      expect(result).to include(active_user)
      expect(result).not_to include(inactive_user)
      expect(result).not_to include(old_active_user)
    end

    it 'can be scoped' do
      premium_active = create(:user, :premium, active: true, last_login_at: 1.day.ago)

      result = described_class.call(User.where(premium: true))

      expect(result).to include(premium_active)
      expect(result).not_to include(active_user)
    end
  end
end
```

---

**Related**: See `service-objects.md` for business logic extraction, `associations.md` for relationship queries
