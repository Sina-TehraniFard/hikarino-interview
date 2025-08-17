// 魔法の質問フォームコンポーネント

import GlassBox from './GlassBox';

interface QuestionFormProps {
  question: string;
  onChange: (question: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

const QuestionForm = ({
  question,
  onChange,
  placeholder = "占いたいことを入力してください",
  maxLength = 100,
  disabled = false,
}: QuestionFormProps) => {
  return (
    <div className="w-full max-w-md mb-6">
      <GlassBox disabled={disabled} focusable={true}>
        <div className="relative p-4">
          <textarea
            className={`w-full text-lg pr-16 bg-transparent border-none outline-none resize-none transition-all duration-200 ${
              disabled 
                ? 'text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500'
            }`}
            placeholder={disabled ? "占い完了" : placeholder}
            maxLength={maxLength}
            value={question}
            onChange={(e) => disabled ? undefined : onChange(e.target.value)}
            rows={4}
            disabled={disabled}
            readOnly={disabled}
          />
          
          {/* 文字数カウンター - テキストエリア内に配置 */}
          {!disabled && (
            <div className="absolute bottom-4 right-4 text-xs text-gray-400 dark:text-gray-500">
              <span className={question.length >= maxLength * 0.9 ? 'text-orange-500' : ''}>{question.length}</span>
              <span className="mx-0.5">/</span>
              <span>{maxLength}</span>
            </div>
          )}
        </div>
      </GlassBox>
    </div>
  );
};

export default QuestionForm;