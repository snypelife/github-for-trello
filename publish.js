#!/usr/bin/env node

// Utility script to publish a Google Chrome extension to the Chrome Web Store
// following a successful Travis CI build.
//
// Usage:
//   export CLIENT_ID=<ID>
//   export CLIENT_SECRET=<secret>
//   export REFRESH_TOKEN=<token>
//   export APP_ID=<ID>
//
//   publish-chrome-extension.js <path/to/package.zip>
//
// This uses the APIs described at https://developer.chrome.com/webstore/using_webstore_api
// to upload a new .zip archive containing the extension's files to the Chrome Web Store
// and then publish the new version.
//
// This script is intended for use from within a Travis CI config and by default
// exits if not building a non-pull request on the master branch.
//
// Access to the web store APIs requires an access token as described at
// https://developer.chrome.com/webstore/using_webstore_api . To obtain an access
// token this script needs:
//
//  - A client ID and secret, exposed via CLIENT_ID and CLIENT_SECRET
//  - A client refresh token, exposed via REFRESH_TOKEN
//
// Additionally the script needs the app ID of the Chrome extension, which it gets
// from the APP_ID env var

const log = require('console')
const fs = require('fs')
const join = require('path').join
const request = require('request')
const conf = require('rc')('publish', {})
const util = require('util')

function expand (obj) {
  return util.inspect(obj, false, 10)
}

function requireEnvVar (name) {
  const val = conf[name]
  if (typeof val !== 'string') {
    throw new Error(`Required config variable ${name} is not set`)
  }
  return val
}

function getAccessToken (clientId, clientSecret, refreshToken) {
  return new Promise((resolve, reject) => {
    const params = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }
    log.info('Refreshing Chrome Web Store access token...')
    request.post('https://accounts.google.com/o/oauth2/token', {
      form: params,
      json: true
    },
    (err, response, body) => {
      if (err || response.statusCode !== 200) {
        return reject(new Error(`Fetching Chrome Web Store access token failed: ${response.statusCode} ${expand(body)}`))
      }
      resolve(body.access_token)
    })
  })
}

function uploadPackage (accessToken) {
  const appId = requireEnvVar('APP_ID')
  const packageUploadEndpoint = 'https://www.googleapis.com/upload/chromewebstore/v1.1/items/' + appId

  return new Promise((resolve, reject) => {
    log.info('Uploading updated package...')
    fs.createReadStream(join(__dirname, 'github-trello.zip')).pipe(
      request.put(packageUploadEndpoint,
        { auth: { bearer: accessToken } },
        (err, response, body) => {
          if (err || response.statusCode !== 200) {
            return reject(
            new Error(`Package upload failed: ${response.statusCode} ${body}`)
          )
          }

          resolve(accessToken)
        })
    )
  })
}

function publishPackage (accessToken) {
  const appId = requireEnvVar('APP_ID')
  const packagePublishEndpoint = 'https://www.googleapis.com/chromewebstore/v1.1/items/' + appId + '/publish'

  return new Promise((resolve, reject) => {
    log.info('Publishing updated package...')
    request.post(packagePublishEndpoint,
      { auth: { bearer: accessToken } },
      function (err, response, body) {
        if (err || response.statusCode !== 200) {
          return reject(
          new Error(`Publishing updated package failed: ${response.statusCode} ${body}`)
        )
        }
        resolve()
      })
  })
}

function main () {
  // const travisBranch = requireEnvVar('TRAVIS_BRANCH');
  // const travisPullRequest = requireEnvVar('TRAVIS_PULL_REQUEST');

  // const appId = requireEnvVar('APP_ID');
  // const packageUploadEndpoint = 'https://www.googleapis.com/upload/chromewebstore/v1.1/items/' + appId;
  // const packagePublishEndpoint = 'https://www.googleapis.com/chromewebstore/v1.1/items/' + appId + '/publish';
  // const packagePath = args[0];
  // if (!packagePath) {
  //   throw new Error('Package path not specified');
  // }

  const clientId = requireEnvVar('CLIENT_ID')
  const clientSecret = requireEnvVar('CLIENT_SECRET')
  // const authCode = requireEnvVar('AUTH_CODE');
  const refreshToken = requireEnvVar('REFRESH_TOKEN')

  // if (travisBranch !== 'master' || travisPullRequest !== 'false') {
  // log.info('Skipping publication from pull request or non-master branch');
  //   return;
  // }

  // const accessTokenParams = {
  //   client_id: clientId,
  //   client_secret: clientSecret,
  //   grant_type: 'refresh_token',
  //   refresh_token: refreshToken
  // };
         // {form : accessTokenParams}

  getAccessToken(clientId, clientSecret, refreshToken)
  .then(uploadPackage)
  .then(publishPackage)
  .then(() => {
    log.info('Updated package has been queued for publishing')
  })
  .catch(onErr)
}

function onErr (err) {
  log.info('Publishing to Chrome Web Store failed:', err.message)
  process.exit(1)
}

process.on('uncaughtException', onErr)

try {
  main()
} catch (err) {
  onErr(err)
}
