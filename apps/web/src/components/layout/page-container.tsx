import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageContainer({
  children,
  title,
  description,
  action,
}: PageContainerProps) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-xs text-slate-500 max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

