# Winkdown Project Rules & Guidelines

## 0. Communication Standards
- **Primary Language**: **Chinese (Simplified)**.
- **Scope**: All conversations, documentation updates, and commit message bodies must be in Chinese.

## 1. Project Overview
**Winkdown** is a specialized markdown editor built with **React** and **Slate.js**, focused on providing a rich, seamless writing experience.

## 2. Technology Stack
- **Runtime**: Browser / Node.js (Dev)
- **Core Framework**: React 18+ (Hooks-based)
- **Language**: TypeScript 5+ (Strict Mode)
- **Build Tool**: Vite 5+ (ES Modules)
- **Editor Engine**: Slate.js (0.101.5+)
- **Script Runner**: tsx (for scripts like `start.ts`)

## 3. Coding Standards
### General
- **Functional Paradigm**: Prefer pure functions.
- **Clean Code**: Keep functions small.

### File Naming
- **Convention**: Use **kebab-case** (lowercase with hyphens) for all filenames (e.g., `context-menu.tsx`, `table-examples.ts`).

### TypeScript
- **No Any**: Avoid `any`.
- **Slate Custom Types**: Ensure custom nodes are strictly typed.

### React
- **Components**: Use Functional Components.
- **Hooks**: Extract complex logic.

### Slate.js Best Practices
- **Transforms**: Use `Transforms` for mutations.
- **Selection**: Check `editor.selection` before use.

## 4. Migration Notes (Webpack -> Vite)
- **Globals**: Use `import.meta.env`.
- **Imports**: Use ESM `import`.
