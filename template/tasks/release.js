'use strict'

const dependencyLookup = require('./dependency-lookup')
const exec = require('child_process').exec
const packager = require('electron-packager')
const path = require('path')

if (process.env.PLATFORM_TARGET === 'clean') {
  require('del').sync(['builds/*', '!.gitkeep'])
  console.log('\x1b[33m`builds` directory cleaned.\n\x1b[0m')
} else pack()

/**
 * Build webpack in production
 */
function pack () {
  console.log('\x1b[33mBuilding webpack in production mode...\n\x1b[0m')
  let pack = exec('npm run pack')

  pack.stdout.on('data', data => console.log(data))
  pack.stderr.on('data', data => console.error(data))
  pack.on('exit', code => depLookup())
}

/**
 * Determine Main process modules to include in final build
 */
function depLookup () {
  console.log('\x1b[33mDetermining main process modules...\n\x1b[0m')

  dependencyLookup()
    .then(results => {
      console.log('  \x1b[33mIncluding modules...\x1b[0m')
      console.log(`  ${results.toString()}\n`)
      build(results.join('|'))
    })
}

/**
 * Recursively remove all empty directories
 */
function removeEmptyDirectories (buildPath, e, p, a, cb) {
  require('delete-empty').sync(path.join(buildPath, '/node_modules'), { force: true })
  cb()
}

/**
 * Use electron-packager to build electron app
 */
function build (mainModules) {
  let options = require('../config').building

  options.ignore = options.ignore.toString().replace('node_modules', `node_modules\\/(?!${mainModules}).*`)
  options.afterCopy = [ removeEmptyDirectories ]

  console.log('\x1b[34mBuilding electron app(s)...\n\x1b[0m')
  packager(options, (err, appPaths) => {
    if (err) {
      console.error('\x1b[31mError from `electron-packager` when building app...\x1b[0m')
      console.error(err)
    } else {
      console.log('Build(s) successful!')
      console.log(appPaths)

      console.log('\n\x1b[34mDONE\n\x1b[0m')
    }
  })
}
