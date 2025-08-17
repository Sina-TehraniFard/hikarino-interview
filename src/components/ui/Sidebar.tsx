// PC版左サイドバーコンポーネント
// モバイルのHamburgerMenuと完全一致した機能を提供

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeIcon from "../icons/HomeIcon";
import { User } from "@/types";
import dynamic from "next/dynamic";
import GlassBox from "./GlassBox";
import ModalHeader from "./ModalHeader";

const LottieAnimation = dynamic(() => import('lottie-react'), { ssr: false });

interface SidebarProps {
  user: User;
  onLogout: () => void;
  onRequireLogin?: () => void;
  displayCoins: number;
  onCoinClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  onLogout, 
  onRequireLogin,
  displayCoins,
  onCoinClick
}) => {
  const router = useRouter();
  const [coinAnimation, setCoinAnimation] = useState<object | null>(null);

  // コインアニメーションを読み込み
  useEffect(() => {
    fetch('/animation/coin.json')
      .then(res => res.json())
      .then(data => setCoinAnimation(data))
      .catch(error => console.error('コインアニメーション読み込みエラー:', error));
  }, []);

  const handleHistoryClick = () => {
    if (!user?.uid && onRequireLogin) {
      onRequireLogin();
    } else {
      router.push("/history");
    }
  };

  const handleLoginClick = () => {
    if (onRequireLogin) onRequireLogin();
  };

  return (
    <div className="fixed left-4 top-4 h-[calc(100vh-32px)] w-64 z-30">
      <GlassBox className="h-full">
        {/* Header with ModalHeader */}
        <ModalHeader 
          title="メニュー"
          showCloseButton={false}
        />
        
        {/* User Info Section */}
        <div className="p-6 border-b border-white/20 dark:border-gray-700/50">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.firestoreName || user?.displayName || "ゲスト"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || "ログインしていません"}</p>
              </div>
            </div>
            {/* コイン表示 */}
            <GlassBox onClick={onCoinClick} className="!rounded-lg">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-5 h-5 relative">
                  {coinAnimation ? (
                    <LottieAnimation
                      animationData={coinAnimation}
                      loop={true}
                      autoplay={true}
                      style={{ width: 20, height: 20 }}
                    />
                  ) : (
                    <div className="w-5 h-5 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">
                  {typeof displayCoins === 'number' ? displayCoins.toLocaleString() : 0}
                </span>
              </div>
            </GlassBox>
          </div>
        </div>
      
        {/* Menu Items */}
        <nav className="p-6 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-700/30 rounded-lg transition-all duration-200 group backdrop-blur-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-950/40 transition-colors duration-200">
              <HomeIcon />
            </div>
            <div>
              <p className="font-medium">ホーム</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">占いを始める</p>
            </div>
          </Link>
          
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-700/30 rounded-lg transition-all duration-200 group backdrop-blur-sm"
            onClick={handleHistoryClick}
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-950/40 transition-colors duration-200">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium">占い履歴</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">過去の占い結果</p>
            </div>
          </button>
          
          <div className="pt-4 mt-4 border-t border-white/20 dark:border-gray-700/50">
            {user?.uid ? (
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 rounded-lg transition-all duration-200 group backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-rose-100 dark:group-hover:bg-rose-950/30 transition-colors duration-200">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-rose-600 dark:group-hover:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium">ログアウト</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">アカウントから離れる</p>
                </div>
              </button>
            ) : (
              <GlassBox onClick={handleLoginClick} className="!rounded-lg !bg-purple-600/30 dark:!bg-purple-600/30">
                <div className="flex items-center gap-3 px-4 py-3 text-white">
                  <div className="w-10 h-10 rounded-lg bg-purple-700/20 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">ログイン</p>
                    <p className="text-xs text-purple-200">アカウントを作成</p>
                  </div>
                </div>
              </GlassBox>
            )}
          </div>
        </nav>
      
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/20 dark:border-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            ヒカリノ タロット占い
          </p>
        </div>
      </GlassBox>
    </div>
  );
};

export default Sidebar;