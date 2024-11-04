// 必要なReactフックやライブラリ、カスタムフックをインポート
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../stores/authStore';
import toast from 'react-hot-toast';

// Zodでフォームのスキーマを定義。各フィールドの入力条件を設定
const authSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'), // メールアドレスの形式チェック
  password: z
    .string()
    .min(8, 'パスワードは8文字以上必要です') // 8文字以上
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'パスワードは英数字を含む必要があります'), // 英数字を含む必要
  name: z.string().min(1, '名前は必須です').optional(), // 名前は任意だが空でない場合のみ有効
});

// スキーマを元にした型定義
type AuthForm = z.infer<typeof authSchema>;

// 認証コンポーネントを定義
export default function Auth() {
  const [isLogin, setIsLogin] = useState(true); // ログインモードか新規登録モードかの判定
  const navigate = useNavigate(); // ページ遷移用
  const { login, getCredentials } = useAuth(); // 認証情報と認証関数を取得

  // フォームの初期化とバリデーション設定
  const {
    register, // フォームフィールドの登録
    handleSubmit, // フォーム送信のハンドラー
    formState: { errors }, // フォームのエラーステート
    setError, // エラーの設定
  } = useForm<AuthForm>({
    resolver: zodResolver(authSchema), // Zodでのバリデーション設定
  });

  // フォーム送信時の処理
  const onSubmit = (data: AuthForm) => {
    if (isLogin) { // ログインモードの場合
      const credentials = getCredentials(data.email); // 既存ユーザー情報を取得
      if (!credentials || credentials.password !== data.password) { // 認証失敗
        setError('email', { message: 'メールアドレスまたはパスワードが正しくありません' });
        return;
      }
      // ログイン処理実行
      login({ id: crypto.randomUUID(), name: credentials.email.split('@')[0], email: data.email }, data.password);
      toast.success('ログインしました！'); // ログイン成功メッセージ
    } else { // 新規登録モードの場合
      const existingUser = getCredentials(data.email); // 既存ユーザー確認
      if (existingUser) { // メールアドレスが既に登録されている場合
        setError('email', { message: 'このメールアドレスは既に登録されています' });
        return;
      }
      // 新規登録のログイン処理
      login({
        id: crypto.randomUUID(),
        name: data.name || data.email.split('@')[0], // 名前が入力されていない場合はメールアドレスの一部を代わりに使用
        email: data.email,
      }, data.password);
      toast.success('登録が完了しました！'); // 登録成功メッセージ
    }
    navigate('/'); // ホームページへリダイレクト
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CheckCircle2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">TaskMaster</h1> {/* アプリケーション名 */}
          </div>
          <p className="text-gray-600">
            {isLogin ? 'アカウントにログイン' : '新規アカウント作成'} {/* モードに応じた表示 */}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* フォームの構成 */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 名前入力欄（新規登録モードのみ表示） */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名前
                </label>
                <input
                  {...register('name')} // 名前フィールドの登録
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="名前を入力"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p> // 名前入力エラーメッセージ
                )}
              </div>
            )}

            {/* メールアドレス入力欄 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                {...register('email')} // メールアドレスフィールドの登録
                className="w-full border rounded-lg px-3 py-2"
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p> // メール入力エラーメッセージ
              )}
            </div>

            {/* パスワード入力欄 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                {...register('password')} // パスワードフィールドの登録
                className="w-full border rounded-lg px-3 py-2"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p> // パスワード入力エラーメッセージ
              )}
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors"
            >
              {isLogin ? 'ログイン' : '登録'}
            </button>
          </form>

          {/* ログイン・新規登録のモード切替ボタン */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)} // モードを切り替え
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              {isLogin
                ? 'アカウントをお持ちでない方はこちら' // 新規登録モードへの切り替え表示
                : 'すでにアカウントをお持ちの方はこちら'} // ログインモードへの切り替え表示
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}