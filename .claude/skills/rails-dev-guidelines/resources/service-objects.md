# Service Objects Pattern

## When to Use Service Objects

Use service objects when:
- An operation involves multiple models
- Business logic is too complex for a model
- You need to coordinate external APIs
- The operation has multiple steps that should be atomic
- You want to keep controllers and models thin

## Basic Structure

```ruby
# app/services/user_registration_service.rb
class UserRegistrationService
  def initialize(params)
    @params = params
  end

  def call
    ActiveRecord::Base.transaction do
      create_user
      create_profile
      send_welcome_email
      track_signup
    end

    success(@user)
  rescue StandardError => e
    failure(e.message)
  end

  private

  attr_reader :params

  def create_user
    @user = User.create!(user_params)
  end

  def create_profile
    @user.create_profile!(profile_params)
  end

  def send_welcome_email
    UserMailer.welcome_email(@user).deliver_later
  end

  def track_signup
    Analytics.track(:signup, user_id: @user.id)
  end

  def user_params
    params.slice(:email, :password, :name)
  end

  def profile_params
    params.slice(:bio, :avatar)
  end

  def success(user)
    OpenStruct.new(success?: true, user: user, errors: [])
  end

  def failure(message)
    OpenStruct.new(success?: false, user: nil, errors: [message])
  end
end
```

## Usage in Controllers

```ruby
class UsersController < ApplicationController
  def create
    result = UserRegistrationService.new(user_params).call

    if result.success?
      redirect_to result.user, notice: 'Welcome!'
    else
      flash.now[:alert] = result.errors.join(', ')
      render :new, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :name, :bio, :avatar)
  end
end
```

## Result Object Pattern

For more complex services, use a dedicated Result class:

```ruby
# app/services/result.rb
class Result
  attr_reader :data, :errors

  def initialize(success:, data: nil, errors: [])
    @success = success
    @data = data
    @errors = Array(errors)
  end

  def success?
    @success
  end

  def failure?
    !@success
  end

  def self.success(data = nil)
    new(success: true, data: data)
  end

  def self.failure(errors)
    new(success: false, errors: errors)
  end
end

# Usage in service
class OrderProcessingService
  def call
    # ... processing logic
    Result.success(@order)
  rescue PaymentError => e
    Result.failure(e.message)
  end
end
```

## Service Object Checklist

- [ ] Single responsibility (does one thing well)
- [ ] Clear naming (verb-noun: `ProcessOrder`, `SendInvoice`)
- [ ] Returns consistent result object
- [ ] Uses transactions for multi-step operations
- [ ] Handles errors gracefully
- [ ] Easy to test in isolation
- [ ] No Rails dependencies unless necessary

## Anti-Patterns to Avoid

❌ **Don't** create "Manager" or "Handler" services (too vague)
❌ **Don't** put service objects in models directory
❌ **Don't** return different types (sometimes model, sometimes boolean)
❌ **Don't** access `params` or `session` directly
❌ **Don't** call other services without dependency injection

## Testing Service Objects

```ruby
# spec/services/user_registration_service_spec.rb
require 'rails_helper'

RSpec.describe UserRegistrationService do
  describe '#call' do
    let(:params) do
      {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        bio: 'A test bio'
      }
    end

    subject(:service) { described_class.new(params) }

    context 'with valid params' do
      it 'creates a user' do
        expect { service.call }.to change(User, :count).by(1)
      end

      it 'creates a profile' do
        expect { service.call }.to change(Profile, :count).by(1)
      end

      it 'sends welcome email' do
        expect(UserMailer).to receive(:welcome_email).and_call_original
        service.call
      end

      it 'returns success result' do
        result = service.call
        expect(result).to be_success
        expect(result.user).to be_a(User)
      end
    end

    context 'with invalid params' do
      let(:params) { { email: 'invalid' } }

      it 'does not create a user' do
        expect { service.call }.not_to change(User, :count)
      end

      it 'returns failure result' do
        result = service.call
        expect(result).to be_failure
        expect(result.errors).to be_present
      end
    end
  end
end
```

## Alternative: Use Interactor Gem

For complex workflows, consider the `interactor` gem:

```ruby
# Gemfile
gem 'interactor'

# app/interactors/register_user.rb
class RegisterUser
  include Interactor

  def call
    create_user
    create_profile
    send_email
  end

  private

  def create_user
    context.user = User.create!(context.user_params)
  rescue ActiveRecord::RecordInvalid => e
    context.fail!(message: e.message)
  end

  def create_profile
    context.user.create_profile!(context.profile_params)
  end

  def send_email
    UserMailer.welcome_email(context.user).deliver_later
  end
end

# Usage
result = RegisterUser.call(user_params: params, profile_params: profile)
if result.success?
  redirect_to result.user
else
  flash[:alert] = result.message
end
```

---

**Related**: See `queries.md` for query objects, `background-jobs.md` for async processing
