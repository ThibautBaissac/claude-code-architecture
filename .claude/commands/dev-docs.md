# Dev Docs Command

Generate comprehensive development documentation for a feature, refactoring, or technical initiative.

---

## Your Task

The user wants to create structured development documentation for: **{USER_INPUT}**

Create three interconnected files in `dev/active/[task-name]/`:

1. **`[task-name]-plan.md`** - Strategic overview and implementation plan
2. **`[task-name]-context.md`** - Critical context, decisions, and key files
3. **`[task-name]-tasks.md`** - Detailed task checklist

## Step 1: Understand the Scope

Ask clarifying questions if needed:
- What is the primary goal of this work?
- Are there specific constraints or requirements?
- What's the expected timeline or urgency?
- Are there related systems or dependencies?

If the user has provided sufficient context, proceed directly to documentation.

## Step 2: Research the Codebase

Before creating docs, research:
- Related files and components
- Existing patterns and conventions
- Dependencies and integrations
- Current test coverage
- Relevant documentation (CLAUDE.md, README.md)

Use these commands:
```bash
# Find related files
find app -name "*[relevant_term]*"

# Search for keywords
grep -r "keyword" app/

# Check existing patterns
ls -la app/models app/controllers app/services
```

## Step 3: Create the Plan File

File: `dev/active/[task-name]/[task-name]-plan.md`

```markdown
# [Task Name] - Implementation Plan

**Created**: [Date]
**Status**: Planning
**Owner**: [If applicable]
**Estimated Effort**: [S/M/L/XL]

## Executive Summary

[2-3 sentences explaining what we're building/changing and why]

## Current State

### What Exists Today
[Description of current implementation, if any]

### Problems/Gaps
- [Problem 1]
- [Problem 2]

### Related Systems
- [System 1]: How it relates
- [System 2]: How it relates

## Proposed Solution

### Overview
[High-level description of the solution]

### Architecture Changes
[Diagram or description of new components, if applicable]

### Key Components

#### Component 1: [Name]
- **Purpose**: What it does
- **Location**: Where it lives (e.g., `app/services/...`)
- **Dependencies**: What it needs
- **Interface**: How it's used

#### Component 2: [Name]
[Same structure]

### Data Model Changes
[Database migrations, new tables, modified columns]

### API Changes
[New endpoints, modified endpoints, breaking changes]

### UI Changes
[User-facing changes, new views, modified flows]

## Implementation Phases

### Phase 1: [Name] (Estimated: [X] hours)
**Goal**: [What this phase accomplishes]

Key tasks:
1. [Task]
2. [Task]

Success criteria:
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### Phase 2: [Name]
[Same structure]

### Phase 3: [Name]
[Same structure]

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | Low/Med/High | Low/Med/High | [Strategy] |
| [Risk 2] | Low/Med/High | Low/Med/High | [Strategy] |

## Success Metrics

- [ ] [Metric 1]: How to measure
- [ ] [Metric 2]: How to measure
- [ ] [Metric 3]: How to measure

## Testing Strategy

- **Unit Tests**: What needs unit tests
- **Integration Tests**: What needs integration tests
- **System Tests**: What needs end-to-end tests
- **Manual Testing**: What needs manual verification

## Rollout Plan

1. **Development**: [Timeline]
2. **Testing**: [Timeline]
3. **Deployment**: [Strategy]
4. **Monitoring**: [What to watch]
5. **Rollback Plan**: [If things go wrong]

## Open Questions

- [ ] [Question 1]
- [ ] [Question 2]

## References

- Related docs: [Links]
- Similar implementations: [Links]
- External resources: [Links]
```

## Step 4: Create the Context File

File: `dev/active/[task-name]/[task-name]-context.md`

```markdown
# [Task Name] - Context & Decisions

**Last Updated**: [Date]

## Critical Files

### Primary Files
- `path/to/file1.rb` - Purpose and role
- `path/to/file2.rb` - Purpose and role

### Supporting Files
- `path/to/file3.rb` - Purpose and role
- `path/to/file4.rb` - Purpose and role

### Test Files
- `spec/path/to/spec1_spec.rb` - What it tests
- `spec/path/to/spec2_spec.rb` - What it tests

## Key Decisions

### Decision 1: [Title]
**Date**: [Date]
**Status**: [Proposed/Accepted/Rejected]

**Context**: Why we needed to make this decision

**Options Considered**:
1. Option A: Pros/Cons
2. Option B: Pros/Cons

**Decision**: What we chose and why

**Consequences**: Implications of this choice

---

### Decision 2: [Title]
[Same structure]

## Technical Constraints

- [Constraint 1]: Why it matters
- [Constraint 2]: Why it matters

## Dependencies

### Internal Dependencies
- [Component A]: How we depend on it
- [Component B]: How we depend on it

### External Dependencies
- [Gem/Service]: Version and purpose
- [Gem/Service]: Version and purpose

## Patterns & Conventions

### Patterns to Follow
- **[Pattern 1]**: When and how to use
- **[Pattern 2]**: When and how to use

### Patterns to Avoid
- **[Anti-pattern 1]**: Why to avoid
- **[Anti-pattern 2]**: Why to avoid

## Code Snippets

### Useful Examples
```ruby
# Example 1: [Description]
[Code snippet]

# Example 2: [Description]
[Code snippet]
```

## Database Schema

### Tables Involved
```sql
-- Table 1
CREATE TABLE...

-- Table 2
CREATE TABLE...
```

### Indexes
- [Index 1]: Purpose
- [Index 2]: Purpose

## Environment-Specific Notes

### Development
[Special considerations for dev environment]

### Test
[Special considerations for test environment]

### Production
[Special considerations for production environment]

## Troubleshooting

### Common Issues
- **Issue 1**: Symptom and solution
- **Issue 2**: Symptom and solution

### Debug Commands
```bash
# Command 1: Description
command here

# Command 2: Description
command here
```

## Knowledge Transfer

### New Concepts Introduced
- [Concept 1]: Explanation
- [Concept 2]: Explanation

### Required Skills
- [Skill 1]: Why needed
- [Skill 2]: Why needed
```

## Step 5: Create the Tasks File

File: `dev/active/[task-name]/[task-name]-tasks.md`

```markdown
# [Task Name] - Task Checklist

**Started**: [Date]
**Status**: [Not Started/In Progress/Completed]
**Progress**: [X]% complete

## Phase 1: [Name]

### Setup
- [ ] Create feature branch `feature/[name]`
- [ ] Review existing code and tests
- [ ] Set up local environment

### Implementation
- [ ] **Task 1.1**: [Description]
  - Files: `app/models/...`
  - Tests: `spec/models/...`
  - Acceptance: [Criteria]

- [ ] **Task 1.2**: [Description]
  - Files: `app/controllers/...`
  - Tests: `spec/requests/...`
  - Acceptance: [Criteria]

### Verification
- [ ] Run test suite: `bundle exec rspec`
- [ ] Check RuboCop: `bin/rubocop`
- [ ] Manual testing: [Specific steps]

## Phase 2: [Name]

### Implementation
- [ ] **Task 2.1**: [Description]
  - Files: [List]
  - Tests: [List]
  - Acceptance: [Criteria]

- [ ] **Task 2.2**: [Description]
  - Files: [List]
  - Tests: [List]
  - Acceptance: [Criteria]

### Verification
- [ ] [Check 1]
- [ ] [Check 2]

## Phase 3: [Name]

[Same structure]

## Final Checklist

### Code Quality
- [ ] All tests passing
- [ ] RuboCop passing
- [ ] No TODO comments left
- [ ] Code reviewed

### Documentation
- [ ] CLAUDE.md updated (if needed)
- [ ] README updated (if needed)
- [ ] Inline comments for complex logic
- [ ] Update this file with final notes

### Deployment
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Monitoring set up
- [ ] Team notified

## Notes

### Completed
- [Date]: [What was completed and any notes]

### Blockers
- [Date]: [What's blocking progress and how to resolve]

### Changes from Plan
- [Date]: [What changed and why]
```

## Step 6: Output

After creating the files, present to the user:

> **Development documentation created!**
>
> I've created three files in `dev/active/[task-name]/`:
>
> 1. **`[task-name]-plan.md`** - Strategic overview with phases and risks
> 2. **`[task-name]-context.md`** - Key decisions, files, and patterns
> 3. **`[task-name]-tasks.md`** - Detailed task checklist
>
> These files will survive context resets and serve as your source of truth throughout development.
>
> **Next steps**:
> - Review the plan and let me know if anything needs adjustment
> - Use `/dev-docs-update` to update these files as work progresses
> - Reference these files when resuming work after context resets

## Important Guidelines

- **Be specific**: Use actual file paths, class names, and code references
- **Be realistic**: Don't oversimplify complex tasks
- **Be comprehensive**: Include all phases, not just happy path
- **Be actionable**: Every task should have clear acceptance criteria
- **Be maintainable**: Docs should be easy to update as work progresses

## Context from CLAUDE.md

Reference CLAUDE.md for:
- Project conventions
- Common commands
- Testing patterns
- Architecture patterns

This ensures documentation aligns with project standards.
