'use strict';

function on(event, cb) {
  document.addEventListener(event, cb);
}

function getAll(selector, scope) {
  scope = scope || document;
  return scope.querySelectorAll(selector);
}

function get(selector, scope) {
  return getAll(selector, scope)[0];
}

function saveOptions() {
  const username = get('#username').value;
  const accessToken = get('#access_token').value;
  const authToken = btoa(`${username}:${accessToken}`);
  chrome.storage.sync.set({ authToken }, () => {});
}

function restoreOptions() {
  chrome.storage.sync.get({
    authToken: ''
  }, (items) => {
    if (items.authToken) {
      get('#info-message').innerHTML = 'An auth token already exists.';
    }
  });
}

on('change', saveOptions);
on('keyup', saveOptions);
on('DOMContentLoaded', restoreOptions);
