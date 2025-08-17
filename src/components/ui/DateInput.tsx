interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const DateInput = ({ label, value, onChange }: DateInputProps) => (
  <div className="flex-1">
    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base transition-all duration-200"
    />
  </div>
);

export default DateInput;