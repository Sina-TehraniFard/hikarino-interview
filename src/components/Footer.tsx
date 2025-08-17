import packageJson from '../../package.json';

export default function Footer() {
    return (
        <footer className="w-full py-4 border-t border-gray-200 mt-auto">
            <div className="max-w-md mx-auto text-center text-gray-500 text-sm">
                © 2025 ヒカリノ v{packageJson.version} by <a href="https://scriptlab.jp" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">スクリプトラボ</a>
            </div>
        </footer>
    );
} 