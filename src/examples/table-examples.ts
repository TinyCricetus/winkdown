/**
 * 表格功能测试示例
 * 
 * 这个文件展示了如何使用表格的各种功能
 */

import { Editor } from 'slate'
import {
    insertTable,
    deleteTable,
    insertTableRow,
    insertTableColumn,
    deleteRow, mergeCells,
    splitCell,
    setColumnWidth
} from '../table'

/**
 * 示例 1: 插入一个简单的表格
 */
export function example1InsertTable(editor: Editor) {
  // 插入一个 3x3 的表格，每列宽度为 150px
  insertTable(editor, {
    rowCount: 3,
    colCount: 3,
    colWidth: 150
  })
}

/**
 * 示例 2: 插入一个大表格
 */
export function example2InsertLargeTable(editor: Editor) {
  // 插入一个 5x6 的表格
  insertTable(editor, {
    rowCount: 5,
    colCount: 6,
    colWidth: 120
  })
}

/**
 * 示例 3: 在表格中插入行
 */
export function example3InsertRow(editor: Editor) {
  // 在当前行上方插入一行
  insertTableRow(editor, { above: true })
  
  // 在当前行下方插入一行
  // insertTableRow(editor, { above: false })
}

/**
 * 示例 4: 在表格中插入列
 */
export function example4InsertColumn(editor: Editor) {
  // 在当前列左侧插入一列
  insertTableColumn(editor, { before: true })
  
  // 在当前列右侧插入一列
  // insertTableColumn(editor, { before: false })
}

/**
 * 示例 5: 删除行和列
 */
export function example5DeleteRowColumn(editor: Editor) {
  // 删除当前行
  deleteRow(editor)
  
  // 或者删除当前列
  // deleteColumn(editor)
}

/**
 * 示例 6: 合并单元格
 * 
 * 使用步骤：
 * 1. 用鼠标选中多个相邻的单元格
 * 2. 调用 mergeCells 函数
 * 3. 选中的单元格会合并为一个大单元格
 */
export function example6MergeCells(editor: Editor) {
  // 选中多个单元格后，调用此函数合并
  mergeCells(editor)
}

/**
 * 示例 7: 拆分已合并的单元格
 * 
 * 使用步骤：
 * 1. 将光标放在已合并的单元格中
 * 2. 调用 splitCell 函数
 * 3. 合并的单元格会拆分回原来的多个单元格
 */
export function example7SplitCell(editor: Editor) {
  // 在已合并的单元格中，调用此函数拆分
  splitCell(editor)
}

/**
 * 示例 8: 设置列宽
 */
export function example8SetColumnWidth(editor: Editor) {
  // 设置第 0 列的宽度为 200px
  setColumnWidth(editor, 0, 200)
  
  // 设置第 1 列的宽度为 300px
  setColumnWidth(editor, 1, 300)
}

/**
 * 示例 9: 删除整个表格
 */
export function example9DeleteTable(editor: Editor) {
  // 删除当前光标所在的表格
  deleteTable(editor)
}

/**
 * 示例 10: 创建一个带内容的表格
 * 
 * 这个示例展示了如何程序化创建表格结构
 */
export function example10CreateTableWithContent() {
  return {
    type: 'table',
    colSizes: [150, 200, 150],
    children: [
      // 第一行（表头）
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            background: '#f0f0f0',
            children: [
              { type: 'paragraph', children: [{ text: '姓名', bold: true }] }
            ]
          },
          {
            type: 'table-cell',
            background: '#f0f0f0',
            children: [
              { type: 'paragraph', children: [{ text: '邮箱', bold: true }] }
            ]
          },
          {
            type: 'table-cell',
            background: '#f0f0f0',
            children: [
              { type: 'paragraph', children: [{ text: '电话', bold: true }] }
            ]
          }
        ]
      },
      // 第二行
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [
              { type: 'paragraph', children: [{ text: '张三' }] }
            ]
          },
          {
            type: 'table-cell',
            children: [
              { type: 'paragraph', children: [{ text: 'zhangsan@example.com' }] }
            ]
          },
          {
            type: 'table-cell',
            children: [
              { type: 'paragraph', children: [{ text: '138-1234-5678' }] }
            ]
          }
        ]
      },
      // 第三行
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [
              { type: 'paragraph', children: [{ text: '李四' }] }
            ]
          },
          {
            type: 'table-cell',
            children: [
              { type: 'paragraph', children: [{ text: 'lisi@example.com' }] }
            ]
          },
          {
            type: 'table-cell',
            children: [
              { type: 'paragraph', children: [{ text: '139-8765-4321' }] }
            ]
          }
        ]
      }
    ]
  }
}

/**
 * 示例 11: 创建带合并单元格的表格
 */
export function example11CreateMergedCellTable() {
  return {
    type: 'table',
    colSizes: [150, 150, 150],
    children: [
      // 第一行
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            colSpan: 3,  // 合并 3 列
            background: '#e6f7ff',
            children: [
              { type: 'paragraph', children: [{ text: '表头（合并了 3 列）', bold: true }] }
            ]
          }
        ]
      },
      // 第二行
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            rowSpan: 2,  // 合并 2 行
            background: '#f0f0f0',
            children: [
              { type: 'paragraph', children: [{ text: '左侧（合并了 2 行）' }] }
            ]
          },
          {
            type: 'table-cell',
            children: [
              { type: 'paragraph', children: [{ text: '中间' }] }
            ]
          },
          {
            type: 'table-cell',
            children: [
              { type: 'paragraph', children: [{ text: '右侧' }] }
            ]
          }
        ]
      },
      // 第三行（注意：第一列被上面的 rowSpan 占用了）
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [
              { type: 'paragraph', children: [{ text: '中间 2' }] }
            ]
          },
          {
            type: 'table-cell',
            children: [
              { type: 'paragraph', children: [{ text: '右侧 2' }] }
            ]
          }
        ]
      }
    ]
  }
}

/**
 * 使用说明：
 * 
 * 1. 在编辑器组件中导入这些示例函数
 * 2. 在需要的地方调用它们
 * 3. 例如：
 * 
 *    import { example1InsertTable } from './examples/table-examples'
 * 
 *    <button onClick={() => example1InsertTable(editor)}>
 *      插入表格
 *    </button>
 */
