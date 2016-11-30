'use strict'

const path = require('path')
const merge = require('webpack-merge')
const webpack = require('webpack')

const baseConfig = require('../../webpack.config')
const projectRoot = path.resolve(__dirname, '../../app')

let webpackConfig = merge(baseConfig, {
  devtool: '#inline-source-map',
{{#if_eq vueVersion '1.x'}}
  vue: {
    loaders: {
      js: 'isparta'
    }
  },
{{/if_eq}}
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"testing"'
    })
  ]
})

// no need for app entry during tests
delete webpackConfig.entry

// make sure isparta loader is applied before eslint
{{#if_eq vueVersion '2.x'}}
webpackConfig.module.rules.unshift({
  test: /\.js$/,
  loader: 'isparta-loader',
  enforce: 'pre',
  include: path.resolve(projectRoot, 'src')
})
{{else}}
webpackConfig.module.preLoaders = webpackConfig.module.preLoaders || []
webpackConfig.module.preLoaders.unshift({
  test: /\.js$/,
  loader: 'isparta',
  include: path.resolve(projectRoot, 'src')
})
{{/if_eq}}

// only apply babel for test files when using isparta
webpackConfig.module.{{#if_eq vueVersion '2.x'}}rules{{else}}loaders{{/if_eq}}.some(loader => {
  if (loader.loader === 'babel-loader') {
    loader.include = path.resolve(projectRoot, '../test/unit')
    return true
  }
})
{{#if_eq vueVersion '2.x'}}

// apply vue option to apply isparta-loader on js
webpackConfig.module.rules
  .find(({ loader }) => loader === 'vue-loader').options.loaders.js = 'isparta-loader'
{{/if_eq}}

module.exports = config => {
  config.set({
    browsers: ['visibleElectron'],
    client: {
      useIframe: false
    },
    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    },
    customLaunchers: {
      'visibleElectron': {
        base: 'Electron',
        flags: ['--show']
      }
    },
    frameworks: ['mocha', 'chai'],
    files: ['./index.js'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },
    reporters: ['spec', 'coverage'],
    singleRun: true,
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    }
  })
}
