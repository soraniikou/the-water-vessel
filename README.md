「Hydrangea Breath」は、わずか2分間で重い思考を手放し、閉じ込めた感情を解放するために作られた、ミニマルで美しいインタラクティブなWebアプリです。
体験→
https://the-water-vessel.vercel.app

<!-- びっくりマーク！画像1 -->
<img src="azisai2.png" width="100%" alt="azisai2">

<!-- びっくりマーク！画像2 -->
<img src="azisai3.png" width="100%" alt="azisai3">

<!-- びっくりマーク！画像3 -->
<img src="azisai4.png" width="100%" alt="azisai4">

<!-- びっくりマーク！画像4 -->
<img src="azisai5.png" width="100%" alt="azisai5">

​🌸 使い方・体験の流れ:
​キャンバスのカスタマイズ: アプリを開くと、現在の心の状態を反映するように、画面の好きな所をタップして、紫陽花の数を自由に増やしたり減らしたりできます。
​水面の自分と向き合う: そのビジュアルはあなた自身。水面に反射し、内に閉じ込め、本当の感情や不安を抑え込んでいる姿を映し出します。
​インタラクティブな解放: 舞い落ちる花びらは、あなたの自由さ。愛されていい　と感じていただきたくて作りました。
​
✨ 開発の想い:
​ノイズの多い世界の中で、私たちはしばしば本当の感情を閉じ込め、思考を複雑にしすぎてしまいます。このプロダクトは、人々が思考と行動を整理し、心を軽くして生きられるようにという願いから生まれました。
​視覚的な癒やしと、感情の解放を、体験してみてください。# React + TypeScript + Vite

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
