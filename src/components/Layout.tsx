import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Trophy, MessageCircle, Heart, LogOut, User, X, Trash2 } from 'lucide-react';
import { useAuth } from '../stores/authStore';
import { useTodoStore } from '../stores/todoStore';
import { useSocialStore } from '../stores/socialStore';
import { useCommunityStore } from '../stores/communityStore';
import toast from 'react-hot-toast';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, updateUsername, deleteAccount } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const todoStore = useTodoStore();
  const socialStore = useSocialStore();
  const communityStore = useCommunityStore();

  const navItems = [
    { path: '/', icon: CheckCircle2, label: 'タスク' },
    { path: '/social', icon: MessageCircle, label: 'つぶやき' },
    { path: '/likes', icon: Heart, label: 'いいね' },
    { path: '/achievements', icon: Trophy, label: '実績' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('ログアウトしました');
    navigate('/auth');
  };

  const handleUpdateName = () => {
    if (newName.trim() && newName.length <= 10) {
      updateUsername(newName.trim());
      setIsEditingName(false);
      toast.success('ユーザー名を更新しました');
    } else if (newName.length > 10) {
      toast.error('ユーザー名は10文字以内で入力してください');
    }
  };

  const handleDeleteAccount = () => {
    if (!user) return;

    todoStore.deleteTodosByUser(user.id);
    socialStore.deleteUserContent(user.id);
    communityStore.removeUserFromAllCommunities(user.id);
    
    deleteAccount();
    
    toast.success('アカウントを削除しました');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <nav className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6">
        <div className="flex items-center gap-3 mb-8">
          <CheckCircle2 className="w-8 h-8 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-800">TaskMaster</h1>
        </div>

        {user && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-indigo-600" />
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border rounded"
                    placeholder="新しい名前"
                    maxLength={10}
                  />
                  <button
                    onClick={handleUpdateName}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(user.name);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{user.name}</span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    編集
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        )}
        
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-6 left-6 space-y-2">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-3 p-3 text-red-600 hover:text-red-800 transition-colors w-full"
          >
            <Trash2 className="w-5 h-5" />
            <span>アカウント削除</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 text-gray-600 hover:text-gray-800 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>ログアウト</span>
          </button>
        </div>
      </nav>

      <main className="ml-64 p-8">
        <Outlet />
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">アカウント削除の確認</h2>
            <p className="text-gray-600 mb-6">
              アカウントを削除すると、すべてのデータが完全に削除され、復元することはできません。
              本当に削除しますか？
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}