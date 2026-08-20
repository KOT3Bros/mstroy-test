export type ID = string | number

export interface ITreeItem {
  id: ID
  parent: ID | null
  label?: string
  [key: string]: any
}