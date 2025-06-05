import React from 'react';

interface TextareaFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  containerClassName?: string;
}

export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
  containerClassName = '',
}: TextareaFieldProps) {
  return (
    <div className={`space-y-4 ${containerClassName}`}>
      {label && <h4 className="font-medium text-foreground">{label}</h4>}
      <textarea
        className={`w-full p-3 border rounded-lg text-sm ${className}`}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// 라벨이 있는 박스 스타일 TextareaField
interface BoxedTextareaFieldProps extends TextareaFieldProps {
  boxLabel?: string;
  boxClassName?: string;
}

export function BoxedTextareaField({
  boxLabel,
  boxClassName = 'bg-accent/20',
  label,
  ...props
}: BoxedTextareaFieldProps) {
  return (
    <div className="space-y-4">
      {label && (
        <h4 className="font-medium text-foreground flex items-center gap-2">
          {label}
        </h4>
      )}
      <div className={`p-4 ${boxClassName} rounded-lg border border-border/40`}>
        {boxLabel && (
          <label className="block text-sm text-muted-foreground mb-2">
            {boxLabel}
          </label>
        )}
        <textarea
          className={`w-full p-3 border rounded-lg text-sm ${
            props.className || ''
          }`}
          rows={props.rows || 3}
          placeholder={props.placeholder}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
