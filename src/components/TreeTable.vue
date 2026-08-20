<script setup lang="ts">
import { computed } from "vue"
import { AgGridVue } from "ag-grid-vue3"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { TreeStore } from "../classes/TreeStore"
import type { ITreeItem } from "../types"

const props = defineProps<{
    items: ITreeItem[]
}>()

const store = computed(() => new TreeStore(props.items))

const rowData = computed(() => store.value.getAll())

const getDataPath = (data: ITreeItem): string[] => {
    if (data.parent === null) {
        return [data.label || String(data.id)]
    }
    return store.value
        .getAllParents(data.id)
        .map((item) => item.label || String(item.id))
        .reverse()
}

const columnDefs = [
    {
        headerName: "Наименование",
        field: "label",
    },
]
</script>

<template>
    <ag-grid-vue
        :columnDefs="columnDefs"
        :rowData="rowData"
        rowNumbers
        treeData
        :getDataPath="getDataPath"
        :autoGroupColumnDef="{
            headerName: 'Категория',
            field: 'category',
            valueGetter: (params: any) => {
                if (!params.data) return ''
                const children = store.getChildren(params.data.id)
                return children.length > 0 ? 'Группа' : 'Элемент'
            },
            flex: 1,
        }"
        domLayout="autoHeight"
    >
    </ag-grid-vue>
</template>
