# Winkdown 表格功能使用说明

## 功能概述

已成功为 Winkdown 编辑器实现了完整的表格功能，包括：

✅ **插入表格** - 点击工具栏按钮插入 3x3 表格  
✅ **合并单元格** - 选中多个单元格后合并  
✅ **拆分单元格** - 拆分已合并的单元格  
✅ **插入/删除行** - 在上方或下方插入行，删除当前行  
✅ **插入/删除列** - 在左侧或右侧插入列，删除当前列  
✅ **删除表格** - 删除整个表格  
✅ **现代化 UI** - 精美的渐变工具栏和交互效果

## 如何使用

### 1. 启动项目

```bash
cd d:\workspace\winkdown
npm run dev
```

然后在浏览器中访问：`http://localhost:8080`

### 2. 插入表格

在编辑器顶部有一个紫色渐变工具栏，点击 **"📊 插入表格"** 按钮，会自动插入一个 3x3 的表格。

### 3. 表格操作

当光标在表格内时，会自动显示表格工具栏，包含以下按钮：

- **↑ 插入行** - 在当前行上方插入新行
- **↓ 插入行** - 在当前行下方插入新行
- **← 插入列** - 在当前列左侧插入新列
- **→ 插入列** - 在当前列右侧插入新列
- **删除行** - 删除当前行
- **删除列** - 删除当前列
- **合并单元格** - 合并选中的多个单元格
- **拆分单元格** - 拆分已合并的单元格
- **删除表格** - 删除整个表格（红色按钮）

### 4. 合并单元格

1. 用鼠标选中要合并的多个单元格
2. 点击工具栏中的 **"合并单元格"** 按钮
3. 选中的单元格会合并为一个单元格，并保留所有内容

### 5. 拆分单元格

1. 将光标放在已合并的单元格中
2. 点击工具栏中的 **"拆分单元格"** 按钮
3. 合并的单元格会拆分回原来的多个单元格

## 技术实现

### 项目结构

```
src/
├── table/
│   ├── types.ts           # 表格相关类型定义
│   ├── queries.ts         # 表格查询工具函数
│   ├── transforms.ts      # 表格转换操作（插入、删除、合并等）
│   ├── components.tsx     # 表格 React 组件
│   ├── table.css          # 表格样式
│   └── index.ts           # 导出接口
├── constants.ts           # 更新：添加表格类型
├── types.d.ts             # 更新：添加表格到 Slate 类型系统
└── components/
    └── winkdown.tsx       # 更新：集成表格功能
```

### 核心功能

#### 1. 表格数据结构

```typescript
// 表格元素
{
  type: 'table',
  colSizes: [150, 150, 150],  // 列宽数组
  children: [/* 表格行 */]
}

// 表格行
{
  type: 'table-row',
  children: [/* 单元格 */]
}

// 单元格
{
  type: 'table-cell',
  colSpan: 2,    // 列合并数
  rowSpan: 1,    // 行合并数
  children: [/* 内容 */]
}
```

#### 2. 主要 API

**插入表格**
```typescript
insertTable(editor, { 
  rowCount: 3, 
  colCount: 3,
  colWidth: 150 
})
```

**合并单元格**
```typescript
mergeCells(editor)  // 合并选中的单元格
```

**拆分单元格**
```typescript
splitCell(editor)   // 拆分当前单元格
```

**插入行/列**
```typescript
insertTableRow(editor, { above: true })      // 在上方插入行
insertTableColumn(editor, { before: true })  // 在左侧插入列
```

**删除行/列**
```typescript
deleteRow(editor)     // 删除当前行
deleteColumn(editor)  // 删除当前列
```

#### 3. 查询函数

```typescript
getTableAbove(editor)        // 获取当前表格
getCellAbove(editor)         // 获取当前单元格
getRowAbove(editor)          // 获取当前行
getColSpan(cell)             // 获取列合并数
getRowSpan(cell)             // 获取行合并数
getTableColumnCount(table)   // 获取列数
buildTableGrid(table)        // 构建表格网格（用于合并）
```

## 样式特点

### 现代化设计

- **渐变工具栏**：紫色渐变背景，视觉效果优雅
- **悬停动效**：按钮悬停时上移并放大
- **阴影效果**：多层阴影增强立体感
- **圆角设计**：柔和的圆角边框
- **响应式布局**：适配移动端和桌面端

### CSS 亮点

```css
/* 工具栏渐变 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 按钮悬停效果 */
transform: translateY(-2px) scale(1.05);
box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);

/* 单元格选中状态 */
background-color: #e6f7ff;
outline: 2px solid #1890ff;
```

## 参考源码

实现参考了 `_slate-table` 目录中的完整表格插件源码，该插件来自于 [@udecode/plate-table](https://github.com/udecode/plate)。

## 已知限制

1. 表格宽度调整功能需要额外实现拖拽调整列宽
2. 单元格背景色和边框样式设置需要额外的 UI 控件
3. 复杂的表格嵌套场景需要更多测试

## 下一步优化建议

1. **列宽拖拽调整**：实现鼠标拖拽调整列宽
2. **右键菜单**：添加表格操作的右键菜单
3. **快捷键支持**：添加 Tab 键在单元格间导航
4. **样式设置面板**：添加单元格背景色、边框样式设置
5. **表格模板**：提供预设的表格样式模板
6. **导入导出**：支持从 Excel/CSV 导入，导出 HTML 表格

## 测试方法

1. 启动开发服务器：`npm run dev`
2. 打开浏览器访问：`http://localhost:8080`
3. 点击 "📊 插入表格" 按钮
4. 在表格中输入内容
5. 尝试各种操作：
   - 插入/删除行列
   - 合并/拆分单元格
   - 删除表格

## 代码质量

- ✅ TypeScript 类型安全
- ✅ 模块化设计
- ✅ 函数式编程风格
- ✅ 详细的注释
- ✅ 遵循 Slate 最佳实践

---

**总结**：表格功能已完整实现，支持所有基本操作和单元格合并/拆分。UI 采用现代化设计，交互流畅，代码结构清晰。
