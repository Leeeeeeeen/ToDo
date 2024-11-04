import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Zustandライブラリから `create` と `persist` ミドルウェアをインポートします。`persist` を使用すると状態がローカルストレージに保存され、ページをリロードしてもデータが保持されます。

export interface Tweet {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  likes: string[];
  timestamp: Date;
  isPrivate: boolean;
}
// `Tweet` インターフェースはツイートの構造を定義します。`id` はツイートの一意の識別子、`content` はツイートの内容、`author` は投稿者情報、`likes` は「いいね」をしたユーザーのIDリスト、`timestamp` は投稿時間、`isPrivate` はツイートが非公開かどうかを表します。

interface Follow {
  followerId: string;
  followingId: string;
}
// `Follow` インターフェースはフォロー関係の構造を定義します。`followerId` はフォロワーのユーザーID、`followingId` はフォローされているユーザーIDです。

interface SocialStore {
  tweets: Tweet[];
  follows: Follow[];
  addTweet: (content: string, authorId: string, authorName: string, isPrivate: boolean) => void;
  deleteTweet: (id: string) => void;
  toggleLike: (tweetId: string, userId: string) => void;
  followUser: (followerId: string, followingId: string) => void;
  unfollowUser: (followerId: string, followingId: string) => void;
  getFollowers: (userId: string) => string[];
  getFollowing: (userId: string) => string[];
  getLikedTweets: (userId: string) => Tweet[];
  getVisibleTweets: (currentUserId: string | undefined) => Tweet[];
  deleteUserContent: (userId: string) => void;
}
// `SocialStore` インターフェースは、ソーシャル機能に必要なメソッドと状態プロパティを定義しています。各メソッドの詳細は後述します。

export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      tweets: [],
      follows: [],
      // 初期状態として `tweets` と `follows` 配列は空です。

      addTweet: (content, authorId, authorName, isPrivate) =>
        set((state) => ({
          tweets: [
            {
              id: crypto.randomUUID(),
              content,
              author: {
                id: authorId,
                name: authorName,
              },
              likes: [],
              timestamp: new Date(),
              isPrivate,
            },
            ...state.tweets,
          ],
        })),
      // `addTweet` 関数は新しいツイートを `tweets` 配列に追加します。ツイートIDはランダムに生成され、投稿時間は現在時刻が設定されます。

      deleteTweet: (id) =>
        set((state) => ({
          tweets: state.tweets.filter((tweet) => tweet.id !== id),
        })),
      // `deleteTweet` 関数は指定された `id` のツイートを削除します。

      toggleLike: (tweetId, userId) =>
        set((state) => ({
          tweets: state.tweets.map((tweet) =>
            tweet.id === tweetId
              ? {
                  ...tweet,
                  likes: tweet.likes.includes(userId)
                    ? tweet.likes.filter((id) => id !== userId)
                    : [...tweet.likes, userId],
                }
              : tweet
          ),
        })),
      // `toggleLike` 関数は指定した `tweetId` のツイートに「いいね」をつける/外す機能です。`userId` が `likes` 配列に含まれていれば削除し、含まれていなければ追加します。

      followUser: (followerId, followingId) =>
        set((state) => ({
          follows: [...state.follows, { followerId, followingId }],
        })),
      // `followUser` 関数は `follows` 配列に新しいフォロー関係を追加します。

      unfollowUser: (followerId, followingId) =>
        set((state) => ({
          follows: state.follows.filter(
            (f) => !(f.followerId === followerId && f.followingId === followingId)
          ),
        })),
      // `unfollowUser` 関数は指定された `followerId` と `followingId` のフォロー関係を削除します。

      getFollowers: (userId) =>
        get().follows
          .filter((f) => f.followingId === userId)
          .map((f) => f.followerId),
      // `getFollowers` 関数は指定した `userId` のフォロワーIDリストを返します。

      getFollowing: (userId) =>
        get().follows
          .filter((f) => f.followerId === userId)
          .map((f) => f.followingId),
      // `getFollowing` 関数は指定した `userId` がフォローしているユーザーIDリストを返します。

      getLikedTweets: (userId) =>
        get().tweets.filter((tweet) => tweet.likes.includes(userId)),
      // `getLikedTweets` 関数は指定した `userId` が「いいね」したツイートを返します。

      getVisibleTweets: (currentUserId) =>
        get().tweets.filter((tweet) => 
          !tweet.isPrivate || tweet.author.id === currentUserId
        ),
      // `getVisibleTweets` 関数は、公開ツイートか、自分が投稿した非公開ツイートのみを返します。`currentUserId` がツイート投稿者のIDと一致する場合、非公開ツイートも表示されます。

      deleteUserContent: (userId) =>
        set((state) => ({
          tweets: state.tweets.filter((tweet) => tweet.author.id !== userId),
          follows: state.follows.filter(
            (f) => f.followerId !== userId && f.followingId !== userId
          ),
        })),
      // `deleteUserContent` 関数は、指定された `userId` に関連するツイートやフォロー情報を削除します。

    }),
    {
      name: 'social-storage',
    }
  )
);
// `persist` ミドルウェアにより、`social-storage` という名前で `localStorage` にこのストアのデータが保存され、データはリロード後も維持されます。