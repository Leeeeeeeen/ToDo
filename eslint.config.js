// ESLintの基本JavaScript設定、グローバル変数設定、Reactのフックおよびリフレッシュプラグイン、TypeScript用ESLintのインポート
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

// TypeScript ESLint設定のエクスポート（tseslint.configを使用して構成）
export default tseslint.config(
  { ignores: ['dist'] }, // distディレクトリをESLintのチェック対象から除外
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended], // JavaScriptとTypeScriptの推奨設定を適用
    files: ['**/*.{ts,tsx}'], // チェック対象をTypeScriptファイル（.ts, .tsx）に限定
    languageOptions: {
      ecmaVersion: 2020, // ECMAScript 2020の構文を使用可能に設定
      globals: globals.browser, // ブラウザ環境のグローバル変数を有効化
    },
    plugins: {
      'react-hooks': reactHooks, // Reactのフック（useEffectやuseStateなど）用のプラグイン
      'react-refresh': reactRefresh, // Reactの高速リフレッシュ（HMR）用のプラグイン
    },
    rules: {
      ...reactHooks.configs.recommended.rules, // Reactフックに関する推奨ルールを適用
      'react-refresh/only-export-components': [
        'warn', // コンポーネントのみをエクスポートするように警告（React Fast Refreshの制約）
        { allowConstantExport: true }, // 定数として定義したエクスポートは許可
      ],
    },
  }
);