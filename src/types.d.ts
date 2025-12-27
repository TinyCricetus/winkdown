import { BaseEditor } from "slate"
import { ReactEditor } from "slate-react"
import { Paragraph, ListElement, HeadingElement, QuoteElement, CodeElement, FormattedText, TableElement, TableRowElement, TableCellElement } from "./constants"

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: Paragraph | ListElement | HeadingElement | QuoteElement | CodeElement | TableElement | TableRowElement | TableCellElement
    Text: FormattedText
  }
}