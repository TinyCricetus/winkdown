import React from 'react'
import { RenderElementProps, useSlateStatic } from 'slate-react'
import { TableElement, TableCellElement } from './types'
import { getColSpan, getRowSpan, getTableAbove } from './queries'
import './table.css'

/**
 * 表格组件
 */
export function Table(props: RenderElementProps) {
  const { attributes, children, element } = props
  const table = element as TableElement
  const colSizes = table.colSizes || []
  
  return (
    <div {...attributes} contentEditable={false} style={{ margin: '20px 0' }}>
      <table className="slate-table">
        <colgroup>
          {colSizes.map((width, index) => (
            <col key={index} style={{ width: `${width}px` }} />
          ))}
        </colgroup>
        <tbody contentEditable={true}>{children}</tbody>
      </table>
    </div>
  )
}

/**
 * 表格行组件
 */
export function TableRow(props: RenderElementProps) {
  const { attributes, children } = props
  
  return (
    <tr {...attributes} className="slate-table-row">
      {children}
    </tr>
  )
}

/**
 * 表格单元格组件
 */
export function TableCell(props: RenderElementProps) {
  const { attributes, children, element } = props
  const editor = useSlateStatic()
  const cell = element as TableCellElement
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number } | null>(null)
  
  const colSpan = getColSpan(cell)
  const rowSpan = getRowSpan(cell)
  
  const style: React.CSSProperties = {
    background: cell.background,
    borderTop: cell.borders?.top?.size 
      ? `${cell.borders.top.size}px ${cell.borders.top.style || 'solid'} ${cell.borders.top.color || '#ddd'}` 
      : undefined,
    borderRight: cell.borders?.right?.size
      ? `${cell.borders.right.size}px ${cell.borders.right.style || 'solid'} ${cell.borders.right.color || '#ddd'}`
      : undefined,
    borderBottom: cell.borders?.bottom?.size
      ? `${cell.borders.bottom.size}px ${cell.borders.bottom.style || 'solid'} ${cell.borders.bottom.color || '#ddd'}`
      : undefined,
    borderLeft: cell.borders?.left?.size
      ? `${cell.borders.left.size}px ${cell.borders.left.style || 'solid'} ${cell.borders.left.color || '#ddd'}`
      : undefined,
  }
  
  // 导入选区管理器和右键菜单
  const { getTableSelectionManager } = require('./selection')
  const { TableContextMenu } = require('./ContextMenu')
  const { ReactEditor } = require('slate-react')
  
  // 处理鼠标按下（开始框选）
  const handleMouseDown = (e: React.MouseEvent) => {
    // 只处理左键
    if (e.button !== 0) return
    
    const selectionManager = getTableSelectionManager()
    const path = ReactEditor.findPath(editor, element)
    
    // 按住 Shift 或 Ctrl 开始框选
    if (e.shiftKey || e.ctrlKey) {
      e.preventDefault()
      selectionManager.startSelection(editor, path)
    }
  }
  
  // 处理鼠标进入（更新框选范围）
  const handleMouseEnter = (e: React.MouseEvent) => {
    const selectionManager = getTableSelectionManager()
    
    // 只在按住鼠标左键时更新选区
    if (e.buttons === 1) {
      const path = ReactEditor.findPath(editor, element)
      selectionManager.updateSelection(path)
    }
  }
  
  // 处理鼠标松开（结束框选）
  const handleMouseUp = () => {
    const selectionManager = getTableSelectionManager()
    selectionManager.endSelection()
  }
  
  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const selectionManager = getTableSelectionManager()
    const path = ReactEditor.findPath(editor, element)
    
    // 如果右键的单元格不在选区内，清除之前的选区并选中当前单元格
    if (!selectionManager.hasSelection()) {
      selectionManager.clearSelection()
      selectionManager.startSelection(editor, path)
      selectionManager.endSelection()
    }
    
    setContextMenu({ x: e.clientX, y: e.clientY })
  }
  
  return (
    <>
      <td
        {...attributes}
        className="slate-table-cell"
        colSpan={colSpan}
        rowSpan={rowSpan}
        style={style}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        {children}
      </td>
      
      {contextMenu && (
        <TableContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  )
}

/**
 * 表格工具栏组件（简化版）
 */
export function TableToolbar() {
  const editor = useSlateStatic()
  const [isInTable, setIsInTable] = React.useState(false)
  const [showFullToolbar, setShowFullToolbar] = React.useState(false)
  
  React.useEffect(() => {
    const checkIfInTable = () => {
      const table = getTableAbove(editor)
      setIsInTable(!!table)
    }
    
    checkIfInTable()
    
    // 监听选区变化
    const interval = setInterval(checkIfInTable, 100)
    return () => clearInterval(interval)
  }, [editor])
  
  if (!isInTable) return null
  
  // 简化工具栏，只显示提示和快速操作
  if (!showFullToolbar) {
    return (
      <div className="table-toolbar table-toolbar-compact">
        <div className="toolbar-hint">
          💡 <strong>提示：</strong>右键单元格打开菜单，按住 <kbd>Shift</kbd> 或 <kbd>Ctrl</kbd> 拖拽鼠标框选多个单元格
        </div>
        <button
          className="toolbar-toggle"
          onMouseDown={(e) => {
            e.preventDefault()
            setShowFullToolbar(true)
          }}
          title="显示完整工具栏"
        >
          ⚙ 显示工具栏
        </button>
      </div>
    )
  }
  
  return (
    <div className="table-toolbar">
      <button
        className="toolbar-toggle"
        onMouseDown={(e) => {
          e.preventDefault()
          setShowFullToolbar(false)
        }}
        title="隐藏工具栏"
      >
        ✕
      </button>
      
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          const { insertTableRow } = require('./transforms')
          insertTableRow(editor, { above: true })
        }}
        title="在上方插入行"
      >
        ↑ 插入行
      </button>
      
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          const { insertTableRow } = require('./transforms')
          insertTableRow(editor, { above: false })
        }}
        title="在下方插入行"
      >
        ↓ 插入行
      </button>
      
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          const { insertTableColumn } = require('./transforms')
          insertTableColumn(editor, { before: true })
        }}
        title="在左侧插入列"
      >
        ← 插入列
      </button>
      
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          const { insertTableColumn } = require('./transforms')
          insertTableColumn(editor, { before: false })
        }}
        title="在右侧插入列"
      >
        → 插入列
      </button>
      
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          const { deleteRow } = require('./transforms')
          deleteRow(editor)
        }}
        title="删除行"
      >
        删除行
      </button>
      
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          const { deleteColumn } = require('./transforms')
          deleteColumn(editor)
        }}
        title="删除列"
      >
        删除列
      </button>
      
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          const { mergeCells } = require('./transforms')
          mergeCells(editor)
        }}
        title="合并单元格"
      >
        合并单元格
      </button>
      
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          const { splitCell } = require('./transforms')
          splitCell(editor)
        }}
        title="拆分单元格"
      >
        拆分单元格
      </button>
      
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          const { deleteTable } = require('./transforms')
          deleteTable(editor)
        }}
        title="删除表格"
        style={{ marginLeft: 'auto', background: '#ff4444', color: 'white' }}
      >
        删除表格
      </button>
    </div>
  )
}
