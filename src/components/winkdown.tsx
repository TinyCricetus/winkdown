import { useMemo, KeyboardEvent, useCallback, useState } from 'react'
import './winkdown.css'
import { Editable, RenderElementProps, RenderLeafProps, Slate, withReact, useSlateStatic, ReactEditor } from 'slate-react'
import { Descendant, Editor, Element, Transforms, createEditor, Text, Range, Point, Node, Path } from 'slate'
import { ListElement, HeadingElement, FormattedText } from '../constants'
import { Table, TableRow, TableCell, TableToolbar, insertTable } from '../table'

const initValue: Descendant[] = [
  {
    type: 'heading',
    level: 1,
    children: [{ text: '欢迎使用 Winkdown 编辑器' }]
  },
  {
    type: 'paragraph',
    children: [{ text: '这是一个功能丰富的富文本编辑器。试试以下功能：' }]
  },
  {
    type: 'order-list',
    indent: 0,
    uuid: generateUuid(),
    children: [{ text: '输入 # 创建标题' }]
  },
  {
    type: 'order-list',
    indent: 0,
    uuid: generateUuid(),
    children: [{ text: '输入 > 创建引用' }]
  },
  {
    type: 'order-list',
    indent: 0,
    uuid: generateUuid(),
    children: [{ text: '输入 ``` 创建代码块' }]
  },
  {
    type: 'order-list',
    indent: 0,
    uuid: generateUuid(),
    children: [{ text: '使用 Tab 缩进列表' }]
  },
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
]

function generateUuid() {
  return Math.random().toString(36).substring(2, 15)
}

function renderElement(props: RenderElementProps) {
  const { attributes, children, element } = props
  const { type } = element

  switch (type) {
    case 'heading':
      return <HeadingComponent {...props} />
    case 'order-list':
    case 'bullet-list':
      return <ListComponent {...props} />
    case 'quote':
      return <QuoteComponent {...props} />
    case 'code':
      return <CodeComponent {...props} />
    case 'table':
      return <Table {...props} />
    case 'table-row':
      return <TableRow {...props} />
    case 'table-cell':
      return <TableCell {...props} />
    default:
      return <ParagraphComponent {...props} />
  }
}

function renderLeaf(props: RenderLeafProps) {
  const { attributes, children, leaf } = props
  let content = children

  if (leaf.bold) {
    content = <strong>{content}</strong>
  }
  if (leaf.italic) {
    content = <em>{content}</em>
  }
  if (leaf.underline) {
    content = <u>{content}</u>
  }
  if (leaf.code) {
    content = <code className="inline-code">{content}</code>
  }

  return <span {...attributes}>{content}</span>
}

function ParagraphComponent(props: RenderElementProps) {
  const { attributes, children } = props
  return <p {...attributes} className="paragraph">{children}</p>
}

function HeadingComponent(props: RenderElementProps) {
  const { attributes, children, element } = props
  const { level } = element as HeadingElement
  const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
  const Tag = headingTags[level - 1]
  
  switch (level) {
    case 1:
      return <h1 {...attributes} className={`heading heading-${level}`}>{children}</h1>
    case 2:
      return <h2 {...attributes} className={`heading heading-${level}`}>{children}</h2>
    case 3:
      return <h3 {...attributes} className={`heading heading-${level}`}>{children}</h3>
    case 4:
      return <h4 {...attributes} className={`heading heading-${level}`}>{children}</h4>
    case 5:
      return <h5 {...attributes} className={`heading heading-${level}`}>{children}</h5>
    case 6:
      return <h6 {...attributes} className={`heading heading-${level}`}>{children}</h6>
    default:
      return <h1 {...attributes} className={`heading heading-${level}`}>{children}</h1>
  }
}

function ListComponent(props: RenderElementProps) {
  const { attributes, children, element } = props
  const editor = useSlateStatic()
  const { type, indent } = element as ListElement
  
  // 计算当前列表项的序号
  const index = useMemo(() => {
    try {
      const currentPath = ReactEditor.findPath(editor, element)
      
      // 遍历文档中的所有节点，找到所有相同类型和缩进的列表项
      let count = 0
      
      for (const [node, path] of Editor.nodes(editor, {
        at: [],
        match: n => {
          if (!Element.isElement(n)) return false
          if (n.type !== 'order-list' && n.type !== 'bullet-list') return false
          const listNode = n as ListElement
          return listNode.type === type && listNode.indent === indent
        }
      })) {
        count++
        // 如果找到当前节点，返回计数
        if (Path.equals(path, currentPath)) {
          return count
        }
      }
      
      // 如果没找到（不应该发生），返回1
      return 1
    } catch {
      return 1
    }
  }, [editor, element, type, indent])

  const isOrdered = type === 'order-list'
  const marker = isOrdered ? `${index}.` : '•'

  return (
    <div {...attributes} className={`list-item ${type}`} style={{ paddingLeft: `${indent * 2}em` }}>
      <span className="list-marker">{marker}</span>
      <span className="list-content">{children}</span>
    </div>
  )
}

function QuoteComponent(props: RenderElementProps) {
  const { attributes, children } = props
  return (
    <blockquote {...attributes} className="quote">
      {children}
    </blockquote>
  )
}

function CodeComponent(props: RenderElementProps) {
  const { attributes, children } = props
  return (
    <pre {...attributes} className="code-block">
      <code>{children}</code>
    </pre>
  )
}

export function Winkdown() {
  const editor = useMemo(() => withReact(createEditor()), [])

  const toggleFormat = useCallback((format: 'bold' | 'italic' | 'underline' | 'code') => {
    const isActive = isFormatActive(editor, format)
    Transforms.setNodes(
      editor,
      { [format]: isActive ? null : true },
      { match: Text.isText, split: true }
    )
  }, [editor])

  const isFormatActive = (editor: Editor, format: 'bold' | 'italic' | 'underline' | 'code') => {
    const marks = Editor.marks(editor) as Partial<FormattedText> | null
    return marks ? (marks[format] === true) : false
  }

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    const { selection } = editor
    if (!selection) return

    // Tab 键处理列表缩进
    if (event.key === 'Tab') {
      event.preventDefault()
      const [match] = Editor.nodes(editor, {
        match: node => Element.isElement(node) && (node.type === 'order-list' || node.type === 'bullet-list')
      })

      if (match) {
        const node = match[0] as ListElement
        let indent = node.indent || 0
        if (event.shiftKey) {
          indent = Math.max(0, indent - 1)
        } else {
          indent = Math.min(indent + 1, 10) // 限制最大缩进
        }
        Transforms.setNodes(editor, { indent })
        return
      }
    }

    // Enter 键处理
    if (event.key === 'Enter') {
      const [match] = Editor.nodes(editor, {
        match: node => Element.isElement(node) && (node.type === 'order-list' || node.type === 'bullet-list')
      })

      if (match) {
        const [node, path] = match
        const listNode = node as ListElement
        const { selection } = editor
        
        if (selection && Range.isCollapsed(selection)) {
          const [lineNode] = Editor.node(editor, selection.anchor.path.slice(0, -1))
          const isEmpty = Node.string(lineNode).trim() === ''
          
          if (isEmpty) {
            event.preventDefault()
            // 如果当前行为空，转换为段落
            Transforms.setNodes(editor, { type: 'paragraph' })
            Transforms.unwrapNodes(editor, {
              match: n => Element.isElement(n) && (n.type === 'order-list' || n.type === 'bullet-list')
            })
            return
          } else {
            // 如果当前行不为空，创建新的列表项
            event.preventDefault()
            const newListItem: ListElement = {
              type: listNode.type,
              indent: listNode.indent || 0,
              uuid: generateUuid(),
              children: [{ text: '' }]
            }
            // 在当前位置插入新节点
            Transforms.insertNodes(editor, newListItem)
            // 移动光标到新节点
            Transforms.move(editor)
            return
          }
        }
      }
    }

    // Backspace 键处理
    if (event.key === 'Backspace') {
      const { selection } = editor
      if (!selection || !Range.isCollapsed(selection)) return

      // 处理列表项
      const [listMatch] = Editor.nodes(editor, {
        match: node => Element.isElement(node) && (node.type === 'order-list' || node.type === 'bullet-list')
      })

      if (listMatch && selection) {
        const [node, path] = listMatch
        const start = Editor.start(editor, path)
        
        if (Point.equals(selection.anchor, start)) {
          event.preventDefault()
          // 在列表项开头按退格，转换为段落
          Transforms.setNodes(editor, { type: 'paragraph' })
          Transforms.unwrapNodes(editor, {
            match: n => Element.isElement(n) && (n.type === 'order-list' || n.type === 'bullet-list')
          })
          return
        }
      }

      // 处理标题、引用、代码块：内容为空时转换为段落
      const [blockMatch] = Editor.nodes(editor, {
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
        mode: 'lowest'
      })

      if (blockMatch) {
        const [block, path] = blockMatch
        
        if (Element.isElement(block)) {
          const blockType = block.type
          
          // 检查是否是特殊块类型（标题、引用、代码块）
          if (blockType === 'heading' || blockType === 'quote' || blockType === 'code') {
            const blockText = Node.string(block).trim()
            const start = Editor.start(editor, path)
            const isAtStart = Point.equals(selection.anchor, start)
            
            // 如果内容为空且光标在开头，转换为段落
            if (blockText === '' && isAtStart) {
              event.preventDefault()
              // 转换为段落，移除特殊属性
              Transforms.setNodes(editor, { type: 'paragraph' }, { at: path })
              return
            }
          }
        }
      }
    }

    // Markdown 风格快捷键 - 按空格键触发
    if (event.key === ' ') {
      const { selection } = editor
      if (!selection || !Range.isCollapsed(selection)) return

      // 获取当前块级元素
      const [blockMatch] = Editor.nodes(editor, {
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
        mode: 'lowest'
      })

      if (blockMatch) {
        const [block, blockPath] = blockMatch
        
        // 只在段落类型时允许 Markdown 转换
        if (!Element.isElement(block) || block.type !== 'paragraph') return
        
        const blockStart = Editor.start(editor, blockPath)
        const cursor = selection.anchor
        
        // 获取从块开始到光标位置的文本
        const beforeText = Editor.string(editor, { anchor: blockStart, focus: cursor })
        
        // 只检查行首的文本（去除前导空白）
        const trimmedBefore = beforeText.trim()
        
        // 检查是否在行首（光标前只有空白字符和匹配的文本）
        // 并且匹配的文本长度不能太长（避免误触发）
        const isAtLineStart = (beforeText === trimmedBefore || beforeText.endsWith(trimmedBefore)) 
                              && trimmedBefore.length <= 10

        if (isAtLineStart && trimmedBefore.length > 0) {
          // 计算需要删除的文本范围
          const leadingSpaces = beforeText.length - trimmedBefore.length
          const deleteStart = leadingSpaces > 0 
            ? Editor.after(editor, blockStart, { distance: leadingSpaces }) 
            : blockStart

          // 处理标题 (#, ##, ###, etc.)
          const headingMatch = trimmedBefore.match(/^(#{1,6})$/);
          if (headingMatch && deleteStart) {
            event.preventDefault()
            const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6
            Transforms.delete(editor, { at: { anchor: deleteStart, focus: cursor } })
            Transforms.setNodes(editor, { type: 'heading', level })
            return
          }

          // 处理引用 (>)
          if (trimmedBefore === '>' && deleteStart) {
            event.preventDefault()
            Transforms.delete(editor, { at: { anchor: deleteStart, focus: cursor } })
            Transforms.setNodes(editor, { type: 'quote' })
            return
          }

          // 处理代码块 (```)
          if (trimmedBefore === '```' && deleteStart) {
            event.preventDefault()
            Transforms.delete(editor, { at: { anchor: deleteStart, focus: cursor } })
            Transforms.setNodes(editor, { type: 'code' })
            return
          }

          // 处理有序列表 (1., 2., etc.)
          const orderedListMatch = trimmedBefore.match(/^(\d+)\.$/);
          if (orderedListMatch && deleteStart) {
            event.preventDefault()
            Transforms.delete(editor, { at: { anchor: deleteStart, focus: cursor } })
            Transforms.setNodes(editor, { 
              type: 'order-list', 
              indent: 0,
              uuid: generateUuid()
            })
            return
          }

          // 处理无序列表 (-, *)
          if ((trimmedBefore === '-' || trimmedBefore === '*') && deleteStart) {
            event.preventDefault()
            Transforms.delete(editor, { at: { anchor: deleteStart, focus: cursor } })
            Transforms.setNodes(editor, { 
              type: 'bullet-list', 
              indent: 0,
              uuid: generateUuid()
            })
            return
          }
        }
      }
    }

    // 格式化快捷键
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'b':
          event.preventDefault()
          toggleFormat('bold')
          break
        case 'i':
          event.preventDefault()
          toggleFormat('italic')
          break
        case 'u':
          event.preventDefault()
          toggleFormat('underline')
          break
        case '`':
          event.preventDefault()
          toggleFormat('code')
          break
      }
    }
  }, [editor, toggleFormat])

  const [showTableButton, setShowTableButton] = useState(true)

  return (
    <div className="winkdown-container">
      <Slate
        editor={editor}
        initialValue={initValue}
      >
        <div className="editor-toolbar">
          {showTableButton && (
            <button
              className="insert-table-btn"
              onMouseDown={(e) => {
                e.preventDefault()
                insertTable(editor, { rowCount: 3, colCount: 3 })
              }}
            >
              📊 插入表格
            </button>
          )}
        </div>
        
        <TableToolbar />
        
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          className='winkdown'
          onKeyDown={onKeyDown}
          placeholder="开始输入... (Ctrl+Space 触发 Markdown 快捷键)"
        />
      </Slate>
    </div>
  )
}