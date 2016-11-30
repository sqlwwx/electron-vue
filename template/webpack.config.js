'use strict'

const path = require('path')
const pkg = require('./app/package.json')
const settings = require('./config.js')
const webpack = require('webpack')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

let config = {
  devtool: '#eval-source-map',
  {{#if eslint}}{{#if_eq vueVersion '1.x'}}
  eslint: {
    formatter: require('eslint-friendly-formatter')
  },
  {{/if_eq}}{{/if}}
  entry: {
    build: path.join(__dirname, 'app/src/main.js')
  },
  module: {
{{#if eslint}}{{#if_eq vueVersion '1.x'}}
    preLoaders: [],
{{/if_eq}}{{/if}}
    {{#if_eq vueVersion '1.x'}}loaders{{else}}rules{{/if_eq}}: [
      {
        test: /\.css$/,
{{#if_eq vueVersion '1.x'}}
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
{{else}}
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: 'css-loader'
        })
{{/if_eq}}
      },
      {
        test: /\.html$/,
        loader: 'vue-html-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'{{#if_eq vueVersion '2.x'}},
        options: {
          loaders: {
            sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
            scss: 'vue-style-loader!css-loader!sass-loader'
          }
        }{{/if_eq}}
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'imgs/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './app/index.ejs',
      title: settings.name
    }),
    new webpack.NoErrorsPlugin()
  ],
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'app/dist')
  },
  resolve: {
    alias: {
      'components': path.join(__dirname, 'app/src/components'),
      'src': path.join(__dirname, 'app/src')
    },
    extensions: ['.js', '.vue', '.json', '.css'],
{{#if_eq vueVersion '1.x'}}
    fallback: [path.join(__dirname, 'app/node_modules')]
{{else}}
    modules: [
      path.join(__dirname, 'app/node_modules'),
      path.join(__dirname, 'node_modules')
    ]
{{/if_eq}}
  },
{{#if_eq vueVersion '1.x'}}
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
{{/if_eq}}
  target: 'electron-renderer',
{{#if_eq vueVersion '1.x'}}
  vue: {
    {{#if_eq vueVersion '1.x'}}
    autoprefixer: {
      browsers: ['last 2 Chrome versions']
    },
    {{/if_eq}}
    loaders: {
      sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
      scss: 'vue-style-loader!css-loader!sass-loader'
    }
  }
{{/if_eq}}
}

{{#if eslint}}
if (process.env.NODE_ENV !== 'production') {
  /**
   * Apply ESLint
   */
  if (settings.eslint) {
{{#if_eq vueVersion '1.x'}}
    config.module.preLoaders.push(
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    )
{{else}}
    config.module.rules.push(
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        exclude: /node_modules/,
        options: { formatter: require('eslint-friendly-formatter') }
      }
    )
{{/if_eq}}
  }
}

{{/if}}
/**
 * Adjust config for production settings
 */
if (process.env.NODE_ENV === 'production') {
  config.devtool = ''

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
{{#if_eq vueVersion '1.x'}}
    new webpack.optimize.OccurenceOrderPlugin(),
{{else}}
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
{{/if_eq}}
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  )
}

module.exports = config
