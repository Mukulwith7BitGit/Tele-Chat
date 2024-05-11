const path = require('path');

module.exports = [
  {
    mode: 'development',
    target: 'web', 

    entry: './src/index.html',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'frontend.bundle.js',
    },

    resolve: {
      extensions: ['.ts', '.js'],
    },

    module: {
      rules: [
    // TypeScript files
    {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // HTML files
      {
        test: /\.html$/,
        use: 'html-loader',
      },
      // CSS files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // JavaScript files
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },  
      ],
    },

    watch: true,

    optimization: {
      emitOnErrors: true,
      minimize: true,   //minimizing the output bundle
    },
  }
];
