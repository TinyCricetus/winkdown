import { useEffect, useRef } from 'react'
import { useSlateStatic } from 'slate-react'
import { getTableSelectionManager } from './selection'
import './context-menu.css'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
}

/**
 * 表格右键菜单组件
 */
export function TableContextMenu({ x, y, onClose }: ContextMenuProps) {
  const editor = useSlateStatic()
  const menuRef = useRef<HTMLDivElement>(null)
  const selectionManager = getTableSelectionManager()
  const hasSelection = selectionManager.hasSelection()
  
  // 点击菜单外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])
  
  // 按 ESC 关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])
  
  const handleAction = (action: () => void) => {
    action()
    onClose()
  }
  
  return (
    <div
      ref={menuRef}
      className="table-context-menu"
      style={{
        left: `${x}px`,
        top: `${y}px`
      }}
    >
      {/* 单元格操作 */}
      <div className="menu-section">
        <div className="menu-section-title">单元格</div>
        <button
          className="menu-item"
          disabled={!hasSelection}
          onMouseDown={(e) => {
            e.preventDefault()
            handleAction(() => {
              const { mergeCells } = require('./transforms')
              mergeCells(editor)
            })
          }}
        >
          <span className="menu-icon">⛶</span>
          <span>合并单元格</span>
          {!hasSelection && <span className="menu-hint">需选中多个单元格</span>}
        </button>
        
        <button
          className="menu-item"
          onMouseDown={(e) => {
            e.preventDefault()
            handleAction(() => {
              const { splitCell } = require('./transforms')
              splitCell(editor)
            })
          }}
        >
          <span className="menu-icon">⊞</span>
          <span>拆分单元格</span>
        </button>
      </div>
      
      <div className="menu-divider" />
      
      {/* 行操作 */}
      <div className="menu-section">
        <div className="menu-section-title">行操作</div>
        <button
          className="menu-item"
          onMouseDown={(e) => {
            e.preventDefault()
            handleAction(() => {
              const { insertTableRow } = require('./transforms')
              insertTableRow(editor, { above: true })
            })
          }}
        >
          <span className="menu-icon">↑</span>
          <span>在上方插入行</span>
        </button>
        
        <button
          className="menu-item"
          onMouseDown={(e) => {
            e.preventDefault()
            handleAction(() => {
              const { insertTableRow } = require('./transforms')
              insertTableRow(editor, { above: false })
            })
          }}
        >
          <span className="menu-icon">↓</span>
          <span>在下方插入行</span>
        </button>
        
        <button
          className="menu-item menu-item-danger"
          onMouseDown={(e) => {
            e.preventDefault()
            handleAction(() => {
              const { deleteRow } = require('./transforms')
              deleteRow(editor)
            })
          }}
        >
          <span className="menu-icon">🗑</span>
          <span>删除行</span>
        </button>
      </div>
      
      <div className="menu-divider" />
      
      {/* 列操作 */}
      <div className="menu-section">
        <div className="menu-section-title">列操作</div>
        <button
          className="menu-item"
          onMouseDown={(e) => {
            e.preventDefault()
            handleAction(() => {
              const { insertTableColumn } = require('./transforms')
              insertTableColumn(editor, { before: true })
            })
          }}
        >
          <span className="menu-icon">←</span>
          <span>在左侧插入列</span>
        </button>
        
        <button
          className="menu-item"
          onMouseDown={(e) => {
            e.preventDefault()
            handleAction(() => {
              const { insertTableColumn } = require('./transforms')
              insertTableColumn(editor, { before: false })
            })
          }}
        >
          <span className="menu-icon">→</span>
          <span>在右侧插入列</span>
        </button>
        
        <button
          className="menu-item menu-item-danger"
          onMouseDown={(e) => {
            e.preventDefault()
            handleAction(() => {
              const { deleteColumn } = require('./transforms')
              deleteColumn(editor)
            })
          }}
        >
          <span className="menu-icon">🗑</span>
          <span>删除列</span>
        </button>
      </div>
      
      <div className="menu-divider" />
      
      {/* 表格操作 */}
      <div className="menu-section">
        <button
          className="menu-item menu-item-danger"
          onMouseDown={(e) => {
            e.preventDefault()
            if (confirm('确定要删除整个表格吗？')) {
              handleAction(() => {
                const { deleteTable } = require('./transforms')
                deleteTable(editor)
              })
            }
          }}
        >
          <span className="menu-icon">⚠</span>
          <span>删除表格</span>
        </button>
      </div>
    </div>
  )
}
