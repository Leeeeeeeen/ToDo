// Zustandとpersistミドルウェアをインポート
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ユーザー情報を表すインターフェース
interface User {
  id: string;         // ユーザーの一意識別ID
  name: string;       // ユーザー名
  email: string;      // ユーザーのメールアドレス
}

// 認証情報を表すインターフェース
interface Credentials {
  email: string;      // ユーザーのメールアドレス
  password: string;   // ユーザーのパスワード
}

// 認証ストアを管理するためのインターフェース
interface AuthStore {
  user: User | null;                                  // 現在のユーザー情報、ログインしていない場合はnull
  isAuthenticated: boolean;                           // 認証状態を示すフラグ
  credentials: Record<string, Credentials>;           // ユーザーの認証情報を保存するためのオブジェクト
  login: (user: User, password: string) => void;      // ログイン関数
  logout: () => void;                                 // ログアウト関数
  updateUsername: (newName: string) => void;          // ユーザー名を更新する関数
  getCredentials: (email: string) => Credentials | undefined; // 認証情報を取得する関数
  deleteAccount: () => void;                          // アカウント削除関数
}

// Zustandを使って認証ストアを作成
export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,                                     // 初期ユーザー情報はnull
      isAuthenticated: false,                         // 初期状態では認証されていない
      credentials: {},                                // 認証情報の初期状態は空オブジェクト
      // ログイン処理を行う関数
      login: (user, password) => 
        set((state) => ({
          user,                                       // ユーザー情報をセット
          isAuthenticated: true,                      // 認証状態をtrueに設定
          credentials: {
            ...state.credentials,                     // 既存の認証情報をコピー
            [user.email]: { email: user.email, password } // 新しいユーザーの認証情報を追加
          }
        })),
      // ログアウト処理を行う関数
      logout: () => set({ user: null, isAuthenticated: false }),
      // ユーザー名を更新する関数
      updateUsername: (newName) => 
        set((state) => ({
          user: state.user ? { ...state.user, name: newName } : null // ユーザー名を更新
        })),
      // 指定したメールアドレスに対応する認証情報を取得する関数
      getCredentials: (email) => get().credentials[email],
      // アカウントを削除する関数
      deleteAccount: () => {
        const user = get().user;
        if (!user) return;                            // ユーザーが存在しない場合は終了
        
        set((state) => ({
          user: null,                                 // ユーザー情報をnullに設定
          isAuthenticated: false,                     // 認証状態をfalseに設定
          credentials: Object.fromEntries(            // 指定したユーザーの認証情報を削除
            Object.entries(state.credentials).filter(([email]) => email !== user.email)
          )
        }));
      }
    }),
    {
      name: 'auth-storage',                           // ローカルストレージのキー名
    }
  )
);