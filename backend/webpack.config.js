const path = require('path');

module.exports = [
  {
    mode: 'development',
    target: 'node', 

    entry: './index.js', 

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'backend.bundle.js',
    },

    resolve: {
      extensions: ['.ts', '.js'],
    },

    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },

    node: {
      __dirname: false,
    },

    watch: true,

    optimization: {
      emitOnErrors: true,
      minimize: true,   //minimizing the output bundle
    },
  },
];
