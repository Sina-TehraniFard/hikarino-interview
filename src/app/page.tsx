"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/hooks/useAuth";
import {useFortune} from "@/hooks/useFortune";
import {useCoinAnimation} from "@/hooks/useCoinAnimation";
import {signOut} from "firebase/auth";
import {auth} from "@/lib/firebase";
import Header from "@/components/Header";
import {useCoinContext} from "@/contexts/CoinContext";
import LoginModal from "@/components/LoginModal";
import CoinPurchaseModal from "@/components/CoinPurchaseModal";
import NameSetupModal from "@/components/NameSetupModal";
import TermsAgreementModal from "@/components/TermsAgreementModal";
import Button from "@/components/ui/Button";
import TarotCards from "@/components/ui/TarotCards";
import QuestionForm from "@/components/ui/QuestionForm";
import FortuneResult from "@/components/ui/FortuneResult";
import AppIntro from "@/components/ui/AppIntro";
import Sidebar from "@/components/ui/Sidebar";
import PageBackground from "@/components/ui/PageBackground";
import MessageDialog from "@/components/ui/MessageDialog";
import WaitingAnimation from "@/components/ui/WaitingAnimation";
import GlassBox from "@/components/ui/GlassBox";
import {useState} from "react";
import {checkNeedsNameSetup} from "@/lib/firestore/user";

export default function Home() {
    const {user, loading, refreshUserName, refreshTermsAcceptance} = useAuth();
    const router = useRouter();
    const {coins, refreshCoins} = useCoinContext();
    const {displayCoins} = useCoinAnimation(coins, user?.uid);
    const [showLogin, setShowLogin] = useState(false);
    const [showCoinModal, setShowCoinModal] = useState(false);
    const [showMessageDialog, setShowMessageDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [allCardsFlipped, setAllCardsFlipped] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [showNameSetup, setShowNameSetup] = useState(false);

    const {
        question,
        cards,
        result,
        isLoading,
        hasFortuned,
        error,
        showWaitingAnimation,
        setQuestion,
        handleDrawCards,
        handleFortune,
        restoreGuestData,
        resetFortune,
        onAnimationComplete,
    } = useFortune();

    useEffect(() => {
        restoreGuestData(user);
        refreshCoins(true);
    }, [user, refreshCoins, restoreGuestData]);
    
    // 名前設定が必要かチェック（別のuseEffectで管理）
    useEffect(() => {
        if (user?.uid && !loading) {
            // ログイン完了後に少し遅延を入れて、Firestoreのデータが確実に作成されるのを待つ
            const timer = setTimeout(() => {
                checkNeedsNameSetup(user.uid).then(needsSetup => {
                    setShowNameSetup(needsSetup);
                });
            }, 500);
            
            return () => clearTimeout(timer);
        } else {
            setShowNameSetup(false);
        }
    }, [user?.uid, loading]);

    // エラーが発生したらダイアログを表示
    useEffect(() => {
        if (error) {
            setShowErrorDialog(true);
        }
    }, [error]);

    if (loading) {
        return (
            <main className="flex min-h-screen relative overflow-hidden">
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </main>
        );
    }

    // 認証済みだが利用規約に未同意の場合は同意モーダルを表示
    if (user && user.hasAcceptedTerms === false) {
        return (
            <main className="flex min-h-screen relative overflow-hidden">
                <PageBackground />
                <TermsAgreementModal
                    userUid={user.uid}
                    onComplete={async () => {
                        await refreshTermsAcceptance();
                    }}
                />
            </main>
        );
    }

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    const handleFortuneClick = () => {
        handleFortune(
            user,
            () => setShowLogin(true),
            () => setShowCoinModal(true)
        );
    };

    const handleCoinModalClose = async () => {
        await refreshCoins(true); // アニメーションありでリフレッシュ
        setShowCoinModal(false);
    };

    const handleDrawCardsClick = () => {
        if (!question.trim()) {
            setShowMessageDialog(true);
            return;
        }
        setAllCardsFlipped(false); // フリップ状態をリセット
        handleDrawCards();
    };

    const handleStepClick = (stepNumber: number) => {
        if (stepNumber === 1) {
            const questionSection = document.getElementById('question-section');
            if (questionSection) {
                questionSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                // スクロール完了後にフォーカス
                setTimeout(() => {
                    const textarea = questionSection.querySelector('textarea');
                    if (textarea) {
                        textarea.focus();
                    }
                }, 600);
            }
        }
    };

    return (
        <main className="flex min-h-screen relative overflow-hidden">
            {/* PC版サイドバー（768px以上で表示） */}
            <div className="hidden md:block">
                <Sidebar
                    user={user || {displayName: "ゲスト", email: "", uid: undefined}}
                    onLogout={handleLogout}
                    onRequireLogin={() => setShowLogin(true)}
                    displayCoins={displayCoins}
                    onCoinClick={() => setShowCoinModal(prev => !prev)}
                />
            </div>

            <PageBackground />
            
            <div className="flex-1 md:ml-72 overflow-hidden">
                {/* モバイル版（768px未満）- 従来と同じ */}
                <div className="md:hidden w-full max-w-lg mx-auto min-h-screen relative px-6 space-y-6 pb-12">

                    <Header
                        user={user || {displayName: "ゲスト", email: "", uid: undefined}}
                        coins={user ? coins : 0}
                        onLogout={handleLogout}
                        onRequireLogin={() => setShowLogin(true)}
                        userId={user?.uid}
                        onCoinClick={() => setShowCoinModal(prev => !prev)}
                    />

                    {/* 簡単3ステップ - 不安解消 */}
                    <AppIntro onStepClick={handleStepClick} />
                    {/* 質問入力 - 実際のアクション */}
                    <div id="question-section">
                        <QuestionForm
                            question={question}
                            onChange={setQuestion}
                            disabled={cards.length > 0}
                        />
                    </div>

                    {cards.length === 0 && (
                        <Button 
                            onClick={handleDrawCardsClick} 
                            variant="magical"
                            fullWidth
                        >
                            タロットを引く
                        </Button>
                    )}

                    <TarotCards 
                        cards={cards}
                        onAllFlipped={() => setAllCardsFlipped(true)}
                    />

                    {cards.length > 0 && allCardsFlipped && !hasFortuned && !isLoading && (
                        <Button
                            onClick={handleFortuneClick}
                            disabled={isLoading}
                            fullWidth
                        >
                            占い結果を見る
                        </Button>
                    )}

                    <div className="mt-10 w-full max-w-md">
                        {/* 固定領域でレイアウトシフトを防ぐ */}
                        <div className="mb-6 text-center transition-all duration-300 ease-in-out min-h-[44px] flex items-center justify-center">
                            {hasFortuned && (
                                <Button onClick={() => {
                                    setIsResetting(true);
                                    setTimeout(() => {
                                        resetFortune();
                                        setAllCardsFlipped(false);
                                        setIsResetting(false);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }, 500);
                                }} fullWidth>
                                    もう一度占う
                                </Button>
                            )}
                        </div>

                        {showWaitingAnimation ? (
                            <WaitingAnimation 
                                onAnimationComplete={onAnimationComplete}
                            />
                        ) : (
                            (hasFortuned || result) && <FortuneResult result={result}/>
                        )}

                        {/* 下部の「もう一度占う」ボタンは削除（上部に統合済み） */}
                    </div>
                </div>

                {/* PC版（768px以上）- ガラス背景付き */}
                <div className="hidden md:block w-full max-w-lg mx-auto min-h-screen relative p-4">
                    <GlassBox className="transition-all duration-500 ease-in-out">
                        <div className="px-6 py-6 space-y-6">

                            <Header
                                user={user || {displayName: "ゲスト", email: "", uid: undefined}}
                                coins={user ? coins : 0}
                                onLogout={handleLogout}
                                onRequireLogin={() => setShowLogin(true)}
                                userId={user?.uid}
                                onCoinClick={() => setShowCoinModal(prev => !prev)}
                            />

                            {/* 簡単3ステップ - 不安解消 */}
                            <div className={`transition-all duration-500 ease-in-out ${isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
                                <AppIntro onStepClick={handleStepClick} />
                            </div>
                            
                            {/* 質問入力 - 実際のアクション */}
                            <div id="question-section" className={`transition-all duration-500 ease-in-out ${isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
                                <QuestionForm
                                    question={question}
                                    onChange={setQuestion}
                                    disabled={cards.length > 0}
                                />
                            </div>

                            <div className={`transition-all duration-500 ease-in-out ${cards.length === 0 && !isResetting ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}>
                                {cards.length === 0 && (
                                    <Button 
                                        onClick={handleDrawCardsClick} 
                                        variant="magical"
                                        fullWidth
                                    >
                                        タロットを引く
                                    </Button>
                                )}
                            </div>

                            <div className={`transition-all duration-700 ease-in-out ${cards.length > 0 && !isResetting ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
                                <TarotCards 
                                    cards={cards}
                                    onAllFlipped={() => setAllCardsFlipped(true)}
                                />
                            </div>

                            <div className={`transition-all duration-500 ease-in-out ${cards.length > 0 && allCardsFlipped && !hasFortuned && !isLoading && !isResetting ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}>
                                {cards.length > 0 && allCardsFlipped && !hasFortuned && !isLoading && (
                                    <Button
                                        onClick={handleFortuneClick}
                                        disabled={isLoading}
                                        fullWidth
                                    >
                                        占い結果を見る
                                    </Button>
                                )}
                            </div>

                            <div className="mt-10 w-full max-w-md">
                                {/* 固定領域でレイアウトシフトを防ぐ */}
                                <div className="mb-6 text-center transition-all duration-500 ease-in-out min-h-[44px] flex items-center justify-center">
                                    {hasFortuned && (
                                        <Button onClick={() => {
                                            setIsResetting(true);
                                            setTimeout(() => {
                                                resetFortune();
                                                setAllCardsFlipped(false);
                                                setIsResetting(false);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }, 500);
                                        }} fullWidth>
                                            もう一度占う
                                        </Button>
                                    )}
                                </div>

                                <div className={`transition-all duration-700 ease-in-out ${showWaitingAnimation || hasFortuned || result ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
                                    {showWaitingAnimation ? (
                                        <WaitingAnimation 
                                            onAnimationComplete={onAnimationComplete}
                                        />
                                    ) : (
                                        (hasFortuned || result) && <FortuneResult result={result}/>
                                    )}
                                </div>

                                {/* 下部の「もう一度占う」ボタンは削除（上部に統合済み） */}
                            </div>
                        </div>
                    </GlassBox>
                </div>

                {/* LoginModalを一箇所にまとめて配置 */}
                {showLogin && <LoginModal onClose={() => setShowLogin(false)}/>}

                <CoinPurchaseModal
                    isOpen={showCoinModal}
                    onClose={handleCoinModalClose}
                    uid={user?.uid}
                />
                
                {user?.uid && (
                    <NameSetupModal
                        isOpen={showNameSetup}
                        uid={user.uid}
                        onComplete={() => {
                            setShowNameSetup(false);
                            refreshCoins(true);
                            refreshUserName(); // 名前を再取得
                        }}
                    />
                )}

                <MessageDialog
                    isOpen={showMessageDialog}
                    onClose={() => setShowMessageDialog(false)}
                    type="warning"
                    message="質問を入力してからタロットを引いてください。"
                />

                <MessageDialog
                    isOpen={showErrorDialog}
                    onClose={() => setShowErrorDialog(false)}
                    type="error"
                    message={error || "占い中にエラーが発生しました。もう一度お試しください。"}
                />
            </div>
        </main>
    );
}