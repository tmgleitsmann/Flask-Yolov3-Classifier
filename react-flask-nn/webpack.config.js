const path = require('path');


module.exports = (env) => {

  const isProduction = env === "production";

  return {
    entry: './src/index.js',
    output: {
      path: path.join(__dirname, 'public', 'dist'),
      filename: 'bundle.js'
    },
    module: {
      rules: [{
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      }, {
          test:/\.scss$/,
          use:[
              'style-loader',
              'css-loader',
              'sass-loader'
          ]
      },{
          test:/\.css$/,
          use:[
              'style-loader',
              'css-loader'
          ]
      }]
    },
    devtool: isProduction ? "source-map" : "cheap-module-eval-source-map",
    devServer: {
      contentBase: path.join(__dirname, 'public'),
      historyApiFallback: true, 
      publicPath:'/dist/'
    }
  };
}