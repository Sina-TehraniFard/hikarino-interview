// 占い結果表示コンポーネント

interface FortuneResultProps {
  result: string;
  placeholder?: string;
}

const FortuneResult = ({
  result,
  placeholder = "カードを引いて、ヒカリノに解釈してもらいましょう。",
}: FortuneResultProps) => {
  return (
    <div className="rounded-2xl shadow-xl min-h-[200px] flex items-center justify-center border border-white/20 dark:border-white/10 bg-white/30 dark:bg-gray-900/30 backdrop-blur-md p-4 md:p-8 transition-all duration-300 ease-in-out ring-1 ring-white/10 hover:shadow-2xl hover:ring-2 hover:ring-purple-500/20">
      {result ? (
        <div className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700 dark:text-gray-200 w-full">
          {result}
        </div>
      ) : (
        <div className="text-gray-300 dark:text-gray-500 text-center w-full">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default FortuneResult;