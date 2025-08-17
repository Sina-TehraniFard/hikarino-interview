interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationComponent = ({ currentPage, totalPages, onPageChange }: PaginationComponentProps) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center space-x-2">
      {/* 前へボタン */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-lg transition-all duration-200 ${
          currentPage === 1
            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-300 dark:border-gray-600"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* ページ番号 */}
      <div className="flex items-center space-x-1">
        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          // 現在のページの前後2ページと最初・最後のページを表示
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 2 && page <= currentPage + 2)
          ) {
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  page === currentPage
                    ? "bg-purple-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-300 dark:border-gray-600"
                }`}
              >
                {page}
              </button>
            );
          } else if (
            page === currentPage - 3 ||
            page === currentPage + 3
          ) {
            return <span key={page} className="px-2 text-gray-400">...</span>;
          }
          return null;
        })}
      </div>

      {/* 次へボタン */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-lg transition-all duration-200 ${
          currentPage === totalPages
            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-300 dark:border-gray-600"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default PaginationComponent;