import { defineConfig } from 'vite'; // Viteの設定を定義するための関数をインポート
import react from '@vitejs/plugin-react'; // Vite用のReactプラグインをインポート

// Viteの設定をエクスポート
// https://vitejs.dev/config/ に設定の詳細が記載されています
export default defineConfig({
  plugins: [react()], // プラグインとしてReactプラグインを使用（React構文のサポートを有効にする）
  base:'/ToDo/'
});
