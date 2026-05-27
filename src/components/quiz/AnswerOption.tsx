export type AnswerOptionProps = {
  id: string;
  text: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect: (id: string) => void;
};

export function AnswerOption({
  id,
  text,
  selected = false,
  disabled = false,
  onSelect,
}: AnswerOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      disabled={disabled}
      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition sm:text-base ${
        selected
          ? "border-sky-600 bg-sky-50 text-sky-900"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {text}
    </button>
  );
}
