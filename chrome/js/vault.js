'use strict';

export function getCredentials() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({ username: '', accessToken: '' }, (creds) => {
      if (!creds || !creds.username || !creds.accessToken) {
        return reject('missing auth creds');
      }

      resolve(creds);
    });
  });
}
