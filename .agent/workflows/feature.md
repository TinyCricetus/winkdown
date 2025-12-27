---
description: Start a new feature development cycle
---

# Feature Development Workflow

1. Update Main Branch
// turbo
git checkout main && git pull

2. Create Feature Branch
   - Branch naming convention: `feat/feature-name` or `feature/feature-name`
   - Command: `git checkout -b feat/your-feature-name`

3. Standard Development Cycle
   - Write tests (if applicable)
   - Implement code
   - Verify with `npm start`

4. Completion
   - Run linter/type checks: `tsc --noEmit`
   - Commit changes using the Commit Workflow rules.
