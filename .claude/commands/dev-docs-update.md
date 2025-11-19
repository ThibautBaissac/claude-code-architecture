# Dev Docs Update Command

Update existing development documentation as work progresses.

---

## Your Task

The user wants to update development documentation for ongoing work.

## Step 1: Identify the Task

Ask which task to update:
- List available tasks in `dev/active/`
- Or accept task name from user

```bash
# List active dev docs
ls -la dev/active/
```

## Step 2: Read Current Documentation

Read all three files:
1. `dev/active/[task-name]/[task-name]-plan.md`
2. `dev/active/[task-name]/[task-name]-context.md`
3. `dev/active/[task-name]/[task-name]-tasks.md`

## Step 3: Assess Current State

Check:
```bash
# See recent changes
git log --oneline --since="1 week ago" | head -20

# See current branch
git branch --show-current

# Check modified files
git status

# Run tests
bundle exec rspec --format documentation
```

## Step 4: Gather Updates

Ask the user what has changed:
- Which tasks were completed?
- Were there any blockers or issues?
- Did the plan change?
- Any new decisions made?
- Any new risks discovered?

If user says "update based on recent work", analyze:
- Git commits since last update
- Modified files
- Test results
- Current branch state

## Step 5: Update the Files

### Update Plan File

Add new sections or update existing:

```markdown
## Updates

### [Date] - Progress Update
**Status**: [Phase X] in progress / [Phase X] completed

**Completed**:
- [Item 1]
- [Item 2]

**In Progress**:
- [Item 3]

**Blocked**:
- [Item 4]: [Reason and resolution plan]

**Risks Realized**:
- [Risk that actually happened and how it was handled]

**New Risks**:
- [Newly discovered risk]

**Changes to Plan**:
- [What changed from original plan and why]
```

### Update Context File

Add new decisions or learnings:

```markdown
## Recent Updates

### [Date] - New Decision: [Title]
**Context**: [Why this decision was needed]
**Decision**: [What was decided]
**Impact**: [How this affects the implementation]

---

### [Date] - Troubleshooting: [Issue]
**Problem**: [What went wrong]
**Root Cause**: [Why it happened]
**Solution**: [How it was fixed]
**Prevention**: [How to avoid in future]
```

Add newly modified files to Critical Files section.

### Update Tasks File

Update task checkboxes:
- Check off completed tasks
- Update progress percentage
- Add notes for completed items
- Document any blockers
- Add new tasks if scope changed

```markdown
## Notes

### [Date] - Completed Tasks
- ✅ Task 1.1: [Brief note about implementation]
- ✅ Task 1.2: [Any gotchas or learnings]

### [Date] - Blockers Resolved
- **Blocker**: [Description]
- **Resolution**: [How it was solved]
- **Lessons**: [What we learned]

### [Date] - Scope Changes
- **Added**: Task 2.3 - [Description and reason]
- **Removed**: Task 3.1 - [Description and reason]
```

## Step 6: Commit the Updates

After updating files:

```bash
# Commit the documentation updates
git add dev/active/[task-name]/
git commit -m "docs: update dev docs for [task-name] - [brief summary]"
```

## Step 7: Generate Status Report

Create a summary for the user:

```markdown
## Development Status Update

**Task**: [Task Name]
**Last Updated**: [Date]
**Overall Status**: [On Track / Behind Schedule / Ahead]
**Completion**: [X]%

### Completed Since Last Update
- [Item 1]
- [Item 2]

### In Progress
- [Item 3]: [X]% complete
- [Item 4]: [X]% complete

### Upcoming Next
- [Item 5]
- [Item 6]

### Blockers & Issues
[None / List of current blockers]

### Risks & Concerns
[None / List of active risks]

### Changes from Original Plan
[None / List of deviations and reasons]

### Key Learnings
- [Learning 1]
- [Learning 2]

### Next Steps
1. [Immediate next action]
2. [Following action]
3. [After that]

### Updated Files
- `dev/active/[task-name]/[task-name]-plan.md`
- `dev/active/[task-name]/[task-name]-context.md`
- `dev/active/[task-name]/[task-name]-tasks.md`
```

## Common Update Scenarios

### Scenario 1: Completed Phase
- Update plan status
- Check off all phase tasks
- Update progress percentage
- Document any deviations
- Preview next phase

### Scenario 2: Hit a Blocker
- Document blocker in tasks
- Add troubleshooting section to context
- Update risk assessment if needed
- Propose resolution plan

### Scenario 3: Scope Change
- Update plan with new requirements
- Add new tasks or remove obsolete ones
- Update effort estimates
- Document reason for change

### Scenario 4: Made Key Decision
- Add decision to context file
- Update plan if architecture changed
- Update affected tasks
- Note any new dependencies

### Scenario 5: Found Better Approach
- Document in context as a decision
- Update relevant tasks
- Keep record of why approach changed
- Update patterns section

## Update Checklist

Before finishing:
- [ ] All three files updated
- [ ] Timestamps updated
- [ ] Progress percentage accurate
- [ ] Completed tasks checked off
- [ ] New blockers documented
- [ ] Changes explained
- [ ] Next steps clear
- [ ] Files committed to git

## Smart Updates

### Analyze Git History
```bash
# See commits since task started
git log --oneline --since="[start date]" --grep="[task-name]"

# See changed files
git diff --name-only [branch-start]..HEAD

# See full diff
git diff [branch-start]..HEAD
```

### Analyze Test Coverage
```bash
# Run tests with coverage
COVERAGE=true bundle exec rspec

# Check coverage report
open coverage/index.html
```

### Check Code Quality
```bash
# Run RuboCop
bin/rubocop

# Check metrics
bin/rubocop --only Metrics
```

## Important Guidelines

- **Keep history**: Don't delete completed items, check them off
- **Be honest**: Document blockers and issues, not just successes
- **Be specific**: Use actual dates, commits, file paths
- **Be helpful**: Future you needs to understand what happened
- **Be concise**: Update only what changed

## Output Format

After updating, tell the user:

> **Development docs updated!**
>
> **Summary**:
> - Progress: [X]% → [Y]% complete
> - Completed: [N] tasks
> - New: [N] tasks added
> - Blockers: [N] resolved, [N] active
>
> **Files updated**:
> - `dev/active/[task-name]/[task-name]-plan.md`
> - `dev/active/[task-name]/[task-name]-context.md`
> - `dev/active/[task-name]/[task-name]-tasks.md`
>
> **Next focus**: [What to work on next]
>
> These updates are committed to git and ready for reference.

## Automation Opportunities

Consider offering:

```markdown
**Quick Actions**:
1. Continue with next task: [Task name]
2. Address current blocker: [Blocker]
3. Review and refine plan
4. Generate progress report for team

What would you like to do?
```

## Context Preservation

Remember: These docs survive context resets!

When returning after a reset:
1. Read all three files first
2. Check git status
3. See what was last worked on
4. Resume from current state

The dev docs are your memory across sessions.
