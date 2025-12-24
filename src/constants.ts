import { BaseElement, BaseText } from "slate"

export interface Paragraph extends BaseElement {
  type: 'paragraph'
}

export interface HeadingElement extends BaseElement {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
}

export interface ListElement extends BaseElement {
  type: 'order-list' | 'bullet-list'
  uuid: string
  indent: number
}

export interface QuoteElement extends BaseElement {
  type: 'quote'
}

export interface CodeElement extends BaseElement {
  type: 'code'
}

export interface FormattedText extends BaseText {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  code?: boolean
}