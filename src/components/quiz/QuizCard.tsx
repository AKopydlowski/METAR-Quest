import { AnswerOption } from "./AnswerOption";

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizCardProps = {
  question: string;
  options: QuizOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  questionIndex: number;
  totalQuestions: number;
};

export function QuizCard({
  question,
  options,
  selectedId,
  onSelect,
  questionIndex,
  totalQuestions,
}: QuizCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <p className="text-sm font-medium text-slate-500">
        Question {questionIndex} of {totalQuestions}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">{question}</h3>

      <div className="mt-5 grid gap-3">
        {options.map((option) => (
          <AnswerOption
            key={option.id}
            id={option.id}
            text={option.text}
            selected={selectedId === option.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
