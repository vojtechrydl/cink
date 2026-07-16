import { X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <svg className="absolute left-[13px] top-1/2 -translate-y-1/2 text-placeholder" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.5" y2="16.5" />
      </svg>
      <input
        type="text"
        inputMode="numeric"
        placeholder="Hledat podle čísla…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[42px] pl-[38px] pr-8 rounded-[12px] bg-card border border-border text-[14px] text-heading placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-placeholder hover:text-secondary"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
