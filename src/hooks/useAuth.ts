import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { registerUserIfNew, hasAcceptedTerms } from '@/lib/firestore/user';

interface ExtendedUser extends User {
    firestoreName?: string;
    hasAcceptedTerms?: boolean;
}

export function useAuth() {
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [loading, setLoading] = useState(true);

    // ユーザー名を取得する関数
    const fetchUserName = async (uid: string): Promise<string> => {
        try {
            const userRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                return userData.name || '';
            }
        } catch (error) {
            console.warn('ユーザー名取得エラー:', error);
        }
        return '';
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                // ユーザーが存在しない場合は登録
                try {
                    await registerUserIfNew(authUser);
                } catch (error) {
                    console.warn('ユーザー登録エラー（無視）:', error);
                }
                
                // 初期設定（Auth情報のみ）
                setUser({
                    ...authUser,
                    firestoreName: authUser.displayName || '',
                    hasAcceptedTerms: false // 初期値は未同意
                });
                
                // Firestoreから名前と同意状態を取得（非同期）
                const [firestoreName, termsAccepted] = await Promise.all([
                    fetchUserName(authUser.uid),
                    hasAcceptedTerms(authUser.uid)
                ]);
                
                setUser({
                    ...authUser,
                    firestoreName: firestoreName || authUser.displayName || '',
                    hasAcceptedTerms: termsAccepted
                });
                
                setLoading(false);
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        
        return () => unsubscribe();
    }, []);

    // 名前更新時に呼び出す関数を追加
    const refreshUserName = async () => {
        if (user?.uid) {
            const firestoreName = await fetchUserName(user.uid);
            setUser(prev => prev ? {
                ...prev,
                firestoreName: firestoreName || prev.displayName || ''
            } : null);
        }
    };

    // 利用規約同意状態を更新する関数を追加
    const refreshTermsAcceptance = async () => {
        if (user?.uid) {
            const termsAccepted = await hasAcceptedTerms(user.uid);
            setUser(prev => prev ? {
                ...prev,
                hasAcceptedTerms: termsAccepted
            } : null);
        }
    };

    return { user, loading, refreshUserName, refreshTermsAcceptance };
}