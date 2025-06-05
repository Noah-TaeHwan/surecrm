import React from 'react';

interface InterestItem {
  key: string;
  label: string;
  icon: string;
}

interface InterestCardGridProps {
  items: InterestItem[];
  values: Record<string, any>;
  onChange: (key: string, checked: boolean) => void;
  gridCols?: string;
}

export function InterestCardGrid({
  items,
  values,
  onChange,
  gridCols = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
}: InterestCardGridProps) {
  return (
    <div className={`grid ${gridCols} gap-4`}>
      {items.map((item) => (
        <div
          key={item.key}
          className="p-3 bg-card border border-border/50 rounded-lg hover:bg-accent/10 transition-colors"
        >
          <label className="flex flex-col items-center text-center cursor-pointer space-y-2">
            <span className="text-2xl">{item.icon}</span>
            <input
              type="checkbox"
              className="rounded border-border"
              checked={values[item.key] || false}
              onChange={(e) => onChange(item.key, e.target.checked)}
            />
            <span className="text-xs text-foreground leading-tight">
              {item.label}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
}
