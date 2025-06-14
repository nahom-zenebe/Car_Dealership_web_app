import { ReactElement } from 'react';

type Option = {
  label: string;
  value: string;
  icon: ReactElement;
};

export default function OnboardingStep({
  data,
  onAnswer,
}: {
  data: { question: string; options: Option[] };
  onAnswer: (value: string) => void;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {data.question}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {data.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onAnswer(opt.value)}
            className="flex items-center gap-4 border p-4 rounded-xl hover:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-blue-50"
          >
            <span>{opt.icon}</span>
            <span className="text-lg font-medium text-gray-700">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
