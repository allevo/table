import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'

import {
  createCoreRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  functionalUpdate,
  makeStateUpdater,
  useTable,
} from '@tanstack/react-table'
import { makeData } from './makeData'
import type {
  Column,
  ColumnDef,
  OnChangeFn,
  RowData,
  Table,
  TableFeature,
  TableFeatures,
  Updater,
} from '@tanstack/react-table'

import type { Person } from './makeData'

// TypeScript setup for our new feature with all of the same type-safety as stock TanStack Table features

// define types for our new feature's custom state
export type DensityState = 'sm' | 'md' | 'lg'
export interface DensityTableState {
  density: DensityState
}

// define types for our new feature's table options
export interface DensityOptions {
  enableDensity?: boolean
  onDensityChange?: OnChangeFn<DensityState>
}

// Define types for our new feature's table APIs
export interface DensityInstance {
  setDensity: (updater: Updater<DensityState>) => void
  toggleDensity: (value?: DensityState) => void
}

// Use declaration merging to add our new feature APIs and state types to TanStack Table's existing types.
declare module '@tanstack/react-table' {
  //merge our new feature's state with the existing table state
  interface TableState extends DensityTableState {}
  //merge our new feature's options with the existing table options
  interface TableOptions<
    TFeatures extends TableFeatures,
    TFns extends Fns<TFeatures, TFns, TData>,
    TData extends RowData,
  > extends DensityOptions {}
  //merge our new feature's instance APIs with the existing table instance APIs
  interface Table<
    TFeatures extends TableFeatures,
    TFns extends Fns<TFeatures, TFns, TData>,
    TData extends RowData,
  > extends DensityInstance {}
  // if you need to add cell instance APIs...
  // interface Cell<TFeatures extends TableFeatures, TFns extends Fns<TFeatures, TFns, TData>, TData extends RowData, TValue> extends DensityCell
  // if you need to add row instance APIs...
  // interface Row<TFeatures extends TableFeatures, TFns extends Fns<TFeatures, TFns, TData>, TData extends RowData> extends DensityRow
  // if you need to add column instance APIs...
  // interface Column<TFeatures extends TableFeatures, TFns extends Fns<TFeatures, TFns, TData>, TData extends RowData, TValue> extends DensityColumn
  // if you need to add header instance APIs...
  // interface Header<TFeatures extends TableFeatures, TFns extends Fns<TFeatures, TFns, TData>, TData extends RowData, TValue> extends DensityHeader

  // Note: declaration merging on `ColumnDef` is not possible because it is a type, not an interface.
  // But you can still use declaration merging on `ColumnDef.meta`
}

// end of TS setup!

// Here is all of the actual javascript code for our new feature
export const DensityFeature: TableFeature = {
  // define the new feature's initial state
  getInitialState: (state): DensityTableState => {
    return {
      density: 'md',
      ...state,
    }
  },

  // define the new feature's default options
  getDefaultOptions: <
    TFeatures extends TableFeatures,
    TFns extends Fns<TFeatures, TFns, TData>,
    TData extends RowData,
  >(
    table: Partial<Table<TFeatures, TFns, TData>>,
  ): DensityOptions => {
    return {
      enableDensity: true,
      onDensityChange: makeStateUpdater('density', table),
    } as DensityOptions
  },
  // if you need to add a default column definition...
  // getDefaultColumnDef: <TFeatures extends TableFeatures, TFns extends Fns<TFeatures, TFns, TData>, TData extends RowData>(): Partial<ColumnDef<TFeatures, TFns, TData>> => {
  //   return { meta: {} } //use meta instead of directly adding to the columnDef to avoid typescript stuff that's hard to workaround
  // },

  // define the new feature's table instance methods
  constructTable: <
    TFeatures extends TableFeatures,
    TFns extends Fns<TFeatures, TFns, TData>,
    TData extends RowData,
  >(
    table: Table<TFeatures, TFns, TData>,
  ): void => {
    table.setDensity = (updater) => {
      const safeUpdater: Updater<DensityState> = (old) => {
        const newState = functionalUpdate(updater, old)
        return newState
      }
      return table.options.onDensityChange?.(safeUpdater)
    }
    table.toggleDensity = (value) => {
      table.setDensity((old) => {
        if (value) return value
        return old === 'lg' ? 'md' : old === 'md' ? 'sm' : 'lg' //cycle through the 3 options
      })
    }
  },

  // if you need to add row instance APIs...
  // constructRow: <TFeatures extends TableFeatures, TFns extends Fns<TFeatures, TFns, TData>, TData extends RowData>(row, table): void => {},
  // if you need to add cell instance APIs...
  // constructCell: <TFeatures extends TableFeatures, TFns extends Fns<TFeatures, TFns, TData>, TData extends RowData>(cell, column, row, table): void => {},
  // if you need to add column instance APIs...
  // constructColumn: <TFeatures extends TableFeatures, TFns extends Fns<TFeatures, TFns, TData>, TData extends RowData>(column, table): void => {},
  // if you need to add header instance APIs...
  // constructHeader: <TFeatures extends TableFeatures, TFns extends Fns<TFeatures, TFns, TData>, TData extends RowData>(header, table): void => {},
}
//end of custom feature code

//app code
function App() {
  const columns = React.useMemo<Array<ColumnDef<any, Person>>>(
    () => [
      {
        accessorKey: 'firstName',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.lastName,
        id: 'lastName',
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: 'age',
        header: () => 'Age',
        footer: (props) => props.column.id,
      },
      {
        accessorKey: 'visits',
        header: () => <span>Visits</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        footer: (props) => props.column.id,
      },
      {
        accessorKey: 'progress',
        header: 'Profile Progress',
        footer: (props) => props.column.id,
      },
    ],
    [],
  )

  const [data, _setData] = React.useState(() => makeData(1000))
  const [density, setDensity] = React.useState<DensityState>('md')

  const table = useTable({
    _features: { DensityFeature }, //pass our custom feature to the table to be instantiated upon creation
    _rowModels: {
      Core: createCoreRowModel(),
      Filtered: createFilteredRowModel(),
      Paginated: createPaginatedRowModel(),
      Sorted: createSortedRowModel(),
    },
    columns,
    data,
    debugTable: true,
    state: {
      density, //passing the density state to the table, TS is still happy :)
    },
    onDensityChange: setDensity, //using the new onDensityChange option, TS is still happy :)
  })

  return (
    <div className="p-2">
      <div className="h-2" />
      <button
        onClick={() => table.toggleDensity()}
        className="border rounded p-1 bg-blue-500 text-white mb-2 w-64"
      >
        Toggle Density
      </button>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      //using our new feature
                      padding:
                        density === 'sm'
                          ? '4px'
                          : density === 'md'
                            ? '8px'
                            : '16px',
                      transition: 'padding 0.2s',
                    }}
                  >
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                    {header.column.getCanFilter() ? (
                      <div>
                        <Filter column={header.column} table={table} />
                      </div>
                    ) : null}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      key={cell.id}
                      style={{
                        //using our new feature
                        padding:
                          density === 'sm'
                            ? '4px'
                            : density === 'md'
                              ? '8px'
                              : '16px',
                        transition: 'padding 0.2s',
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount().toLocaleString()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div>
        Showing {table.getRowModel().rows.length.toLocaleString()} of{' '}
        {table.getRowCount().toLocaleString()} Rows
      </div>
      <pre>{JSON.stringify(table.getState().pagination, null, 2)}</pre>
    </div>
  )
}

function Filter({
  column,
  table,
}: {
  column: Column<any, any, any>
  table: Table<any, any, any>
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  console.log('columnFilterValue', { columnFilterValue, table, column })

  return typeof firstValue === 'number' ? (
    <div className="flex space-x-2">
      <input
        type="number"
        value={(columnFilterValue as [number, number] | undefined)?.[0]}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old[1],
          ])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <input
        type="number"
        value={(columnFilterValue as [number, number] | undefined)?.[1]}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            old[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : (
    <input
      type="text"
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Search...`}
      className="w-36 border shadow rounded"
    />
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
