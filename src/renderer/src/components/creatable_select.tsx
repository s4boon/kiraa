import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import * as React from 'react'

type Option = {
  label: string
  value: string
}

export type CreatableSelectHandle = {
  getValue: () => Option | null
  setValue: (value: Option | null) => void
  clear: () => void
}

type CreatableSelectProps = React.HTMLAttributes<HTMLDivElement> & {
  options: Option[]
  placeholder?: string
  inputPlaceholder?: string
  createLabel?: string
}

export const CreatableSelect = React.forwardRef<CreatableSelectHandle, CreatableSelectProps>(
  function CreatableSelect(
    {
      className,
      options,
      placeholder = 'Select...',
      inputPlaceholder = 'Search...',
      createLabel = 'Create',
      ...props
    },
    ref
  ) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [value, setValue] = React.useState<Option | null>(null)

    const filtered = React.useMemo(() => {
      return options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    }, [options, search])

    const canCreate =
      search.trim().length > 0 &&
      !options.some((o) => o.label.toLowerCase() === search.toLowerCase().trim())

    function selectOption(opt: Option) {
      setValue(opt)
      setOpen(false)
      setSearch('')
    }

    function createOption() {
      const newOption: Option = {
        label: search.trim(),
        value: search.toLowerCase().trim().replace(/\s+/g, '-')
      }

      setValue(newOption)
      setOpen(false)
      setSearch('')
    }

    React.useImperativeHandle(ref, () => ({
      getValue: () => value,
      setValue: (v) => setValue(v),
      clear: () => setValue(null)
    }))

    return (
      <div data-slot="creatable-select" className={cn('relative w-full', className)} {...props}>
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex h-8 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            open && 'ring-2 ring-ring'
          )}
        >
          <span className={cn(value ? 'text-foreground' : 'text-muted-foreground')}>
            {value?.label ?? placeholder}
          </span>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-background shadow-md">
            {/* Search */}
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={inputPlaceholder}
              className="border-0 border-b rounded-none focus-visible:ring-0"
            />

            {/* Options */}
            <div className="max-h-48 overflow-auto py-1">
              {filtered.length === 0 && !canCreate && (
                <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
              )}

              {filtered.map((opt) => (
                <div
                  key={opt.value}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectOption(opt)
                  }}
                  className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                >
                  {opt.label}
                </div>
              ))}

              {/* Create */}
              {canCreate && (
                <div
                  onMouseDown={(e) => {
                    e.preventDefault()
                    createOption()
                  }}
                  className="cursor-pointer border-t px-3 py-2 text-sm text-primary hover:bg-accent"
                >
                  + {createLabel} “{search}”
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)
