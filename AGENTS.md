# Repository Guidelines

## 项目结构与模块组织
源码位于 `src/`。编辑器核心组件在 `src/components/`（如 `winkdown.tsx`、`toolbar.tsx`），表格相关逻辑在 `src/table/`（包含 transforms、queries、selection 与样式）。共享类型与常量在 `src/constants.ts` 和 `src/types.d.ts`。静态资源在 `src/assets/` 和 `public/`。入口为 `index.html` 与 `src/index.tsx`，构建配置在 `vite.config.ts` 与 `tsconfig.json`。

## 构建、测试与开发命令
- `pnpm install`（或 `npm install`/`yarn install`）：安装依赖。
- `pnpm dev` 或 `pnpm start`：启动 Vite 开发服务器。
- `pnpm build`：先执行 `tsc`，再由 Vite 产出构建产物。
- `pnpm preview`：本地预览生产构建。
当前未配置 `test` 脚本。

## 编码风格与命名约定
项目使用 TypeScript + React。遵循现有风格：2 空格缩进、单引号、无分号。文件名使用 kebab-case（如 `status-bar.tsx`、`with-table.ts`），组件用 PascalCase，Hook 使用 `useX` 命名。组件样式文件与组件同目录（如 `toolbar.tsx` + `toolbar.css`）。

## 测试指南
尚未引入测试框架。如需新增，建议使用 Vitest + React Testing Library，测试文件放在 `src/**/__tests__/` 或 `*.test.tsx`，并补充 `pnpm test` 脚本。重点覆盖编辑器行为、快捷键与表格变换逻辑。

## 协作语言
项目协作统一使用中文，包括思考与交流、issue、PR 描述、代码评审说明与文档更新。

## 提交与 PR 规范
提交信息使用中文并遵循 Angular 规范：`type(scope): subject`。示例：`feat(table): 新增列宽拖拽`、`fix(editor): 修复回车换行异常`、`docs(workflow): 更新提交流程`。PR 需包含简要说明、测试方式（如 `pnpm dev`）以及 UI 变更截图或动图，并尽量关联相关 issue。
