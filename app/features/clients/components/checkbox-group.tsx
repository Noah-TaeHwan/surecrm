import React from 'react';

interface CheckboxItem {
  key: string;
  label: string;
  icon: string;
}

interface CheckboxGroupProps {
  title: string;
  items: CheckboxItem[];
  values: Record<string, any>;
  onChange: (key: string, checked: boolean) => void;
  gridCols?: 'grid-cols-1' | 'grid-cols-2';
  bgColor?: string;
  borderColor?: string;
}

export function CheckboxGroup({
  title,
  items,
  values,
  onChange,
  gridCols = 'grid-cols-2',
  bgColor = 'bg-muted/30',
  borderColor = 'border-border/50',
}: CheckboxGroupProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-foreground flex items-center gap-2">
        {title}
      </h4>
      <div
        className={`grid grid-cols-1 md:${gridCols} gap-4 p-4 ${bgColor} rounded-lg border ${borderColor}`}
      >
        {items.map((item) => (
          <div key={item.key} className="flex items-center space-x-3">
            <span className="text-lg">{item.icon}</span>
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-border"
                checked={values[item.key] || false}
                onChange={(e) => onChange(item.key, e.target.checked)}
              />
              <span>{item.label}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
