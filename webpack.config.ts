import path from 'path'
import * as Webpack from 'webpack'
import 'webpack-dev-server'
import HtmlPlugin from 'html-webpack-plugin'

const config: Webpack.Configuration = {
  mode: 'development',

  devtool: 'inline-source-map',

  entry: path.resolve(__dirname, './src/index.tsx'),

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
    clean: true
  },

  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx']
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource'
      }
    ]
  },

  plugins: [
    new HtmlPlugin({
      template: './public/index.html',
      favicon: './public/favicon.png'
    })
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true
  }
}

export default config