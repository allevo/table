import { table_getPaginatedRowModel } from '../../features/row-pagination/RowPagination.utils'
import { functionalUpdate } from '../../utils'
import { createCoreRowModel } from './createCoreRowModel'
import type {
  RowData,
  RowModel,
  Table,
  TableFeatures,
  TableOptionsResolved,
  TableState,
  Updater,
} from '../../types'
import type { RequiredKeys } from '../../utils.types'

export function table_reset<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(table: Table<TFeatures, TData>): void {
  table_setState(table, table.initialState)
}

export function table_mergeOptions<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  table: Table<TFeatures, TData>,
  newOptions: TableOptionsResolved<TFeatures, TData>,
) {
  if (table.options.mergeOptions) {
    return table.options.mergeOptions(table.options, newOptions)
  }

  return {
    ...table.options,
    ...newOptions,
  }
}

export function table_setOptions<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  table: Table<TFeatures, TData>,
  updater: Updater<TableOptionsResolved<TFeatures, TData>>,
): void {
  const newOptions = functionalUpdate(updater, table.options)
  table.options = table_mergeOptions(table, newOptions) as RequiredKeys<
    TableOptionsResolved<TFeatures, TData>,
    'state'
  >
}

export function table_getState<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(table: Table<TFeatures, TData>): TableState {
  return table.options.state as TableState
}

export function table_setState<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(table: Table<TFeatures, TData>, updater: Updater<TableState>): void {
  table.options.onStateChange(updater)
}

export function table_getCoreRowModel<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(table: Table<TFeatures, TData>): RowModel<TFeatures, TData> {
  if (!table._rowModels.Core) {
    table._rowModels.Core =
      table.options._rowModels?.Core?.(table) ??
      createCoreRowModel<TFeatures, TData>()(table)
  }

  return table._rowModels.Core()
}

export function table_getRowModel<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(table: Table<TFeatures, TData>): RowModel<TFeatures, TData> {
  return table_getPaginatedRowModel(table)
}
