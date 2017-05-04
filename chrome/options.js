'use strict'

function on (event, cb) {
  document.addEventListener(event, cb)
}

function getAll (selector, scope) {
  scope = scope || document
  return scope.querySelectorAll(selector)
}

function get (selector, scope) {
  return getAll(selector, scope)[0]
}

function saveOptions () {
  const username = get('#username').value
  const accessToken = get('#access_token').value

  chrome.storage.sync.set({ username, accessToken }, () => {
  })
}

function restoreOptions () {
  chrome.storage.sync.get({
    username: '',
    accessToken: ''
  }, (items) => {
    get('#username').value = items.username
    get('#access_token').value = items.accessToken
  })
}

on('change', saveOptions)
on('keyup', saveOptions)
on('DOMContentLoaded', restoreOptions)
