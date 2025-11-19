# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This app is a Rails 8.1.1 application using:
- Ruby 3.3.10
- SQLite3 database
- Devise for authentication
- RSpec for testing
- Tailwind CSS for styling
- Turbo and Stimulus for interactivity
- Solid Cache, Solid Queue, and Solid Cable for infrastructure

## Development Commands

### Server & Development
```bash
bin/setup              # Initial setup: installs dependencies, prepares database, starts server
bin/dev                # Start development server with Foreman (Rails + Tailwind watch)
bin/rails server       # Start Rails server only (port 3000)
bin/rails tailwindcss:watch  # Watch Tailwind CSS changes
```

### Database
```bash
bin/rails db:prepare   # Create database, load schema, run migrations
bin/rails db:migrate   # Run pending migrations
bin/rails db:rollback  # Rollback last migration
bin/rails db:reset     # Drop, create, and setup database
bin/rails db:seed      # Load seed data
```

### Testing
```bash
bundle exec rspec                    # Run all specs
bundle exec rspec spec/models        # Run model specs
bundle exec rspec spec/path/to/file_spec.rb          # Run specific file
bundle exec rspec spec/path/to/file_spec.rb:42       # Run specific line
```

RSpec is configured with:
- FactoryBot for test data (`spec/factories/`)
- SimpleCov for coverage reporting (`coverage/` directory)
- Shoulda Matchers for ActiveRecord/ActiveModel matchers
- Devise test helpers for authentication in specs
- Transactional fixtures enabled

### Code Quality
```bash
bin/rubocop            # Run RuboCop linter
bin/rubocop -a         # Auto-correct offenses
bin/brakeman           # Run security scanner
bundle exec bundle-audit check  # Check for vulnerable gem versions
```

The project uses `rubocop-rails-omakase` for Ruby styling conventions.

### Rails Commands
```bash
bin/rails generate     # Run generators (model, controller, migration, etc.)
bin/rails console      # Open Rails console
bin/rails routes       # List all routes
bin/rails db:migrate:status  # Check migration status
```

## Architecture

### Authentication
- **Devise** handles all user authentication
- User model includes: `:database_authenticatable`, `:registerable`, `:recoverable`, `:rememberable`, `:validatable`, `:confirmable`, `:lockable`, `:timeoutable`, `:trackable`
- Devise routes mounted at `/users` (sign in, sign up, etc.)
- In development, **LetterOpenerWeb** is mounted at `/letter_opener` to preview emails

### Application Structure
- Module name: `MyApp` (config/application.rb:9)
- Rails 8.1 defaults loaded
- Autoload lib enabled, ignoring `assets` and `tasks` subdirectories
- Standard Rails MVC structure in `app/` directory

### Frontend
- **Tailwind CSS** for styling (compiled via `tailwindcss-rails`)
- **Turbo Rails** for SPA-like navigation
- **Stimulus** for JavaScript interactions
- **Importmap** for JavaScript module management
- Assets in `app/assets/`, `app/javascript/`

### Background Jobs & Infrastructure
- **Solid Queue** for background job processing
- **Solid Cache** for caching
- **Solid Cable** for ActionCable (WebSockets)
- Configuration files: `config/queue.yml`, `config/cache.yml`, `config/cable.yml`

### Deployment
- **Kamal** for deployment (config in `config/deploy.yml` and `.kamal/`)
- **Thruster** for HTTP/2 proxy
- **Puma** web server
- Dockerfile included for containerized deployment

## Testing Patterns

### RSpec Configuration
- Spec files in `spec/` directory
- Factories in `spec/factories/`
- Support files in `spec/support/`
- Configuration: `spec/rails_helper.rb` and `spec/spec_helper.rb`

### Devise Testing
```ruby
# In request specs
include Devise::Test::IntegrationHelpers
sign_in user

# In controller specs
include Devise::Test::ControllerHelpers
sign_in user
```

### Factory Bot
```ruby
# Already included via config.include FactoryBot::Syntax::Methods
user = create(:user)
build(:user, email: 'test@example.com')
```

## Development Tools

### Letter Opener (Development)
- Access at `http://localhost:3000/letter_opener` to view sent emails
- Only available in development environment

### Bullet (Development)
- N+1 query detection enabled in development
- Alerts appear in browser and logs

### Health Check
- Health endpoint at `/up` returns 200 if app boots successfully
- Used for load balancer health checks

## Important Notes

- Database: SQLite3 in all environments (`storage/development.sqlite3`, etc.)
- Logs: `log/development.log`, `log/test.log`
- Credentials: `config/credentials.yml.enc` (encrypted, use `bin/rails credentials:edit`)
- Master key: `config/master.key` (gitignored, required for decrypting credentials)

## Claude Code Infrastructure

This project includes a comprehensive Claude Code infrastructure system for enhanced development workflows.

### Skills System

Skills provide domain-specific knowledge that activates automatically based on context.

**Available Skills:**
- **rails-dev-guidelines** - Rails MVC patterns, ActiveRecord, and best practices
- **rspec-testing-guidelines** - RSpec testing patterns, factories, and mocking
- **devise-auth-patterns** - Devise authentication and security
- **frontend-rails-patterns** - Views, Turbo, Stimulus, and Tailwind
- **database-design-patterns** - Schema design, migrations, and optimization
- **security-best-practices** - Rails security patterns (blocking enforcement)

**Skill Usage:**
```bash
# Skills activate automatically based on file context and keywords
# Manual activation available:
/skill rails-dev-guidelines
/skill rspec-testing-guidelines
```

**Configuration:**
- Skills defined in `.claude/skills/`
- Activation rules in `.claude/skills/skill-rules.json`
- Auto-activation via hooks (see below)

### Specialized Agents

Agents provide focused, autonomous workflows for complex tasks.

**Available Agents:**
```bash
# Code review with comprehensive analysis
claude agent:rails-code-reviewer

# Plan and execute safe, incremental refactoring
claude agent:refactor-planner

# Debug and fix failing RSpec tests
claude agent:rspec-test-fixer
```

**Agent Characteristics:**
- Autonomous operation for multi-step tasks
- Structured output documents in `dev/active/`
- Request approval before making changes
- Reference skills and project conventions

### Dev Docs System

Development documentation that survives context resets.

**Commands:**
```bash
# Create comprehensive development docs
/dev-docs [feature or task description]

# Update docs as work progresses
/dev-docs-update
```

**Output Structure:**
```
dev/active/[task-name]/
├── [task-name]-plan.md        # Strategic overview and phases
├── [task-name]-context.md     # Decisions, files, and patterns
└── [task-name]-tasks.md       # Detailed checklist
```

**When to Use:**
- Starting new features or refactoring
- Complex multi-day initiatives
- After context resets (docs provide full context)
- Tracking progress and decisions

### Hooks System

Automated workflows that enhance development experience.

**Active Hooks:**

1. **skill-activation-prompt** (UserPromptSubmit)
   - Analyzes prompts and file context
   - Suggests relevant skills automatically
   - Configured via `skill-rules.json`

2. **post-tool-use-tracker** (PostToolUse)
   - Tracks modified files after edits
   - Suggests relevant checks (RuboCop, RSpec)
   - Maintains session history in `.claude/cache/`

**Hook Logs:**
```bash
# Modified files log
.claude/cache/session/[session-id]-modified-files.log

# Suggested checks
.claude/cache/session/[session-id]-checks-needed.log
```

### Skill Development

Skills follow a modular pattern to prevent context limit issues.

**Structure:**
```
.claude/skills/[skill-name]/
├── SKILL.md              # Main file (≤500 lines)
└── resources/            # Detailed topic files (≤500 each)
    ├── topic-1.md
    └── topic-2.md
```

**Key Principles:**
- Main SKILL.md provides overview and navigation
- Resources provide deep-dive content
- Progressive disclosure (load resources as needed)
- Clear cross-references between files

### Activation Rules

Skills activate based on:
- **Keywords** in prompts (e.g., "controller", "validation", "RSpec")
- **Intent patterns** (e.g., "create a model", "fix failing test")
- **File patterns** (e.g., `app/models/**/*.rb`, `spec/**/*_spec.rb`)
- **Mode**: `suggest` (recommend) or `block` (require before proceeding)

**Example Rule:**
```json
{
  "name": "rails-dev-guidelines",
  "mode": "suggest",
  "priority": "high",
  "triggers": {
    "keywords": ["model", "controller", "migration"],
    "filePatterns": ["app/models/**/*.rb", "app/controllers/**/*.rb"]
  }
}
```

### Best Practices

**Using Skills:**
- Skills activate automatically in most cases
- Use `/skill [name]` for manual activation
- Skills reference each other for comprehensive guidance
- Check skill suggestions in hook output

**Using Agents:**
- Use for complex, multi-step operations
- Agents produce structured documentation
- Review agent output before approving changes
- Agents maintain project conventions

**Using Dev Docs:**
- Create at project start, not mid-way
- Update regularly with `/dev-docs-update`
- Reference after context resets
- Keep as source of truth for decisions

### Directory Structure

```
.claude/
├── hooks/                      # Automation hooks
│   ├── skill-activation-prompt.js
│   └── post-tool-use-tracker.sh
├── skills/                     # Domain knowledge
│   ├── skill-rules.json
│   ├── rails-dev-guidelines/
│   ├── rspec-testing-guidelines/
│   └── [other skills]/
├── agents/                     # Specialized workflows
│   ├── rails-code-reviewer.md
│   ├── refactor-planner.md
│   └── rspec-test-fixer.md
└── commands/                   # Slash commands
    ├── dev-docs.md
    └── dev-docs-update.md

dev/active/                     # Development docs
└── [task-name]/
    ├── [task-name]-plan.md
    ├── [task-name]-context.md
    └── [task-name]-tasks.md
```

### Extending the System

**Adding a New Skill:**
1. Create directory: `.claude/skills/[skill-name]/`
2. Create `SKILL.md` with structure (see existing skills)
3. Add resources in `resources/` subdirectory
4. Add activation rule to `skill-rules.json`
5. Test by triggering keywords or file patterns

**Adding a New Agent:**
1. Create `.claude/agents/[agent-name].md`
2. Define role, process, and output format
3. Reference relevant skills and conventions
4. Document constraints (e.g., "request approval first")

**Modifying Hooks:**
- Hooks in `.claude/hooks/` are executable scripts
- Respect hook types (UserPromptSubmit, PostToolUse, Stop)
- Test thoroughly as they affect all sessions
- Keep performance impact minimal

### Troubleshooting

**Skill not activating:**
- Check `skill-rules.json` for trigger patterns
- Verify hook is executable: `chmod +x .claude/hooks/*.js`
- Ensure keywords match your prompt
- Try manual activation: `/skill [name]`

**Hook not running:**
- Verify hook is executable
- Check hook logs in `.claude/cache/`
- Ensure hook type matches event (UserPromptSubmit, PostToolUse)
- Check for syntax errors in hook script

**Dev docs out of sync:**
- Run `/dev-docs-update` regularly
- Keep manual changes in sync with code
- Use git to track doc changes
- Treat docs as code (review, commit)

### References

- Skills inspired by [claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase)
- Modular skill pattern follows 500-line rule for context efficiency
- Auto-activation system reduces cognitive load
- Dev docs pattern ensures continuity across context resets
