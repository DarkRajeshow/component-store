import * as React from 'react';
import { CheckIcon, ChevronDownIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectComboboxProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
  onSearch?: (searchTerm: string) => void;
  searchPlaceholder?: string;
}

export const MultiSelectCombobox: React.FC<MultiSelectComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  disabled,
  error,
  loading = false,
  onSearch,
  searchPlaceholder = 'Search...',
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = React.useMemo(() => {
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        opt.value.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleSelect = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const handleRemove = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  const handleSearchChange = (searchTerm: string) => {
    setSearch(searchTerm);
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div
        className={cn(
          'relative border rounded-md px-2 py-1 min-h-[42px] flex flex-wrap items-center gap-1 bg-background cursor-pointer',
          error ? 'border-red-500' : 'border-input',
          disabled && 'opacity-50 pointer-events-none'
        )}
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((o) => !o);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value.length === 0 && (
          <span className="text-muted-foreground select-none">{placeholder}</span>
        )}
        <div className='flex flex-wrap gap-1 p-1'>
          {value.map((val) => {
            const opt = options.find((o) => o.value === val);
            return (
              <span
                key={val}
                className="flex items-center bg-green-100/70 text-accent-foreground rounded px-2 py-0.5 mr-1 mb-1"
              >
                {opt?.label || val}
                <button
                  type="button"
                  className="ml-1 text-muted-foreground hover:text-destructive focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(val);
                  }}
                  aria-label={`Remove ${opt?.label || val}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
        <span className="ml-auto">
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </span>
      </div>
      {open && (
        <div className="z-50 mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                className="w-full px-2 py-1 border rounded focus:outline-none text-sm pr-8"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {loading && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
          <ul className="max-h-40 overflow-y-auto" role="listbox">
            {loading ? (
              <li className="px-4 py-2 text-muted-foreground text-sm flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Searching...
              </li>
            ) : filteredOptions.length === 0 ? (
              <li className="px-4 py-2 text-muted-foreground text-sm">
                {search ? 'No users found' : 'No options'}
              </li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  className={cn(
                    'flex items-center px-4 py-2 cursor-pointer hover:bg-accent',
                    value.includes(opt.value) && 'bg-accent text-accent-foreground'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt.value);
                  }}
                  role="option"
                  aria-selected={value.includes(opt.value)}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 size-4',
                      value.includes(opt.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
