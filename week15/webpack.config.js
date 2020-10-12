module.exports = {
  mode: 'development',
  entry: {
    'main': './test/index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env'
            ],
            plugins: [
              ['@babel/plugin-transform-react-jsx', { 'pragma': 'createElement' }]
            ]
          }
        }
      }
    ]
  }
}