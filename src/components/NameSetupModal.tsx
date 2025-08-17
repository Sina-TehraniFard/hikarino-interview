'use client';
import { useState } from 'react';
import { updateUserName } from '@/lib/firestore/user';
import MessageDialog from './ui/MessageDialog';

interface NameSetupModalProps {
    isOpen: boolean;
    uid: string;
    onComplete: () => void;
}

const NameSetupModal: React.FC<NameSetupModalProps> = ({ isOpen, uid, onComplete }) => {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    
    if (!isOpen) return null;
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) {
            setError('お名前を入力してください。');
            setShowError(true);
            return;
        }
        
        if (name.trim().length > 20) {
            setError('お名前は20文字以内で入力してください。');
            setShowError(true);
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            await updateUserName(uid, name.trim());
            onComplete();
        } catch (error) {
            console.error('名前の更新に失敗しました:', error);
            setError('名前の更新に失敗しました。もう一度お試しください。');
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 p-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300">
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            お名前の設定
                        </h2>
                    </div>
                    
                    {/* コンテンツ */}
                    <div className="px-6 py-8">
                        <div className="text-center mb-8">
                            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4 mx-auto mb-6">
                                <p className="text-purple-800 dark:text-purple-200 font-semibold text-lg">
                                    🎉 ご登録ありがとうございます！
                                </p>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                                あなたのお名前を教えてください。<br />
                                占い結果で使用させていただきます。
                            </p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    お名前（ニックネーム可）
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    placeholder="例：ひかり"
                                    maxLength={20}
                                    required
                                    autoFocus
                                />
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    ※後から変更することはできません
                                </p>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading || !name.trim()}
                                className={`w-full px-6 py-4 rounded-lg font-semibold transition-all duration-200 transform active:scale-95 ${
                                    isLoading || !name.trim()
                                        ? "bg-gray-400 cursor-not-allowed" 
                                        : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl"
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        設定中...
                                    </div>
                                ) : (
                                    "設定する"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <MessageDialog
                isOpen={showError}
                onClose={() => setShowError(false)}
                type="error"
                message={error}
            />
        </>
    );
};

export default NameSetupModal;