#! /usr/local/bin/node

'use strict'

const fs = require('fs')
const prompt = require('prompt')

const packageJSON = require('./package.json')
const manifestJSON = require('./chrome/manifest.json')

const schema = {
  properties: {
    bumpType: {
      pattern: /^major|minor|patch$/,
      message: 'Version bump can be only a major, minor or patch',
      required: true
    }
  }
}

function writeJson (filename, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, JSON.stringify(data, null, '  '), (err) => {
      if (err) { return reject(err) }
      resolve()
    })
  })
}

prompt.start()

prompt.get(schema, (err, result) => {
  if (err) { throw err }
  console.log(`Updating ${result.bumpType} version...`)
  let version = packageJSON.version.split('.').map((val) => parseInt(val, 10))
  if (result.bumpType === 'major') {
    version[0]++
    version[1] = version[2] = 0
  } else if (result.bumpType === 'minor') {
    version[1]++
    version[2] = 0
  } else {
    version[2]++
  }

  version = packageJSON.version = manifestJSON.version = version.join('.')

  Promise.all([
    writeJson('./package.json', packageJSON),
    writeJson('./chrome/manifest.json', manifestJSON)
  ])
  .then(() => {
    console.log(`${result.bumpType} version bumped to ${version}.`)
  })
  .catch((err) => {
    throw err
  })
})
