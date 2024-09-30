import { constructRow } from '../../core/rows/constructRow'
import { Row_RowExpanding } from '../row-expanding/RowExpanding.types'
import type { Fns } from '../../types/Fns'
import type {
  Row_ColumnFiltering,
  TableOptions_ColumnFiltering,
} from './ColumnFiltering.types'
import type { RowData } from '../../types/type-utils'
import type { TableFeatures } from '../../types/TableFeatures'
import type { RowModel } from '../../types/RowModel'
import type { Table } from '../../types/Table'
import type { Row } from '../../types/Row'

export function filterRows<
  TFeatures extends TableFeatures,
  TFns extends Fns<TFeatures, TFns, TData>,
  TData extends RowData,
>(
  rows: Array<
    Row<TFeatures, TFns, TData> & Row_ColumnFiltering<TFeatures, TFns, TData>
  >,
  filterRowImpl: (row: Row<TFeatures, TFns, TData>) => any,
  table: Table<TFeatures, TFns, TData> & {
    options: TableOptions_ColumnFiltering<TFeatures, TFns, TData>
  },
) {
  if (table.options.filterFromLeafRows) {
    return filterRowModelFromLeafs(rows, filterRowImpl, table)
  }

  return filterRowModelFromRoot(rows, filterRowImpl, table)
}

function filterRowModelFromLeafs<
  TFeatures extends TableFeatures,
  TFns extends Fns<TFeatures, TFns, TData>,
  TData extends RowData,
>(
  rowsToFilter: Array<Row<TFeatures, TFns, TData>>,
  filterRow: (
    row: Row<TFeatures, TFns, TData>,
  ) => Array<Row<TFeatures, TFns, TData>>,
  table: Table<TFeatures, TFns, TData> & {
    options: TableOptions_ColumnFiltering<TFeatures, TFns, TData>
  },
): RowModel<TFeatures, TFns, TData> {
  const newFilteredFlatRows: Array<Row<TFeatures, TFns, TData>> = []
  const newFilteredRowsById: Record<string, Row<TFeatures, TFns, TData>> = {}
  const maxDepth = table.options.maxLeafRowFilterDepth ?? 100

  const recurseFilterRows = (
    rows: Array<
      Row<TFeatures, TFns, TData> & Row_ColumnFiltering<TFeatures, TFns, TData>
    >,
    depth = 0,
  ) => {
    const filteredRows: Array<Row<TFeatures, TFns, TData>> = []

    // Filter from children up first
    for (let row of rows) {
      const newRow = constructRow(
        table,
        row.id,
        row.original,
        row.index,
        row.depth,
        undefined,
        row.parentId,
      ) as Row<TFeatures, TFns, TData> &
        Row_ColumnFiltering<TFeatures, TFns, TData>
      newRow.columnFilters = row.columnFilters

      if (row.subRows.length && depth < maxDepth) {
        newRow.subRows = recurseFilterRows(row.subRows, depth + 1)
        row = newRow

        if (!newRow.subRows.length) {
          filteredRows.push(row)
          newFilteredRowsById[row.id] = row
          newFilteredFlatRows.push(row)
          continue
        }

        if (newRow.subRows.length) {
          filteredRows.push(row)
          newFilteredRowsById[row.id] = row
          newFilteredFlatRows.push(row)
          continue
        }
      } else {
        row = newRow
        filteredRows.push(row)
        newFilteredRowsById[row.id] = row
        newFilteredFlatRows.push(row)
      }
    }

    return filteredRows
  }

  return {
    rows: recurseFilterRows(rowsToFilter as any),
    flatRows: newFilteredFlatRows,
    rowsById: newFilteredRowsById,
  }
}

function filterRowModelFromRoot<
  TFeatures extends TableFeatures,
  TFns extends Fns<TFeatures, TFns, TData>,
  TData extends RowData,
>(
  rowsToFilter: Array<Row<TFeatures, TFns, TData>>,
  filterRow: (row: Row<TFeatures, TFns, TData>) => any,
  table: Table<TFeatures, TFns, TData> & {
    options: TableOptions_ColumnFiltering<TFeatures, TFns, TData>
  },
): RowModel<TFeatures, TFns, TData> {
  const newFilteredFlatRows: Array<Row<TFeatures, TFns, TData>> = []
  const newFilteredRowsById: Record<string, Row<TFeatures, TFns, TData>> = {}
  const maxDepth = table.options.maxLeafRowFilterDepth ?? 100

  // Filters top level and nested rows
  const recurseFilterRows = (
    rows: Array<Row<TFeatures, TFns, TData>>,
    depth = 0,
  ) => {
    // Filter from parents downward first

    const filteredRows: Array<Row<TFeatures, TFns, TData>> = []

    // Apply the filter to any subRows
    for (let row of rows) {
      const pass = filterRow(row)

      if (pass) {
        if (row.subRows.length && depth < maxDepth) {
          const newRow = constructRow(
            table,
            row.id,
            row.original,
            row.index,
            row.depth,
            undefined,
            row.parentId,
          )
          newRow.subRows = recurseFilterRows(row.subRows, depth + 1)
          row = newRow
        }

        filteredRows.push(row)
        newFilteredFlatRows.push(row)
        newFilteredRowsById[row.id] = row
      }
    }

    return filteredRows
  }

  return {
    rows: recurseFilterRows(rowsToFilter),
    flatRows: newFilteredFlatRows,
    rowsById: newFilteredRowsById,
  }
}
