import React, { useState } from 'react';
import { Users, Plus, MessageSquare, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCommunityStore } from '../stores/communityStore';
import { useAuth } from '../stores/authStore';
import toast from 'react-hot-toast';

const communitySchema = z.object({
  name: z.string().min(1, '必須項目です'),
  description: z.string().min(1, '必須項目です'),
  category: z.string().min(1, '必須項目です'),
});

type CommunityForm = z.infer<typeof communitySchema>;

function Community() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const {
    communities,
    addCommunity,
    joinCommunity,
    leaveCommunity,
    getUserCommunityCount,
  } = useCommunityStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommunityForm>({
    resolver: zodResolver(communitySchema),
  });

  const onSubmit = (data: CommunityForm) => {
    addCommunity(data);
    toast.success('コミュニティを作成しました！');
    setIsModalOpen(false);
    reset();
  };

  const handleJoin = (communityId: string) => {
    if (!user) {
      toast.error('コミュニティに参加するにはログインが必要です');
      return;
    }
    try {
      joinCommunity(communityId, user.id);
      toast.success('コミュニティに参加しました！');
    } catch (error) {
      toast.error('コミュニティへの参加は5つまでです');
    }
  };

  const handleLeave = (communityId: string) => {
    if (!user) return;
    leaveCommunity(communityId, user.id);
    toast.success('コミュニティを退会しました');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">コミュニティ</h1>
          {user && (
            <p className="text-gray-600 mt-2">
              参加中のコミュニティ: {getUserCommunityCount(user.id)}/5
            </p>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          コミュニティを作成
        </button>
      </div>

      <div className="grid gap-6">
        {communities.map((community) => (
          <div
            key={community.id}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {community.name}
                </h2>
                <span className="inline-block bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded mt-2">
                  {community.category}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>{community.members.length}人</span>
              </div>
            </div>
            <p className="text-gray-600 mb-6">{community.description}</p>
            <div className="flex justify-between items-center">
              <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span>ディスカッションに参加</span>
              </button>
              {user && community.members.includes(user.id) ? (
                <button
                  onClick={() => handleLeave(community.id)}
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                  退会する
                </button>
              ) : (
                <button
                  onClick={() => handleJoin(community.id)}
                  className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  参加する
                </button>
              )}
            </div>
          </div>
        ))}
        {communities.length === 0 && (
          <p className="text-center text-gray-600 py-8">
            まだコミュニティがありません。最初のコミュニティを作成してみましょう！
          </p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              新規コミュニティ作成
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  コミュニティ名
                </label>
                <input
                  {...register('name')}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="コミュニティの名前"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリー
                </label>
                <select
                  {...register('category')}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">カテゴリーを選択</option>
                  <option value="資格">資格</option>
                  <option value="学習">学習</option>
                  <option value="趣味">趣味</option>
                  <option value="その他">その他</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  {...register('description')}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="コミュニティの説明"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Community;