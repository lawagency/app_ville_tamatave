import type { ReactNode } from "react";

export { default as DataTable, type Column } from "./table/DataTable";
export { default as Pagination } from "./table/Pagination";
export { default as FilterTabs, type FilterTab } from "./table/FilterTabs";
export { default as RowActions, type RowAction } from "./table/RowActions";
export { default as DetailPanel, type DetailItem } from "./table/DetailPanel";
export { ActifDot, Avatar, CellTitle, Progress, StatusDot, type Tone } from "./table/cells";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="card mb-6 flex items-center justify-between py-5">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-text-muted text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="label-field">{label}</span>
      {children}
    </label>
  );
}
