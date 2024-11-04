import React from 'react';
// Lucideアイコンをインポート（本、星、時計、ターゲット、脳、コーヒーのアイコン）
import { BookOpen, Star, Clock, Target, Brain, Coffee } from 'lucide-react';

// 生産性向上のためのヒント（tips）を配列として定義
const tips = [
  {
    id: '1', // ユニークなID
    icon: Target, // アイコン（ターゲット）
    title: '目標設定のコツ', // ヒントのタイトル
    description: 'SMART原則に従って目標を設定しましょう。具体的で、測定可能で、達成可能な目標を立てることが重要です。',
    // SMART原則の説明が記載されている
  },
  {
    id: '2',
    icon: Clock, // アイコン（時計）
    title: 'ポモドーロテクニック',
    description: '25分の集中作業と5分の休憩を繰り返す手法です。集中力を維持しながら効率的に作業を進めることができます。',
  },
  {
    id: '3',
    icon: Brain, // アイコン（脳）
    title: '集中力を高めるテクニック',
    description: '作業環境を整え、スマートフォンは別室に置くなど、集中を妨げる要因を排除しましょう。',
  },
  {
    id: '4',
    icon: Coffee, // アイコン（コーヒー）
    title: '適切な休憩の取り方',
    description: '集中力を維持するために、定期的な休憩は重要です。短い休憩でも、気分転換効果があります。',
  },
];

// Tipsコンポーネントの定義（生産性向上のヒントを表示するUI）
function Tips() {
  return (
    <div className="max-w-4xl mx-auto"> {/* 横幅を制限し、中央寄せする */}
      <div className="mb-8"> {/* タイトルと説明文のコンテナ */}
        <h1 className="text-3xl font-bold text-gray-800">生産性向上のヒント</h1>
        <p className="text-gray-600 mt-2">
          効率的にタスクを達成するためのテクニックやアドバイスをご紹介します。
        </p>
      </div>

      {/* ヒント一覧の表示（2列のグリッドレイアウト） */}
      <div className="grid gap-6 md:grid-cols-2">
        {tips.map((tip) => { // 各ヒントをループで描画
          const Icon = tip.icon; // アイコンコンポーネントを変数に代入
          return (
            <div
              key={tip.id} // ユニークなIDをキーに使用
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4"> {/* アイコンとタイトル */}
                <div className="p-3 bg-indigo-50 rounded-lg"> {/* アイコンの背景 */}
                  <Icon className="w-6 h-6 text-indigo-600" /> {/* アイコンを描画 */}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{tip.title}</h2>
              </div>
              <p className="text-gray-600">{tip.description}</p> {/* 説明文 */}
            </div>
          );
        })}
      </div>

      {/* おすすめテクニックの表示部分 */}
      <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">今日のおすすめテクニック</h2>
        <div className="flex items-start gap-4"> {/* アイコンと内容のコンテナ */}
          <div className="p-3 bg-white bg-opacity-20 rounded-lg"> {/* アイコンの背景 */}
            <Star className="w-6 h-6" /> {/* 星のアイコン */}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">2分ルール</h3> {/* タイトル */}
            <p>
              2分以内でできるタスクは、見つけたらすぐに実行しましょう。
              先送りにせず、小さなタスクを即座に処理することで、
              タスクの積み重なりを防ぎ、生産性を向上させることができます。
            </p> {/* 説明文 */}
          </div>
        </div>
      </div>
    </div>
  );
}

// このコンポーネントを他のファイルで使用できるようエクスポート
export default Tips;