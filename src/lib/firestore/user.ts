import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';

export async function registerUserIfNew(user: User) {
    const ref = doc(db, 'users', user.uid);
    
    try {
        // 既存ユーザーチェック
        const snap = await getDoc(ref);
        if (snap.exists()) {
            console.log('User already exists:', user.email);
            return; // 既存ユーザーなら何もしない
        }
    } catch (readError) {
        // 読み取り権限がない場合は、とりあえず作成を試行
        console.warn('User existence check failed, attempting creation:', readError);
    }
    
    try {
        // ユーザー作成を試行
        const userData = {
            name: user.displayName ?? '',
            email: user.email ?? '',
            createdAt: new Date().toISOString(),
            coins: 500,
            needsNameSetup: !user.displayName || user.displayName === '',
            // 利用規約同意情報（新規フィールド）
            termsAcceptedAt: null,
            privacyAcceptedAt: null,
        };
        
        await setDoc(ref, userData);
        console.log('User created successfully:', user.email);
    } catch (createError) {
        if (createError instanceof Error) {
            if (createError.message.includes('Missing or insufficient permissions')) {
                console.warn('User creation failed due to permissions (may be missing read after create):', createError);
                return;
            }
            console.error('Unexpected error during user creation:', createError);
            throw createError;
        }
        throw createError;
    }
}

export async function updateUserName(uid: string, name: string) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { 
        name,
        needsNameSetup: false 
    });
}

export async function checkNeedsNameSetup(uid: string): Promise<boolean> {
    try {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            return false;
        }
        
        const data = userDoc.data();
        return data.needsNameSetup === true || !data.name || data.name === '';
    } catch (error) {
        console.warn('名前設定チェックでエラー:', error);
        // エラー時は名前設定不要として扱う
        return false;
    }
}

/**
 * ユーザーが利用規約に同意済みかチェック
 * @param uid ユーザーID
 * @returns 同意済みの場合true
 */
export async function hasAcceptedTerms(uid: string): Promise<boolean> {
    try {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            return false;
        }
        
        const data = userDoc.data();
        // 両方の同意が記録されている場合のみtrue
        return !!(data.termsAcceptedAt && data.privacyAcceptedAt);
    } catch (error) {
        console.error('利用規約同意チェックでエラー:', error);
        return false;
    }
}

/**
 * 利用規約への同意を記録
 * @param uid ユーザーID
 */
export async function recordTermsAcceptance(uid: string): Promise<void> {
    try {
        const now = new Date().toISOString();
        const userRef = doc(db, 'users', uid);
        
        await updateDoc(userRef, {
            termsAcceptedAt: now,
            privacyAcceptedAt: now
        });
        
        console.log('利用規約同意を記録しました:', uid);
    } catch (error) {
        console.error('利用規約同意の記録でエラー:', error);
        throw error;
    }
}