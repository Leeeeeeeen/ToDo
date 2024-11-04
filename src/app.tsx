import React from 'react'; // Reactをインポート
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // React Routerのコンポーネントをインポート
import { Toaster } from 'react-hot-toast'; // 通知（トースト）表示用のコンポーネントをインポート
import Layout from './components/Layout'; // 共通レイアウト用のコンポーネントをインポート
import Dashboard from './pages/Dashboard'; // ダッシュボードページのコンポーネントをインポート
import Auth from './pages/Auth'; // 認証ページのコンポーネントをインポート
import Achievements from './pages/Achievements'; // 実績ページのコンポーネントをインポート
import Social from './pages/Social'; // ソーシャルページのコンポーネントをインポート
import Likes from './pages/Likes'; // いいねページのコンポーネントをインポート

function App() {
  return (
    <BrowserRouter> {/* アプリケーション全体でルーティング機能を提供するためにBrowserRouterでラップ */}
      <Toaster position="top-right" /> {/* 通知（トースト）を右上に表示するためのコンポーネント */}
      <Routes> {/* ルートを定義するためのコンテナ */}
        
        <Route path="/auth" element={<Auth />} /> {/* "/auth" パスにAuthコンポーネントを表示 */}
        
        <Route path="/" element={<Layout />}> {/* "/" パスにLayoutコンポーネントを表示 */}
          
          <Route index element={<Dashboard />} /> {/* "/"にアクセスした際、Dashboardコンポーネントを表示（デフォルトルート） */}
          <Route path="social" element={<Social />} /> {/* "/social" パスにSocialコンポーネントを表示 */}
          <Route path="likes" element={<Likes />} /> {/* "/likes" パスにLikesコンポーネントを表示 */}
          <Route path="achievements" element={<Achievements />} /> {/* "/achievements" パスにAchievementsコンポーネントを表示 */}
        
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App; // Appコンポーネントをエクスポートし、他のファイルで使用可能にする