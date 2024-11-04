import { create } from 'zustand'; // Zustandで状態管理のカスタムフックを作成するための関数
import { persist } from 'zustand/middleware'; // Zustandのミドルウェアで状態を永続化
import { addDays, isPast, isWithinInterval, subDays, startOfWeek, endOfWeek, isMonday } from 'date-fns'; // 日付操作に使う関数群

// ToDo項目の構造を定義するインターフェース
export interface Todo {
  id: string; // タスクの一意な識別子
  title: string; // タスクのタイトル
  description: string; // タスクの説明
  deadline: Date; // タスクの期限
  completed: boolean; // タスクが完了したかどうか
  deadlineChanged: boolean; // タスクの期限が変更されたかどうか
  createdAt: Date; // タスクの作成日
  completedAt?: Date; // タスクの完了日（未完了の場合は未定義）
  userId: string; // タスクに関連するユーザーID
}

// ToDoリストの管理機能を定義するインターフェース
interface TodoStore {
  todos: Todo[]; // タスク一覧
  lastWeeklyCheck?: Date; // 直近の週次チェック日
  addTodo: (todo: Omit<Todo, 'id' | 'completed' | 'deadlineChanged' | 'createdAt' | 'userId'>, userId?: string) => void;
  // 新しいタスクを追加する関数
  toggleTodo: (id: string) => void; // タスクの完了・未完了状態を切り替える関数
  updateDeadline: (id: string, newDeadline: Date) => void; // タスクの期限を更新する関数
  updateTodo: (id: string, updates: Partial<Todo>) => void; // タスク情報を更新する関数
  getUpcomingTodos: () => Todo[]; // 期限が近いタスクを取得する関数
  getCompletedTodos: () => Todo[]; // 完了したタスクを取得する関数
  getWeeklyStats: () => {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }; // 週次統計を取得する関数
  deleteTodosByUser: (userId: string) => void; // 指定したユーザーのタスクを削除する関数
}

// ToDoリスト管理機能を作成し、zustandを用いてエクスポート
export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      todos: [], // 初期のタスクリストは空

      // 新しいタスクを追加
      addTodo: (todo, userId = '') =>
        set((state) => ({
          todos: [
            ...state.todos,
            {
              ...todo,
              id: crypto.randomUUID(), // ランダムなIDを生成
              completed: false, // 初期状態は未完了
              deadlineChanged: false, // 初期では期限が変更されていない
              createdAt: new Date(), // 作成日を現在に設定
              userId, // 関連するユーザーID
            },
          ],
        })),

      // タスクの完了状態を切り替える
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  completed: !todo.completed, // 完了状態を反転
                  completedAt: !todo.completed ? new Date() : undefined, // 完了した場合は完了日を設定
                }
              : todo
          ),
        })),

      // タスクの期限を更新
      updateDeadline: (id, newDeadline) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id && !todo.deadlineChanged
              ? { ...todo, deadline: newDeadline, deadlineChanged: true } // 期限変更を記録
              : todo
          ),
        })),

      // タスク情報を更新
      updateTodo: (id, updates) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, ...updates } : todo
          ),
        })),

      // 期限が近いタスクを取得（現在から3日以内が対象）
      getUpcomingTodos: () => {
        const todos = get().todos;
        return todos.filter(
          (todo) =>
            !todo.completed &&
            isWithinInterval(todo.deadline, {
              start: new Date(),
              end: addDays(new Date(), 3),
            })
        );
      },

      // 完了済みのタスクを取得
      getCompletedTodos: () => {
        const todos = get().todos;
        return todos.filter((todo) => todo.completed);
      },

      // 週次の統計を取得
      getWeeklyStats: () => {
        const todos = get().todos;
        const lastWeek = {
          start: startOfWeek(subDays(new Date(), 7)), // 前週の開始日
          end: endOfWeek(subDays(new Date(), 7)), // 前週の終了日
        };

        // 前週に作成または完了されたタスクを取得
        const lastWeekTodos = todos.filter(
          (todo) =>
            isWithinInterval(todo.createdAt, lastWeek) ||
            (todo.completedAt && isWithinInterval(todo.completedAt, lastWeek))
        );

        const completedTasks = lastWeekTodos.filter((todo) => todo.completed).length;
        const totalTasks = lastWeekTodos.length;

        return {
          totalTasks,
          completedTasks,
          completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0, // 達成率を計算
        };
      },

      // 指定ユーザーのタスクを削除
      deleteTodosByUser: (userId) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.userId !== userId),
        })),
    }),
    {
      name: 'todo-storage', // ローカルストレージに保存する際のキー
    }
  )
);