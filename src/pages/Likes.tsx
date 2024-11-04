import React from 'react';
import { Heart, MessageCircle } from 'lucide-react'; // アイコンをインポート
import { useAuth } from '../stores/authStore'; // 認証情報を取得するカスタムフック
import { useSocialStore } from '../stores/socialStore'; // ソーシャルメディアの状態管理フック
import { format } from 'date-fns'; // 日付フォーマット用ライブラリ

function Likes() {
  const { user } = useAuth(); // ログイン中のユーザー情報を取得
  const { getLikedTweets, toggleLike } = useSocialStore(); // 「いいね」関連の関数を取得

  const likedTweets = user ? getLikedTweets(user.id) : []; // ログイン中ユーザーの「いいね」したツイートのリスト

  // ツイートの「いいね」を取り消す処理
  const handleUnlike = (tweetId: string) => {
    if (!user) return; // ユーザーがログインしていなければ何もしない
    toggleLike(tweetId, user.id); // 「いいね」のトグル（いいね・取り消しを切り替え）
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">いいねしたつぶやき</h1>

      <div className="space-y-6">
        {likedTweets.map((tweet) => (
          <div
            key={tweet.id}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-800">{tweet.author.name}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(tweet.timestamp), 'yyyy/MM/dd HH:mm')}
                </p>
              </div>
              <MessageCircle className="w-5 h-5 text-gray-400" /> {/* コメントアイコン */}
            </div>
            <p className="text-gray-700 mb-4">{tweet.content}</p> {/* ツイート内容を表示 */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleUnlike(tweet.id)} // いいねを取り消すボタン
                className="flex items-center gap-2 text-pink-500"
              >
                <Heart className="w-5 h-5" /> {/* ハートアイコン */}
                <span>{tweet.likes.length}</span> {/* いいね数を表示 */}
              </button>
            </div>
          </div>
        ))}
        {likedTweets.length === 0 && (
          <p className="text-center text-gray-600 py-8">
            まだいいねしたつぶやきはありません。
          </p>
        )}
      </div>
    </div>
  );
}

export default Likes;