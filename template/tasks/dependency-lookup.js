'use strict'

const dependencyTree = require('dependency-tree')
const isBuiltinModule = require('is-builtin-module')
const path = require('path')

module.exports = function () {
  return new Promise((resolve, reject) => {
    const tree = dependencyTree.toList({
      filename: path.join(__dirname, '../app/electron.js'),
      directory: path.join(__dirname, '../app'),
      filter: module => !isBuiltinModule(module) && !/\b(electron-devtools-installer|electron)\b/.test(module)
    })

    let deps = []

    tree.forEach(path => {
      if (/node_modules/.test(path)) {
        deps.push(path.split('node_modules')[1].split('/')[1])
      }
    })

    resolve(Array.from(new Set([...deps])))
  })
}
