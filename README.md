「Hydrangea Breath」は、わずか2分間で重い思考を手放し、閉じ込めた感情を解放するために作られた、ミニマルで美しいインタラクティブなメンタルウェルネスWebアプリです。
​🌸 使い方・体験の流れ:
​キャンバスのカスタマイズ: アプリを開くと、現在の心の状態を反映するように、グレーの紫陽花の数を自由に増やしたり減らしたりできます。
​水面の自分と向き合う: そのビジュアルはあなた自身。水面に反射し、内に閉じ込め、本当の感情や不安を抑え込んでいる姿を映し出します。
​インタラクティブな解放: 画面を進めて思考を整理していくと、影のようだったグレーの花びらが自然に数を増し、殻を破るように、淡い藤色、薄ピンク、白の瑞々しく鮮やかな輝きへと変化していきます。
​✨ 開発の想い:
​ノイズの多い世界の中で、私たちはしばしば本当の感情を閉じ込め、思考を複雑にしすぎてしまいます。このプロダクトは、人々が思考と行動を整理し、もっと心を軽くして生きられるようにという願いから生まれました。
​視覚的な癒やしと、深い感情の解放を、今すぐ体験してみてください。# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

 React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
