const rules = require('./webpack.rules')

rules.push(
  {
    test: /\.css$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
      },
    ],
  },
  {
    test: /\.js$/,
    include: /src/,
    use: {
      loader: 'babel-loader',
    },
  }
)

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
}
