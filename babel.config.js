// babel.config.js
module.exports = {
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }], // For React 17+ JSX transform
    '@babel/preset-typescript',
  ],
};