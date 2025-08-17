// ハンバーガーメニューコンポーネント

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeIcon from "../icons/HomeIcon";
import { User } from "@/types";
import dynamic from "next/dynamic";
import ModalHeader from "./ModalHeader";

const LottieAnimation = dynamic(() => import('lottie-react'), { ssr: false });

interface HamburgerMenuProps {
  user: User;
  onLogout: () => void;
  onRequireLogin?: () => void;
  displayCoins: number;
  onCoinClick?: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ 
  user, 
  onLogout, 
  onRequireLogin,
  displayCoins,
  onCoinClick
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [coinAnimation, setCoinAnimation] = useState<object | null>(null);

  // コインアニメーションを読み込み
  useEffect(() => {
    fetch('/animation/coin.json')
      .then(res => res.json())
      .then(data => setCoinAnimation(data))
      .catch(error => console.error('コインアニメーション読み込みエラー:', error));
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleHistoryClick = () => {
    if (!user?.uid && onRequireLogin) {
      onRequireLogin();
    } else {
      router.push("/history");
    }
    setMenuOpen(false);
  };

  const handleLoginClick = () => {
    if (onRequireLogin) onRequireLogin();
    setMenuOpen(false);
  };

  return (
    <div className="relative">
      {/* Hamburger menu button */}
      <button
        className="flex flex-col justify-center items-center w-12 h-12 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-200 relative z-20 group"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="メニューを開く"
      >
        <span className={`block w-6 h-0.5 bg-purple-600 dark:bg-purple-400 mb-1.5 rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-6 h-0.5 bg-purple-600 dark:bg-purple-400 mb-1.5 rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-purple-600 dark:bg-purple-400 rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>
      
      {/* Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 animate-fadeIn" onClick={() => setMenuOpen(false)} />
      )}
      
      {/* Slide-out menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-out z-30 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header with ModalHeader */}
        <ModalHeader 
          title="メニュー"
          onClose={() => setMenuOpen(false)}
          showCloseButton={true}
        />
        
        {/* User Info Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
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
            <button 
              onClick={() => {
                onCoinClick?.();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg shadow-sm border border-purple-200 dark:border-purple-700 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer w-full"
            >
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
            </button>
          </div>
        </div>
        
        {/* Menu Items */}
        <nav className="p-6 space-y-2">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded-lg transition-all duration-200 group"
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
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded-lg transition-all duration-200 group"
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
          
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            {user?.uid ? (
              <button
                onClick={() => {
                  onLogout();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all duration-200 group"
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
              <button
                onClick={handleLoginClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg transition-all duration-200 group hover:shadow-lg active:scale-95"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-700/20 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium">ログイン</p>
                  <p className="text-xs text-purple-200">アカウントを作成</p>
                </div>
              </button>
            )}
          </div>
        </nav>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            ヒカリノ タロット占い
          </p>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;