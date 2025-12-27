import React from 'react'
import { RenderElementProps, useSlateStatic, useSlate, ReactEditor } from 'slate-react'
import { Path } from 'slate'
import { TableElement, TableCellElement } from './types'
import { getColSpan, getRowSpan, getTableAbove } from './queries'
import { getTableSelectionManager } from './selection'
import { TableContextMenu } from './context-menu'
import { insertTableRow, insertTableColumn, deleteRow, deleteColumn, mergeCells, splitCell, deleteTable, setCellAlign } from './transforms'
import {
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Trash2,
    Merge,
    Split,
    X,
    AlignLeft,
    AlignCenter,
    AlignRight
} from 'lucide-react'
import './table.css'

/**
 * 表格组件
 */
export function Table(props: RenderElementProps) {
  const { attributes, children, element } = props
  const table = element as TableElement
  const colSizes = table.colSizes || []
  
  return (
    <div {...attributes} contentEditable={false} className="slate-table-wrapper">
      <table className="slate-table">
        <colgroup>
          {colSizes.map((width, index) => (
            <col key={index} style={{ width: `${width}px` }} />
          ))}
        </colgroup>
        <tbody contentEditable={true} suppressContentEditableWarning={true}>{children}</tbody>
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
    textAlign: cell.align || 'left',
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
  
  // TableSelectionManager, TableContextMenu 和 ReactEditor 已在文件顶部导入
  
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
    } else {
      // 记录起始单元格，准备可能的拖拽框选
      selectionManager.clearSelection()
      selectionManager.setStartCell(path)
    }
  }
  
  // 处理鼠标进入（更新框选范围）
  const handleMouseEnter = (e: React.MouseEvent) => {
    const selectionManager = getTableSelectionManager()
    
    // 只在按住鼠标左键时更新选区
    if (e.buttons === 1) {
      const path = ReactEditor.findPath(editor, element)
      
      if (selectionManager.isSelectingMode) {
        selectionManager.updateSelection(path)
      } else {
        // 检查是否从另一个单元格拖拽进入
        const startCell = selectionManager.getStartCell()
        if (startCell && !Path.equals(startCell, path)) {
           // 清除浏览器原生选区
           window.getSelection()?.removeAllRanges()
           // 触发框选模式
           selectionManager.startSelection(editor, startCell)
           selectionManager.updateSelection(path)
        }
      }
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
/**
 * 表格工具栏（悬浮式）
 */
export function TableToolbar() {
  const editor = useSlate()
  const tableEntry = getTableAbove(editor)
  const ref = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null)
  
  React.useLayoutEffect(() => {
    if (!tableEntry) {
      setPosition(null)
      return
    }

    const [tableNode] = tableEntry
    let animationFrameId: number

    const updatePosition = () => {
      try {
        const tableDom = ReactEditor.toDOMNode(editor as ReactEditor, tableNode)
        const containerDom = tableDom.closest('.winkdown-container') || document.documentElement // Fallback
        
        if (tableDom && containerDom && ref.current) {
          const tableRect = tableDom.getBoundingClientRect()
          
          // Use window/documentElement if fallback
          const isWindow = containerDom === document.documentElement
          const containerRect = isWindow 
            ? { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight, width: window.innerWidth, height: window.innerHeight }
            : containerDom.getBoundingClientRect()
            
          const toolbarRect = ref.current.getBoundingClientRect()
          
          // Calculate intersection between table and viewport/container to find "Visible Table Area"
          const intersectionLeft = Math.max(tableRect.left, containerRect.left)
          const intersectionRight = Math.min(tableRect.right, containerRect.right)
          
          // If not visible at all
          if (intersectionLeft >= intersectionRight) {
             // Optional: Hide or keep at closest edge? simpler to just keep at center of table or hide.
             // Let's hide if completely out of view? Or just fallback to table center.
             // For better UX, let's keep it calculated but it might be clipped.
             // Actually, if it's out of view, the user can't see the table anyway.
          }
          
          // Center the toolbar over the VISIBLE portion of the table
          const visibleCenter = (intersectionLeft + intersectionRight) / 2
          
          // Convert Client Coordinate (visibleCenter) to Container-Relative Coordinate
          // If container is window/body, scroll is window.scrollX
          const scrollLeft = isWindow ? window.scrollX : containerDom.scrollLeft
          const scrollTop = isWindow ? window.scrollY : containerDom.scrollTop
          const containerClientLeft = isWindow ? 0 : containerRect.left
          const containerClientTop = isWindow ? 0 : containerRect.top

          let toolLeft = visibleCenter - (toolbarRect.width / 2)
          
          // Clamp logic: Don't let the toolbar go beyond the table's actual edges (minus safety margin)
          // Client coordinates comparison
          const maxToolLeft = tableRect.right - toolbarRect.width
          const minToolLeft = tableRect.left
          
          // Apply clamping to the client coordinate
          toolLeft = Math.max(minToolLeft, Math.min(toolLeft, maxToolLeft))

          // Convert to relative style position
          const finalLeft = toolLeft - containerClientLeft + scrollLeft
          
          // Calculate Top (Always above table, or below if clipped top)
          // Default: Above
          let toolTopClient = tableRect.top - toolbarRect.height - 8
          
          // If top is clipped by container top
          if (toolTopClient < containerRect.top + 40) { // 40px buffer usually for header
             // Flip to bottom? Or stick to top of view?
             // Let's Flip to Bottom of table usually, or just top of visible area?
             // "Below the first row" is sometimes better.
             // Simple logic: If header is cut off, show below table?
             // Let's stick to: If above is cut off, place inside top of table? No that covers content.
             // Place below table?
             // Let's try: Place below table node if top is tight? 
             // Or fixed to top of view?
             // Let's use the provided logic: move to bottom if top is clipped.
             if (tableRect.top < containerRect.top) {
                 // Table is scrolled up.
                 // We want the toolbar to be accessible.
                 // Sticky Header style: Place it at containerRect.top + padding
                 toolTopClient = Math.max(toolTopClient, containerRect.top + 5)
                 // But don't go past the bottom of the table
                 toolTopClient = Math.min(toolTopClient, tableRect.bottom - toolbarRect.height - 5)
             }
          }
          
          const finalTop = toolTopClient - containerClientTop + scrollTop

          setPosition({ top: finalTop, left: finalLeft })
        }
      } catch (e) {
        // Ignore errors
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = requestAnimationFrame(updatePosition)
    }

    // Initial update
    updatePosition()

    // Add listeners
    window.addEventListener('resize', onScroll)
    
    let scrollContainer: Element | Window = window
    
    try {
      // Try to find the specific container to attach scroll listener
      // This might throw if the table hasn't been fully mounted yet
      const tableDom = ReactEditor.toDOMNode(editor as ReactEditor, tableNode)
      const containerDom = tableDom.closest('.winkdown-container')
      if (containerDom) {
        scrollContainer = containerDom
      }
    } catch (e) {
      // If table DOM not found, we fallback to window (already set) or just ignore
    }
    
    scrollContainer.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', onScroll)
      scrollContainer.removeEventListener('scroll', onScroll)
    }
  }, [editor, tableEntry]) // Re-run when selection or table changes

  if (!tableEntry) return null

  return (
    <div 
      ref={ref}
      className="table-toolbar"
      style={{
        top: position ? `${position.top}px` : '-9999px',
        left: position ? `${position.left}px` : '-9999px',
        visibility: position ? 'visible' : 'hidden',
        opacity: position ? 1 : 0
      }}
    >
      <div className="toolbar-group">
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            insertTableRow(editor, { above: true })
          }}
          title="在上方插入行"
          className="toolbar-btn"
        >
          <ArrowUp size={16} />
        </button>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            insertTableRow(editor, { above: false })
          }}
          title="在下方插入行"
          className="toolbar-btn"
        >
          <ArrowDown size={16} />
        </button>
      </div>

      <div className="separator" />

      <div className="toolbar-group">
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            insertTableColumn(editor, { before: true })
          }}
          title="在左侧插入列"
          className="toolbar-btn"
        >
          <ArrowLeft size={16} />
        </button>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            insertTableColumn(editor, { before: false })
          }}
          title="在右侧插入列"
          className="toolbar-btn"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="separator" />
      
      <div className="toolbar-group">
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            deleteRow(editor)
          }}
          title="删除行"
          className="toolbar-btn danger-hover"
        >
          <div className="icon-stack">
            <span style={{ fontSize: 10, fontWeight: 700 }}>Row</span>
            <X size={14} className="overlay-icon" />
          </div>
        </button>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            deleteColumn(editor)
          }}
          title="删除列"
          className="toolbar-btn danger-hover"
        >
          <div className="icon-stack">
            <span style={{ fontSize: 10, fontWeight: 700 }}>Col</span>
            <X size={14} className="overlay-icon" />
          </div>
        </button>
      </div>

      <div className="separator" />
      
      <div className="toolbar-group">
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            mergeCells(editor)
          }}
          title="合并单元格"
          className="toolbar-btn"
        >
          <Merge size={16} />
        </button>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            splitCell(editor)
          }}
          title="拆分单元格"
          className="toolbar-btn"
        >
          <Split size={16} />
        </button>
      </div>

      <div className="separator" />
      
      {/* 对齐按钮 */}
      <div className="toolbar-group">
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            setCellAlign(editor, 'left')
          }}
          title="左对齐"
          className="toolbar-btn"
        >
          <AlignLeft size={16} />
        </button>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            setCellAlign(editor, 'center')
          }}
          title="居中对齐"
          className="toolbar-btn"
        >
          <AlignCenter size={16} />
        </button>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            setCellAlign(editor, 'right')
          }}
          title="右对齐"
          className="toolbar-btn"
        >
          <AlignRight size={16} />
        </button>
      </div>

      <div className="separator" />
      
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          deleteTable(editor)
        }}
        title="删除表格"
        className="toolbar-btn danger"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
