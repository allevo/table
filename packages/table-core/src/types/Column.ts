import type { Fns } from './Fns'
import type { RowData, UnionToIntersection } from './type-utils'
import type { TableFeatures } from './TableFeatures'
import type { Column_Column } from '../core/columns/Columns.types'
import type { Column_ColumnFaceting } from '../features/column-faceting/ColumnFaceting.types'
import type { Column_ColumnFiltering } from '../features/column-filtering/ColumnFiltering.types'
import type { Column_ColumnGrouping } from '../features/column-grouping/ColumnGrouping.types'
import type { Column_ColumnOrdering } from '../features/column-ordering/ColumnOrdering.types'
import type { Column_ColumnPinning } from '../features/column-pinning/ColumnPinning.types'
import type { Column_ColumnResizing } from '../features/column-resizing/ColumnResizing.types'
import type { Column_ColumnSizing } from '../features/column-sizing/ColumnSizing.types'
import type { Column_ColumnVisibility } from '../features/column-visibility/ColumnVisibility.types'
import type { Column_GlobalFiltering } from '../features/global-filtering/GlobalFiltering.types'
import type { Column_RowSorting } from '../features/row-sorting/RowSorting.types'

export type Column<
  TFeatures extends TableFeatures,
  TFns extends Fns<TFeatures, TFns, TData>,
  TData extends RowData,
  TValue = unknown,
> = Column_Column<TFeatures, TFns, TData, TValue> &
  UnionToIntersection<
    | ('ColumnFaceting' extends keyof TFeatures
        ? Column_ColumnFaceting<TFeatures, TFns, TData>
        : never)
    | ('ColumnFiltering' extends keyof TFeatures
        ? Column_ColumnFiltering<TFeatures, TFns, TData>
        : never)
    | ('ColumnGrouping' extends keyof TFeatures
        ? Column_ColumnGrouping<TFeatures, TFns, TData>
        : never)
    | ('ColumnOrdering' extends keyof TFeatures ? Column_ColumnOrdering : never)
    | ('ColumnPinning' extends keyof TFeatures ? Column_ColumnPinning : never)
    | ('ColumnResizing' extends keyof TFeatures ? Column_ColumnResizing : never)
    | ('ColumnSizing' extends keyof TFeatures ? Column_ColumnSizing : never)
    | ('ColumnVisibility' extends keyof TFeatures
        ? Column_ColumnVisibility
        : never)
    | ('GlobalFiltering' extends keyof TFeatures
        ? Column_GlobalFiltering
        : never)
    | ('RowSorting' extends keyof TFeatures
        ? Column_RowSorting<TFeatures, TFns, TData>
        : never)
  >
