import type { ID, ITreeItem } from '../types'

export class TreeStore {
  private items: ITreeItem[]
  private itemsMap: Map<ID, ITreeItem> = new Map()
  private childrenMap: Map<ID, ITreeItem[]> = new Map()

  constructor(initialItems: ITreeItem[]) {
    this.items = initialItems
    this.buildIndex(initialItems)
  }

  private buildIndex(items: ITreeItem[]): void {
    this.itemsMap.clear()
    this.childrenMap.clear()

    for (const item of items) {
      this.itemsMap.set(item.id, item)

      const parentId = item.parent
      if (parentId === null || parentId === undefined) continue

      if (!this.childrenMap.has(parentId)) {
        this.childrenMap.set(parentId, [])
      }
      this.childrenMap.get(parentId)!.push(item)
    }
  }

  getAll(): ITreeItem[] {
    return this.items
  }

  getItem(id: ID): ITreeItem | undefined {
    return this.itemsMap.get(id)
  }

  getChildren(id: ID): ITreeItem[] {
    return this.childrenMap.get(id) || []
  }

  getAllChildren(id: ID): ITreeItem[] {
    const result: ITreeItem[] = []
    const stack: ITreeItem[] = [...this.getChildren(id)]

    while (stack.length > 0) {
      const current = stack.pop()!
      result.push(current)
      
      const children = this.getChildren(current.id)
      if (children.length > 0) {
        stack.push(...children)
      }
    }

    return result
  }

  getAllParents(id: ID): ITreeItem[] {
    const result: ITreeItem[] = []
    let current = this.itemsMap.get(id)

    while (current) {
      result.push(current)
      if (current.parent === null || current.parent === undefined) break
      current = this.itemsMap.get(current.parent)
    }

    return result
  }

  addItem(newItem: ITreeItem): void {
    this.items.push(newItem)
    this.itemsMap.set(newItem.id, newItem)

    if (newItem.parent !== null && newItem.parent !== undefined) {
      if (!this.childrenMap.has(newItem.parent)) {
        this.childrenMap.set(newItem.parent, [])
      }
      this.childrenMap.get(newItem.parent)!.push(newItem)
    }
  }

  removeItem(id: ID): void {
    const itemToRemove = this.itemsMap.get(id)
    if (!itemToRemove) return

    const descendants = this.getAllChildren(id)
    const idsToRemove = new Set([id, ...descendants.map(d => d.id)])

    idsToRemove.forEach(removeId => this.itemsMap.delete(removeId))
    idsToRemove.forEach(removeId => this.childrenMap.delete(removeId))

    if (itemToRemove.parent !== null && itemToRemove.parent !== undefined) {
      const parentChildren = this.childrenMap.get(itemToRemove.parent)
      if (parentChildren) {
        this.childrenMap.set(
          itemToRemove.parent,
          parentChildren.filter(c => c.id !== id)
        )
      }
    }

    this.items = this.items.filter(item => !idsToRemove.has(item.id))
  }

  updateItem(updatedItem: ITreeItem): void {
    const oldItem = this.itemsMap.get(updatedItem.id)
    if (!oldItem) return

    const oldParent = oldItem.parent
    const newParent = updatedItem.parent

    this.itemsMap.set(updatedItem.id, updatedItem)

    if (oldParent !== newParent) {
      if (oldParent !== null && oldParent !== undefined) {
        const oldParentChildren = this.childrenMap.get(oldParent)
        if (oldParentChildren) {
          this.childrenMap.set(
            oldParent,
            oldParentChildren.filter(c => c.id !== updatedItem.id)
          )
        }
      }

      if (newParent !== null && newParent !== undefined) {
        if (!this.childrenMap.has(newParent)) {
          this.childrenMap.set(newParent, [])
        }
        this.childrenMap.get(newParent)!.push(updatedItem)
      }
    }

    const index = this.items.findIndex(item => item.id === updatedItem.id)
    if (index !== -1) {
      this.items[index] = updatedItem
    }
  }
}