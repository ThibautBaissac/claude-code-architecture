# Claude Code Infrastructure

This directory contains the Claude Code infrastructure for enhanced development workflows in this application.

## Overview

The infrastructure provides:
- **Auto-activating skills** - Contextual knowledge that appears when needed
- **Specialized agents** - Autonomous workflows for complex tasks
- **Dev docs system** - Documentation that survives context resets
- **Automation hooks** - Smart file tracking and skill suggestions

Inspired by [claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase).

## Directory Structure

```
.claude/
├── hooks/                      # Automation hooks
│   ├── skill-activation-prompt.js     # ESSENTIAL: Auto-suggests skills
│   └── post-tool-use-tracker.sh       # ESSENTIAL: Tracks file changes
├── skills/                     # Domain knowledge base
│   ├── skill-rules.json               # Skill activation configuration
│   ├── rails-dev-guidelines/
│   │   ├── SKILL.md
│   │   └── resources/*.md
│   └── rspec-testing-guidelines/
│       ├── SKILL.md
│       └── resources/*.md
├── agents/                     # Specialized workflows
│   ├── rails-code-reviewer.md
│   ├── refactor-planner.md
│   └── rspec-test-fixer.md
├── commands/                   # Slash commands
│   ├── dev-docs.md
│   └── dev-docs-update.md
└── cache/                      # Session data (gitignored)
```

## Quick Start

### Using Skills

Skills activate automatically based on your context:

```bash
# Automatic activation
# - Type keywords like "model", "controller", "test"
# - Open files in app/models/, app/controllers/, spec/
# - Claude will suggest relevant skills

# Manual activation
/skill rails-dev-guidelines
/skill rspec-testing-guidelines
```

**Available Skills:**
- `rails-dev-guidelines` - MVC patterns, ActiveRecord, best practices
- `rspec-testing-guidelines` - Testing patterns, factories, mocking
- `devise-auth-patterns` - Authentication with Devise
- `frontend-rails-patterns` - Views, Turbo, Stimulus, Tailwind
- `database-design-patterns` - Migrations, indexes, query optimization
- `security-best-practices` - Security patterns (blocking mode)

### Using Agents

Agents handle complex, multi-step workflows:

```bash
# Code review
claude agent:rails-code-reviewer

# Refactoring assistance
claude agent:refactor-planner

# Test debugging
claude agent:rspec-test-fixer
```

Agents will:
1. Analyze the situation
2. Create structured documentation
3. Request approval before changes
4. Execute with your guidance

### Using Dev Docs

Create persistent documentation for features:

```bash
# Create new docs
/dev-docs implement user profile feature

# Update existing docs
/dev-docs-update
```

Creates three files in `dev/active/[task-name]/`:
- `*-plan.md` - Strategic overview
- `*-context.md` - Decisions and key files
- `*-tasks.md` - Detailed checklist

## How It Works

### Auto-Activation System

1. **You type a prompt** → Hook intercepts (UserPromptSubmit)
2. **Hook analyzes context** → Checks keywords, files, intent
3. **Matches against rules** → Compares with skill-rules.json
4. **Suggests skills** → Shows relevant skills before you proceed

Example:
```
User: "Create a User model with validations"
Hook: 💡 Suggested Skill: rails-dev-guidelines
      Match: keyword "model", intent "create a model"
```

### File Tracking

1. **You edit a file** → Hook intercepts (PostToolUse)
2. **Hook tracks changes** → Logs to cache directory
3. **Determines checks needed** → Based on file type
4. **Reminds periodically** → After multiple edits

Example:
```
Modified: app/models/user.rb
Suggests: Run RuboCop, run model specs
```

### Modular Skills (500-Line Rule)

Skills avoid context limits by splitting content:

```
skill-name/
├── SKILL.md           (~400 lines)
│   ├── Overview
│   ├── Quick reference
│   ├── Core principles
│   └── Navigation to resources
└── resources/
    ├── associations.md    (detailed guide)
    ├── validations.md     (detailed guide)
    └── queries.md         (detailed guide)
```

Claude loads only what's needed, when it's needed.

## Configuration

### Skill Rules (`skills/skill-rules.json`)

Controls when skills activate:

```json
{
  "name": "rails-dev-guidelines",
  "description": "Rails MVC patterns and best practices",
  "mode": "suggest",          // or "block" for enforcement
  "priority": "high",
  "triggers": {
    "keywords": ["model", "controller"],
    "intentPatterns": ["create a model"],
    "filePatterns": ["app/models/**/*.rb"],
    "excludePatterns": ["spec/**/*.rb"]
  }
}
```

**Modes:**
- `suggest` - Recommends the skill
- `block` - Requires skill before proceeding (use sparingly)

**Priority:**
- `high` - Show first
- `medium` - Show if highly relevant
- `low` - Show only if perfect match

### Hook Configuration

Hooks are executable scripts that run on events:

**UserPromptSubmit** - Runs before Claude processes your prompt
- Use for: Skill suggestions, context analysis
- Example: `skill-activation-prompt.js`

**PostToolUse** - Runs after file operations (Edit, Write)
- Use for: File tracking, test suggestions
- Example: `post-tool-use-tracker.sh`

**Stop** - Runs before stopping/context switching
- Use for: Running tests, linting, builds
- Not included by default (add as needed)

## Customization

### Adding a New Skill

1. Create directory:
   ```bash
   mkdir -p .claude/skills/my-skill/resources
   ```

2. Create `SKILL.md`:
   ```markdown
   ---
   name: my-skill
   description: What this skill provides
   ---

   # My Skill

   ## Purpose
   [Description]

   ## When to Use
   [Scenarios]

   ## Core Principles
   [Key patterns and examples]

   ## Navigation Guide
   - Topic 1 → See `resources/topic1.md`
   ```

3. Add activation rule to `skill-rules.json`:
   ```json
   {
     "name": "my-skill",
     "description": "Brief description",
     "mode": "suggest",
     "priority": "medium",
     "triggers": {
       "keywords": ["keyword1", "keyword2"],
       "filePatterns": ["path/**/*.rb"]
     }
   }
   ```

4. Test by using trigger keywords or opening matching files

### Adding a New Agent

1. Create markdown file:
   ```bash
   touch .claude/agents/my-agent.md
   ```

2. Define structure:
   ```markdown
   # My Agent Name

   You are a specialized agent for [purpose].

   ## Your Role
   [What this agent does]

   ## Process
   1. Step 1
   2. Step 2

   ## Output Format
   [What to create and where]

   ## Constraints
   - DO: [Good practices]
   - DON'T: [Things to avoid]
   ```

3. Use via:
   ```bash
   claude agent:my-agent
   ```

### Adding a Slash Command

1. Create markdown file:
   ```bash
   touch .claude/commands/my-command.md
   ```

2. Document the command:
   ```markdown
   # My Command

   [What this command does]

   ---

   ## Your Task
   [Instructions for Claude]
   ```

3. Use via:
   ```bash
   /my-command [arguments]
   ```

## Best Practices

### For Skills
- Keep SKILL.md under 500 lines
- Use progressive disclosure (link to resources)
- Show examples (❌ wrong, ✅ right)
- Reference related skills
- Update as patterns evolve

### For Agents
- Single responsibility (one complex task)
- Request approval before changes
- Output structured documentation
- Reference skills for guidance
- Be transparent about capabilities

### For Hooks
- Keep fast (< 100ms)
- Handle errors gracefully
- Don't block on failure
- Log to cache directory
- Test thoroughly

### For Dev Docs
- Create early, update often
- Treat as code (review, commit)
- Include decisions and context
- Update after major changes
- Reference in context resets

## Troubleshooting

### Skill Not Activating

Check:
```bash
# Verify hook is executable
ls -la .claude/hooks/skill-activation-prompt.js
chmod +x .claude/hooks/skill-activation-prompt.js

# Check skill rules syntax
cat .claude/skills/skill-rules.json | jq

# Review trigger patterns
grep -A 5 "triggers" .claude/skills/skill-rules.json
```

### Hook Not Running

Check:
```bash
# Verify executable permissions
ls -la .claude/hooks/

# Test hook manually (if applicable)
node .claude/hooks/skill-activation-prompt.js

# Check logs
ls -la .claude/cache/session/
```

### Skills Slow to Load

Check:
- Is SKILL.md > 500 lines? Split into resources
- Are you loading all resources at once? Use progressive disclosure
- Check file sizes: `wc -l .claude/skills/**/*.md`

## Maintenance

### Regular Tasks

- **Review skill rules**: Ensure triggers match actual usage
- **Update skills**: Keep patterns current with codebase changes
- **Prune cache**: Clear old session data periodically
- **Test hooks**: Verify they still work after updates

### Cleaning Cache

```bash
# Clear all cache
rm -rf .claude/cache/

# Clear old sessions (keep recent)
find .claude/cache/session -type f -mtime +7 -delete
```

### Updating from Upstream

This infrastructure is based on [claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase). To incorporate new patterns:

1. Review upstream changes
2. Adapt to Rails context
3. Test thoroughly
4. Update documentation

## Resources

- **Main Docs**: See `CLAUDE.md` in project root
- **Upstream Project**: https://github.com/diet103/claude-code-infrastructure-showcase
- **Claude Code Docs**: https://claude.ai/code

## Contributing

When adding or modifying infrastructure:

1. Test thoroughly in your workflow
2. Document in this README
3. Update CLAUDE.md if user-facing
4. Add examples and troubleshooting tips
5. Commit with descriptive message

## License

Same as project license. Infrastructure patterns are MIT from upstream.
