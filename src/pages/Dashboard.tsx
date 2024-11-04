import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInDays, startOfWeek, endOfWeek, isMonday } from 'date-fns';
import { Plus, Calendar, CheckCircle2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTodoStore } from '../stores/todoStore';
import { useEffect } from 'react';
import type { Todo } from '../stores/todoStore';

const todoSchema = z.object({
  title: z.string().min(1, '必須項目です'),
  description: z.string(),
  deadline: z.string().min(1, '期限を設定してください'),
});

type TodoForm = z.infer<typeof todoSchema>;

interface EditModalProps {
  todo: Todo;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
}

const EditModal = ({ todo, onClose, onUpdate }: EditModalProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TodoForm>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: todo.title,
      description: todo.description,
      deadline: format(todo.deadline, 'yyyy-MM-dd'),
    },
  });

  const onSubmit = (data: TodoForm) => {
    onUpdate(todo.id, {
      title: data.title,
      description: data.description,
      deadline: new Date(data.deadline),
    });
    toast.success('タスクを更新しました！');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">タスクを編集</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル
            </label>
            <input
              {...register('title')}
              className="w-full border rounded-lg px-3 py-2"
              maxLength={10}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              期限
            </label>
            <input
              type="date"
              {...register('deadline')}
              className="w-full border rounded-lg px-3 py-2"
            />
            {errors.deadline && (
              <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const { todos, addTodo, toggleTodo, updateDeadline, updateTodo, getWeeklyStats } = useTodoStore();
  const upcomingTodos = useTodoStore((state) => state.getUpcomingTodos());

  useEffect(() => {
    if (isMonday(new Date())) {
      const stats = getWeeklyStats();
      if (stats.totalTasks > 0) {
        toast(
          <div>
            <h3 className="font-bold mb-2">先週の実績 🎯</h3>
            <p>完了タスク: {stats.completedTasks}/{stats.totalTasks}</p>
            <p>達成率: {Math.round(stats.completionRate * 100)}%</p>
          </div>,
          {
            duration: 5000,
            icon: '📊',
          }
        );
      }
    }
  }, []);

  // タスクを未完了と完了で分類し、それぞれを日付順にソート
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoForm>({
    resolver: zodResolver(todoSchema),
  });

  const onSubmit = (data: TodoForm) => {
    addTodo({
      title: data.title,
      description: data.description,
      deadline: new Date(data.deadline),
    });
    toast.success('タスクを追加しました！');
    setIsModalOpen(false);
    reset();
  };

  const getRemainingDays = (deadline: Date) => {
    const today = new Date();
    const days = differenceInDays(deadline, today);
    if (days >= 0 && days <= 3) {
      return `あと${days}日`;
    }
    return null;
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">タスク管理</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新規タスク
        </button>
      </div>

      {upcomingTodos.length > 0 && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h2 className="text-lg font-semibold text-amber-800 mb-3">
            期限が近いタスク
          </h2>
          <ul className="space-y-2">
            {upcomingTodos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
              >
                <span className="text-amber-900">{todo.title}</span>
                <span className="text-amber-600 text-sm">
                  期限: {format(todo.deadline, 'yyyy/MM/dd')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4">
        {sortedTodos.map((todo) => (
          <div
            key={todo.id}
            className={`p-4 bg-white rounded-lg shadow-sm border-l-4 ${
              todo.completed
                ? 'border-green-500 bg-green-50'
                : 'border-indigo-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    toggleTodo(todo.id);
                    if (!todo.completed) {
                      toast.success('おめでとうございます！タスクを達成しました！🎉');
                    }
                  }}
                  className={`p-1 rounded-full ${
                    todo.completed
                      ? 'text-green-500 bg-green-100'
                      : 'text-gray-400 hover:text-indigo-500'
                  }`}
                >
                  <CheckCircle2 className="w-6 h-6" />
                </button>
                <div>
                  <h3
                    className={`font-medium ${
                      todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
                    }`}
                  >
                    {todo.title}
                  </h3>
                  {todo.description && (
                    <p className="text-sm text-gray-600">{todo.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {!todo.completed && (
                  <button
                    onClick={() => handleEditTodo(todo)}
                    className="text-gray-400 hover:text-indigo-500 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
                {!todo.deadlineChanged && !todo.completed && (
                  <input
                    type="date"
                    onChange={(e) => updateDeadline(todo.id, new Date(e.target.value))}
                    className="text-sm text-gray-600 border rounded-md px-2 py-1"
                  />
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {format(todo.deadline, 'yyyy/MM/dd')}
                  </span>
                  {!todo.completed && getRemainingDays(todo.deadline) && (
                    <span className="text-sm font-medium text-amber-600">
                      ({getRemainingDays(todo.deadline)})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">新規タスク</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                </label>
                <input
                  {...register('title')}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="タスクのタイトル"
                  maxLength={10}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  {...register('description')}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="タスクの説明"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  期限
                </label>
                <input
                  type="date"
                  {...register('deadline')}
                  className="w-full border rounded-lg px-3 py-2"
                />
                {errors.deadline && (
                  <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>
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
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTodo && (
        <EditModal
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onUpdate={updateTodo}
        />
      )}
    </div>
  );
}

export default Dashboard;