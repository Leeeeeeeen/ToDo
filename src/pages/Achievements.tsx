// Reactをインポート（コンポーネント作成のため）
import React from 'react';

// lucide-reactライブラリからアイコンをインポート
import { Trophy, Calendar, Target, Award } from 'lucide-react';

// タスク管理用ストアからuseTodoStoreフックをインポート
import { useTodoStore } from '../stores/todoStore';

// 日付フォーマット用ライブラリdate-fnsからformat関数をインポート
import { format } from 'date-fns';

// achievementsコンポーネントの定義
function achievements() {
  // タスク管理ストアから完了済みのタスクを取得する関数を呼び出し
  const completedTodos = useTodoStore((state) => state.getCompletedTodos());

  // 実績データの配列。各要素は実績の詳細（アイコン、タイトル、進捗）を持つ
  const achievements = [
    {
      id: '1',  // 一意のID
      icon: Trophy,  // 実績のアイコン
      title: 'タスクマスター',  // 実績のタイトル
      description: '10個のタスクを完了',  // 実績の説明
      progress: (completedTodos.length / 10) * 100,  // 進捗率を計算
    },
    {
      id: '2',
      icon: Calendar,
      title: '継続の達人',
      description: '7日連続でタスクを完了',
      progress: 70,  // 固定値（例として70%）
    },
    {
      id: '3',
      icon: Target,
      title: '期限厳守',
      description: '期限内に5つのタスクを完了',
      progress: 60,  // 固定値（例として60%）
    },
  ];

  // レンダリングするHTML
  return (
    // コンテンツの最大幅を設定し、中央寄せするためのdiv
    <div className="max-w-4xl mx-auto">
      
      {/* ヘッダー部分 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">実績</h1>
        <p className="text-gray-600 mt-2">
          あなたの達成した目標とその記録を振り返ります。
        </p>
      </div>

      {/* 実績カードを表示するグリッド */}
      <div className="grid gap-6 md:grid-cols-3 mb-12">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;  // アイコンコンポーネントを取得
          return (
            // 各実績をカードとして表示
            <div
              key={achievement.id}  // 一意のキーを指定
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Icon className="w-6 h-6 text-amber-600" />  {/* 実績アイコン */}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {achievement.title}  {/* 実績のタイトル */}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {achievement.description}  {/* 実績の説明 */}
                  </p>
                </div>
              </div>

              {/* プログレスバー */}
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-amber-100">
                  <div
                    style={{ width: `${achievement.progress}%` }}  // 進捗率に応じた幅を設定
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 transition-all duration-500"
                  ></div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold inline-block text-amber-600">
                    {achievement.progress}%  {/* 進捗率を表示 */}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 完了したタスクのリスト */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">達成したタスク</h2>
        </div>
        <div className="space-y-4">
          {completedTodos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-medium text-gray-800">{todo.title}</h3>
                <p className="text-sm text-gray-600">{todo.description}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-600">
                  達成日: {format(todo.deadline, 'yyyy/MM/dd')}
                </span>
              </div>
            </div>
          ))}
          {completedTodos.length === 0 && (
            <p className="text-center text-gray-600 py-8">
              まだ達成したタスクはありません。
              <br />
              最初の目標を達成しましょう！
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default achievements;
