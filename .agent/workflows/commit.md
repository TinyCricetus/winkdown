---
description: Create a compliant code commit using Angular Conventional Commits
---

# Commit Workflow

1. Check current status
// turbo
git status

2. Stage files (User Action Required)
   - Review the files listed above.
   - Run `git add <files>` for the changes you want to include.

3. Determine Commit Type
   - **feat**: A new feature
   - **fix**: A bug fix
   - **docs**: Documentation only changes
   - **style**: formatting
   - **refactor**: code change that neither fixes a bug nor adds a feature
   - **perf**: improves performance
   - **test**: adding missing tests
   - **chore**: build/auxiliary tools

4. Craft Commit Message
   - Format: `type(scope): subject`
   - Example: `fix(table): resolve cell merging index error`
   - **Scope** is optional but recommended (e.g., `table`, `toolbar`).

5. Commit Changes
   - Run the commit command with your message.
   - Example: `git commit -m "feat(core): initial setup"`
