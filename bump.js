#! /usr/local/bin/node

'use strict';

const fs = require('fs');
const prompt = require('prompt');

const packageJSON = require('./package.json');
const manifestJSON = require('./chrome/manifest.json');

const schema = {
  properties: {
    bumpType: {
      pattern: /^major|minor|patch$/,
      message: 'Version bump can be only a major, minor or patch',
      required: true
    }
  }
};

prompt.start();

prompt.get(schema, (err, result) => {
  if (err) { throw err; }
  console.log(`Updating ${result.bumpType} version...`);
  let version = packageJSON.version.split('.').map((val) => parseInt(val, 10));
  if (result.bumpType === 'major') {
    version[0]++;
    version[1] = version[2] = 0;
  } else if (result.bumpType === 'minor') {
    version[1]++;
    version[2] = 0;
  } else {
    version[2]++;
  }
  version = version.join('.');
  packageJSON.version = version;
  manifestJSON.version = version;

  Promise.all([
    new Promise((resolve, reject) => {
      fs.writeFile('./package.json', JSON.stringify(packageJSON, null, '  '), (err) => {
        if (err) { return reject(err); }
        resolve();
      });
    }),
    new Promise((resolve, reject) => {
      fs.writeFile('./chrome/manifest.json', JSON.stringify(manifestJSON, null, '  '), (err) => {
        if (err) { return reject(err); }
        resolve();
      });
    })
  ]).then(() => {
    console.log(`${result.bumpType} version bumped to ${version}.`);
  }).catch((err) => {
    throw err;
  })

});
