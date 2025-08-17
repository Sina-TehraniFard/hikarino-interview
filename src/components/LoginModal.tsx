'use client';
    import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
// registerUserIfNewとcheckNeedsNameSetupは削除
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { hasAcceptedTerms } from '@/lib/firestore/user';
import TermsAgreementModal from './TermsAgreementModal';

const LottieAnimation = dynamic(() => import('lottie-react'), { ssr: false });

interface LoginModalProps {
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [giftAnimation, setGiftAnimation] = useState<object | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [pendingGoogleUser, setPendingGoogleUser] = useState<{ uid: string } | null>(null);
    
    // この useEffect は削除 - 重複呼び出しを防ぐため
    // useAuthフックで既に認証状態を監視しているため不要

    // ギフトアニメーションを読み込み
    useEffect(() => {
        fetch('/animation/gift.json')
            .then(res => res.json())
            .then(data => setGiftAnimation(data))
            .catch(error => console.error('ギフトアニメーション読み込みエラー:', error));
    }, []);
    
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        setIsLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, provider);
            
            // 同意状態をチェック
            const hasAccepted = await hasAcceptedTerms(result.user.uid);
            
            if (!hasAccepted) {
                // 同意モーダルを表示
                setPendingGoogleUser(result.user);
                setShowTermsModal(true);
                setIsLoading(false);
                // ログイン処理は一時保留
            } else {
                // 同意済みなら通常通りログイン完了
                onClose();
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Googleログイン失敗:', error);
            setError('Googleログインに失敗しました。');
            setIsLoading(false);
        }
    };
    
    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('メールアドレスとパスワードを入力してください。');
            return;
        }
        
        // 新規登録時のみ利用規約の同意をチェック
        if (isSignUp && (!termsAccepted || !privacyAccepted)) {
            setError('利用規約とプライバシーポリシーに同意してください。');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            
            // registerUserIfNewはuseAuthフックで処理されるため削除
            onClose(); // 成功時はモーダルを閉じる
        } catch (error: unknown) {
            console.error('メール認証失敗:', error);
            const firebaseError = error as { code?: string };
            if (firebaseError.code === 'auth/email-already-in-use') {
                setError('このメールアドレスは既に登録済みです。ログインモードに切り替えました。');
                setIsSignUp(false); // 自動的にログインモードに切り替え
            } else if (firebaseError.code === 'auth/weak-password') {
                setError('パスワードは6文字以上で入力してください。');
            } else if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
                setError('メールアドレスまたはパスワードが正しくありません。');
            } else if (firebaseError.code === 'auth/invalid-email') {
                setError('正しいメールアドレスを入力してください。');
            } else {
                setError(isSignUp ? 'アカウント作成に失敗しました。' : 'ログインに失敗しました。');
            }
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[95vh] overflow-hidden transform transition-all duration-300 relative flex flex-col">
                {/* ヘッダー */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {isSignUp ? "アカウント作成" : "ログイン"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* コンテンツ */}
                <div className="px-6 py-8 overflow-y-auto flex-1">
                        <div className="text-center mb-8">
                            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4 mx-auto">
                                <div className="flex items-center justify-center gap-3">
                                    {giftAnimation && (
                                        <div className="w-10 h-10 flex-shrink-0">
                                            <LottieAnimation
                                                animationData={giftAnimation}
                                                loop={true}
                                                autoplay={true}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        </div>
                                    )}
                                    <p className="text-purple-800 dark:text-purple-200 font-semibold text-lg text-center">
                                        新規登録でタロット5回分（500コイン）を無料でプレゼント中！
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* メール・パスワードフォーム */}
                        <form onSubmit={handleEmailAuth} className="space-y-5 mb-8">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    メールアドレス
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    パスワード
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    placeholder={isSignUp ? "6文字以上で入力" : "パスワードを入力"}
                                    required
                                    minLength={6}
                                />
                            </div>
                            
                            {error && (
                                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                                </div>
                            )}
                            
                            {/* 新規登録時のみ表示される同意セクション */}
                            {isSignUp && (
                                <div className="space-y-3 border-t pt-4">
                                    {/* 利用規約 */}
                                    <label className="flex items-start gap-2">
                                        <input
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="mt-1 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            <Link href="/terms" target="_blank" className="text-purple-600 dark:text-purple-400 hover:underline">
                                                利用規約
                                            </Link>
                                            および
                                            <Link href="/legal" target="_blank" className="text-purple-600 dark:text-purple-400 hover:underline ml-1">
                                                特定商取引法に基づく表記
                                            </Link>
                                            に同意します
                                        </span>
                                    </label>

                                    {/* プライバシーポリシー */}
                                    <label className="flex items-start gap-2">
                                        <input
                                            type="checkbox"
                                            checked={privacyAccepted}
                                            onChange={(e) => setPrivacyAccepted(e.target.checked)}
                                            className="mt-1 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            <Link href="/privacy" target="_blank" className="text-purple-600 dark:text-purple-400 hover:underline">
                                                プライバシーポリシー
                                            </Link>
                                            に同意します
                                        </span>
                                    </label>
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full px-6 py-4 mt-2 rounded-lg font-semibold transition-all duration-200 transform active:scale-95 ${
                                    isLoading 
                                        ? "bg-gray-400 cursor-not-allowed" 
                                        : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl"
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        処理中...
                                    </div>
                                ) : (
                                    isSignUp ? "アカウント作成" : "ログイン"
                                )}
                            </button>
                        </form>
                        
                        {/* 切り替えボタン */}
                        <div className="text-center mb-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError('');
                                    setEmail('');
                                    setPassword('');
                                    setTermsAccepted(false);
                                    setPrivacyAccepted(false);
                                }}
                                className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium transition-colors duration-200"
                            >
                                {isSignUp 
                                    ? "既にアカウントをお持ちですか？ログインする" 
                                    : "アカウントをお持ちでない場合は？新規作成する"
                                }
                            </button>
                        </div>
                        
                    {/* 区切り線 */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">または</span>
                        </div>
                    </div>
                    
                    {/* Googleログインボタン */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md active:scale-95 ${
                            isLoading 
                                ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" 
                                : "border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900"
                        }`}
                    >
                        <Image 
                            src="/google.svg" 
                            alt="Google" 
                            width={20} 
                            height={20}
                            className="w-5 h-5"
                        />
                        Googleで{isSignUp ? "登録" : "ログイン"}
                    </button>
                </div>
            </div>
            
            {/* Google連携ログイン後の利用規約同意モーダル */}
            {showTermsModal && pendingGoogleUser && (
                <TermsAgreementModal
                    userUid={pendingGoogleUser.uid}
                    onComplete={() => {
                        setShowTermsModal(false);
                        setPendingGoogleUser(null);
                        onClose(); // 同意完了後にログインモーダルを閉じる
                    }}
                />
            )}
        </div>
    );
};

export default LoginModal; 