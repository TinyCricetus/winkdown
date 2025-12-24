import { BaseEditor, BaseElement, BaseNode, BaseText } from "slate"
import { ReactEditor } from "slate-react"
import { Paragraph, ListElement, HeadingElement, QuoteElement, CodeElement, FormattedText } from "./constants"

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: Paragraph | ListElement | HeadingElement | QuoteElement | CodeElement
    Text: FormattedText
  }
}