import type { TicketStatus, TicketPriority, TicketCategory } from '@/types'
import { STATUS_LABEL, PRIORITY_LABEL, CATEGORY_LABEL } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed']
const PRIORITIES: TicketPriority[] = ['critical', 'high', 'medium', 'low']
const CATEGORIES: TicketCategory[] = ['bug', 'feature', 'billing', 'support', 'other']

export interface TicketFilterState {
  status?: string
  priority?: string
  category?: string
}

export default function TicketFilters({
  filters,
  onChange,
}: {
  filters: TicketFilterState
  onChange: (next: TicketFilterState) => void
}) {
  const hasActiveFilters = Boolean(filters.status || filters.priority || filters.category)

  return (
    <div
      className="flex flex-wrap items-center gap-2.5 mb-6 opacity-0 animate-fade-up stagger-1"
      style={{ animationFillMode: 'forwards' }}
    >
      <FilterGroup
        label="Status"
        options={STATUSES}
        labelMap={STATUS_LABEL}
        value={filters.status}
        onSelect={(v) => onChange({ ...filters, status: v })}
      />
      <FilterGroup
        label="Priority"
        options={PRIORITIES}
        labelMap={PRIORITY_LABEL}
        value={filters.priority}
        onSelect={(v) => onChange({ ...filters, priority: v })}
      />
      <FilterGroup
        label="Category"
        options={CATEGORIES}
        labelMap={CATEGORY_LABEL}
        value={filters.category}
        onSelect={(v) => onChange({ ...filters, category: v })}
      />
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({})}
          className="text-xs text-ink-2 hover:text-ink hover:bg-surface-2 h-8 px-2.5"
        >
          Clear filters ×
        </Button>
      )}
    </div>
  )
}

function FilterGroup<T extends string>({
  label,
  options,
  labelMap,
  value,
  onSelect,
}: {
  label: string
  options: T[]
  labelMap: Record<T, string>
  value: string | undefined
  onSelect: (v: string | undefined) => void
}) {
  return (
    <div className="inline-flex items-center gap-1 bg-surface border border-border rounded-lg p-1 flex-wrap">
      <span className="text-ink-3 text-xs font-medium px-2">{label}</span>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(value === opt ? undefined : opt)}
          className={`px-2.5 py-1 rounded-md text-[13px] transition-all ${
            value === opt
              ? 'bg-accent/15 text-accent font-medium border border-accent/30'
              : 'text-ink-2 hover:text-ink hover:bg-surface-2 border border-transparent'
          }`}
        >
          {labelMap[opt]}
        </button>
      ))}
    </div>
  )
}
