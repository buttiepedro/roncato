import React from 'react';

export default function KanbanFilters({
  dateFrom,
  dateTo,
  armadorFilter,
  armadorOptions,
  filteredCount,
  totalCount,
  hasActiveFilters,
  activeFilterLabel,
  onDateFromChange,
  onDateToChange,
  onArmadorFilterChange,
  onClear,
}) {
  return (
    <div className="mx-auto mb-4 w-full rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm lg:max-w-full">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Desde
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Hasta
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            min={dateFrom || undefined}
            className="h-10 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-44">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Armador
          </label>
          <div className="relative">
            <select
              value={armadorFilter}
              onChange={(e) => onArmadorFilterChange(e.target.value)}
              className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 px-3 pr-9 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Todos</option>
              <option value="__unassigned__">Sin asignar</option>
              {armadorOptions.map((username) => (
                <option key={username} value={username}>
                  {username}
                </option>
              ))}
            </select>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="h-10 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Limpiar
        </button>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Mostrando {filteredCount} de {totalCount} pedidos
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {dateFrom && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
              Desde: {dateFrom}
            </span>
          )}
          {dateTo && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
              Hasta: {dateTo}
            </span>
          )}
          {activeFilterLabel && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
              {activeFilterLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
