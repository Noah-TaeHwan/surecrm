'use client';

import React from 'react';
import { cn } from '../../../lib/utils';

interface BentoGridProps {
  className?: string;
  children: React.ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-max',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoGridItemProps {
  className?: string;
  title: string;
  description: string;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  children,
}: BentoGridItemProps) {
  return (
    <div
      className={cn(
        'row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-card border border-border/40 justify-between flex flex-col space-y-4',
        className
      )}
    >
      {header && <div className="flex flex-col gap-1">{header}</div>}
      <div className="group-hover/bento:translate-x-1 transition duration-200">
        {icon && <div className="mb-2">{icon}</div>}
        <div className="font-medium text-lg mb-1 tracking-tight">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      {children}
    </div>
  );
}
