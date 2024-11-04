// Reactをインポート
import React from 'react';
// react-hook-formライブラリからuseFormをインポート（フォームのバリデーションに使用）
import { useForm } from 'react-hook-form';
// アイコンを提供するlucide-reactからいくつかのアイコンをインポート
import { MessageCircle, Heart, Trash2, UserPlus, UserMinus, Lock, Globe } from 'lucide-react';
// 認証に関するストアからuseAuthフックをインポート
import { useAuth } from '../stores/authStore';
// ソーシャルメディアのストアからuseSocialStoreフックをインポート
import { useSocialStore } from '../stores/socialStore';
// トースト通知用のライブラリをインポート
import toast from 'react-hot-toast';
// 日付フォーマット用のライブラリをインポート
import { format } from 'date-fns';

// ツイート投稿フォームのデータ型を定義
interface TweetForm {
  content: string;      // ツイート内容
  isPrivate: boolean;   // ツイートが非公開かどうか
}

// Socialコンポーネントの定義
function Social() {
  // 認証情報（ログインユーザー）を取得
  const { user } = useAuth();
  // ソーシャルストアから必要な関数や状態を取得
  const {
    getVisibleTweets,
    addTweet,
    deleteTweet,
    toggleLike,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
  } = useSocialStore();

  // react-hook-formのフォーム管理関数を取得
  const { register, handleSubmit, reset } = useForm<TweetForm>();

  // フォロワーとフォロー中のユーザーを取得
  const followers = user ? getFollowers(user.id) : [];
  const following = user ? getFollowing(user.id) : [];
  // ログインユーザーに表示可能なツイートを取得
  const tweets = getVisibleTweets(user?.id);

  // ツイート投稿時の処理
  const onSubmit = (data: TweetForm) => {
    // 未ログインの場合、エラーメッセージを表示して処理を中断
    if (!user) {
      toast.error('つぶやくにはログインが必要です');
      return;
    }
    // ツイートを追加し、成功メッセージを表示
    addTweet(data.content, user.id, user.name, data.isPrivate);
    toast.success('つぶやきを投稿しました！');
    reset(); // フォームをリセット
  };

  // ツイート削除時の処理
  const handleDelete = (tweetId: string) => {
    deleteTweet(tweetId);
    toast.success('つぶやきを削除しました');
  };

  // ツイートに「いいね」する処理
  const handleLike = (tweetId: string) => {
    // 未ログインの場合、エラーメッセージを表示して処理を中断
    if (!user) {
      toast.error('いいねするにはログインが必要です');
      return;
    }
    // 「いいね」を切り替え
    toggleLike(tweetId, user.id);
  };

  // ユーザーをフォローする処理
  const handleFollow = (targetUserId: string) => {
    if (!user) {
      toast.error('フォローするにはログインが必要です');
      return;
    }
    followUser(user.id, targetUserId);
    toast.success('フォローしました！');
  };

  // ユーザーのフォローを解除する処理
  const handleUnfollow = (targetUserId: string) => {
    if (!user) return;
    unfollowUser(user.id, targetUserId);
    toast.success('フォロー解除しました');
  };

  // コンポーネントのレンダリング
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">つぶやき</h1>
        {/* ログイン中のユーザーがいる場合、フォロワーとフォロー中の数を表示 */}
        {user && (
          <div className="flex gap-4 mb-6">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{following.length}</span> フォロー中
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{followers.length}</span> フォロワー
            </div>
          </div>
        )}
        {/* ツイート投稿フォーム */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <textarea
            {...register('content', { required: 'つぶやき内容を入力してください' })}
            className="w-full p-4 border rounded-lg resize-none"
            placeholder="いまどうしてる？"
            rows={3}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                {...register('isPrivate')}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                プライベートモード
              </span>
            </label>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              つぶやく
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {/* 表示可能なツイートをリスト表示 */}
        {tweets.map((tweet) => (
          <div
            key={tweet.id}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-800">{tweet.author.name}</h3>
                  {tweet.isPrivate && <Lock className="w-4 h-4 text-gray-400" />}
                  {!tweet.isPrivate && <Globe className="w-4 h-4 text-gray-400" />}
                </div>
                <p className="text-sm text-gray-500">
                  {format(new Date(tweet.timestamp), 'yyyy/MM/dd HH:mm')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* ログイン中ユーザーで、ツイートの作者が異なる場合にフォロー・フォロー解除ボタンを表示 */}
                {user && tweet.author.id !== user.id && (
                  following.includes(tweet.author.id) ? (
                    <button
                      onClick={() => handleUnfollow(tweet.author.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow(tweet.author.id)}
                      className="text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  )
                )}
                <MessageCircle className="w-5 h-5 text-gray-400" />
                {/* ログイン中ユーザーがツイートの作者の場合、削除ボタンを表示 */}
                {user && tweet.author.id === user.id && (
                  <button
                    onClick={() => handleDelete(tweet.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-gray-700 mb-4">{tweet.content}</p>
            <div className="flex items-center gap-6">
              {/* 「いいね」ボタン */}
              <button
                onClick={() => handleLike(tweet.id)}
                className={`flex items-center gap-2 transition-colors ${
                  user && tweet.likes.includes(user.id)
                    ? 'text-pink-500'
                    : 'text-gray-500 hover:text-pink-500'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span>{tweet.likes.length}</span>
              </button>
            </div>
          </div>
        ))}
        {/* ツイートがない場合のメッセージ */}
        {tweets.length === 0 && (
          <p className="text-center text-gray-600 py-8">
            まだつぶやきがありません。最初のつぶやきを投稿してみましょう！
          </p>
        )}
      </div>
    </div>
      );
    }
    
    export default Social;