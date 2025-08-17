'use client';
import { useState } from 'react';
import Link from 'next/link';
import { recordTermsAcceptance } from '@/lib/firestore/user';
// import { signOut } from 'firebase/auth';
// import { auth } from '@/lib/firebase';

interface TermsAgreementModalProps {
    onComplete: () => void;
    userUid: string;
}

const TermsAgreementModal: React.FC<TermsAgreementModalProps> = ({ 
    onComplete, 
    userUid 
}) => {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAccept = async () => {
        if (!termsAccepted) {
            setError('利用規約への同意をお願いいたします。');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await recordTermsAcceptance(userUid);
            onComplete();
        } catch (error) {
            console.error('同意の記録でエラー:', error);
            setError('処理中にエラーが発生いたしました。恐れ入りますが、もう一度お試しください。');
        } finally {
            setIsLoading(false);
        }
    };

    // handleCancel is not used in the current UI design

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* ヘッダー */}
                <div className="px-6 py-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🔮</span>
                    </div>
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                        安心してご利用いただくために
                    </h2>
                </div>
                
                {/* コンテンツ */}
                <div className="px-6 pb-6 space-y-6">
                    <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                            ご利用前に、利用規約の確認をお願いいたします
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-purple-100/50 dark:border-purple-800/30">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="w-5 h-5 text-purple-500 bg-white border-2 border-purple-300 rounded-md focus:ring-purple-300 dark:focus:ring-purple-500 focus:ring-2 dark:bg-gray-700 dark:border-purple-600 transition-all duration-200"
                            />
                            <div className="text-gray-800 dark:text-gray-100 text-base">
                                <Link href="/terms" target="_blank" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium">
                                    利用規約
                                </Link>
                                に同意します
                            </div>
                        </label>
                    </div>

                    {error && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl p-3">
                            <p className="text-orange-700 dark:text-orange-300 text-sm text-center">{error}</p>
                        </div>
                    )}

                    {/* ボタン */}
                    <div className="space-y-4">
                        <div className="text-center">
                            <Link 
                                href="/terms" 
                                target="_blank"
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors inline-flex items-center gap-1"
                            >
                                利用規約を確認する
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </Link>
                        </div>
                        
                        <button
                            onClick={handleAccept}
                            disabled={isLoading || !termsAccepted}
                            className={`w-full px-6 py-3.5 rounded-2xl font-medium transition-all duration-300 transform active:scale-[0.98] ${
                                isLoading || !termsAccepted
                                    ? "bg-gray-200 dark:bg-gray-600/50 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-600"
                                    : "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 text-white shadow-lg hover:shadow-xl border-0"
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>準備中...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg">🔮</span>
                                    <span className="text-base">同意してはじめる</span>
                                </div>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TermsAgreementModal;