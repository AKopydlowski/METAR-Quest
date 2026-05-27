import type { ReactNode } from "react";

export type ModeCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  actionLabel: string;
  onSelect: () => void;
  disabled?: boolean;
};

export function ModeCard({
  title,
  description,
  icon,
  actionLabel,
  onSelect,
  disabled = false,
}: ModeCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-600">{description}</p>
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className="mt-5 w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {actionLabel}
      </button>
    </article>
  );
}
