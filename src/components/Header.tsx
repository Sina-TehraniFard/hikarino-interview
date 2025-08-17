"use client";

import React, { useEffect } from "react";
import { useCoinAnimation } from "@/hooks/useCoinAnimation";
import { useCoinContext } from "@/contexts/CoinContext";
import HamburgerMenu from "@/components/ui/HamburgerMenu";
import UserInfo from "@/components/ui/UserInfo";
import { User } from "@/types";

interface HeaderProps {
    user: User;
    onLogout: () => void;
    coins: number;
    onRequireLogin?: () => void;
    userId?: string | undefined;
    onCoinClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, coins, onRequireLogin, userId, onCoinClick }) => {
    const { displayCoins, startAnimation } = useCoinAnimation(coins, userId);
    const { onCoinPurchase } = useCoinContext();
    
    useEffect(() => {
        onCoinPurchase(startAnimation);
    }, [onCoinPurchase, startAnimation]);


    return (
        <>
            <header className="w-full bg-transparent">
                <div className="max-w-lg mx-auto px-6">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        <div>
                            <h1 className="text-xl md:text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                                ヒカリノ タロット占い
                            </h1>
                        </div>
                        {/* モバイルメニュー（768px未満で表示） */}
                        <div className="md:hidden">
                            <HamburgerMenu 
                                user={user} 
                                onLogout={onLogout} 
                                onRequireLogin={onRequireLogin}
                                displayCoins={displayCoins}
                                onCoinClick={onCoinClick}
                            />
                        </div>
                        
                        {/* デスクトップではサイドバーがあるのでメニューは非表示 */}
                    </div>
                </div>
            {/* モバイル版のみユーザー情報を表示 */}
            <div className="md:hidden">
                <UserInfo user={user} displayCoins={displayCoins} onCoinClick={onCoinClick} />
            </div>
            </header>
        </>
    );
};

export default Header; 