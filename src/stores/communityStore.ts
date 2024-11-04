import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Zustandライブラリから `create` 関数と `persist` ミドルウェアをインポートします。`persist` を利用することで、状態がローカルストレージに保存され、ブラウザのリロード後もデータが保持されます。

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  members: string[];
  createdAt: Date;
}
// `Community` インターフェースはコミュニティの構造を定義します。各コミュニティには、`id`、`name`、`description`、`category`、`members`、および作成日時 (`createdAt`) があります。

interface CommunityStore {
  communities: Community[];
  userCommunities: string[];
  addCommunity: (community: Omit<Community, 'id' | 'members' | 'createdAt'>) => void;
  joinCommunity: (communityId: string, userId: string) => void;
  leaveCommunity: (communityId: string, userId: string) => void;
  getUserCommunityCount: (userId: string) => number;
  removeUserFromAllCommunities: (userId: string) => void;
}
// `CommunityStore` インターフェースは、コミュニティのリスト (`communities`) とユーザーが参加しているコミュニティのリスト (`userCommunities`) を格納します。各関数はコミュニティの追加やユーザーの参加/離脱、参加コミュニティのカウント取得などを行います。

export const useCommunityStore = create<CommunityStore>()(
  persist(
    (set, get) => ({
      communities: [],
      userCommunities: [],
      // 初期状態では `communities` と `userCommunities` は空の配列です。

      addCommunity: (community) =>
        set((state) => ({
          communities: [
            ...state.communities,
            {
              ...community,
              id: crypto.randomUUID(),
              members: [],
              createdAt: new Date(),
            },
          ],
        })),
      // `addCommunity` 関数は、新しいコミュニティを `communities` 配列に追加します。各コミュニティにはランダムなIDが割り当てられ、作成日時が現在の日時で設定されます。

      joinCommunity: (communityId, userId) =>
        set((state) => {
          const userCommunityCount = get().getUserCommunityCount(userId);
          if (userCommunityCount >= 5) {
            throw new Error('コミュニティへの参加は5つまでです');
          }
          return {
            communities: state.communities.map((com) =>
              com.id === communityId
                ? { ...com, members: [...com.members, userId] }
                : com
            ),
          };
        }),
      // `joinCommunity` 関数は、指定された `communityId` のコミュニティにユーザーを追加します。ユーザーがすでに5つのコミュニティに参加している場合、エラーメッセージが表示されます。

      leaveCommunity: (communityId, userId) =>
        set((state) => ({
          communities: state.communities.map((com) =>
            com.id === communityId
              ? { ...com, members: com.members.filter((id) => id !== userId) }
              : com
          ),
        })),
      // `leaveCommunity` 関数は、指定された `communityId` のコミュニティからユーザーを削除します。

      getUserCommunityCount: (userId) =>
        get().communities.filter((com) => com.members.includes(userId)).length,
      // `getUserCommunityCount` 関数は、指定された `userId` が参加しているコミュニティ数を返します。

      removeUserFromAllCommunities: (userId) =>
        set((state) => ({
          communities: state.communities.map((com) => ({
            ...com,
            members: com.members.filter((id) => id !== userId),
          })),
        })),
      // `removeUserFromAllCommunities` 関数は、指定された `userId` をすべてのコミュニティから削除します。

    }),
    {
      name: 'community-storage',
    }
  )
);
// `persist` ミドルウェアを使用して、ストアデータを `community-storage` という名前で `localStorage` に保存します。リロード後もデータが保持されます。