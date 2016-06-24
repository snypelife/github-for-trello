'use strict';

export function getCredentials() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({ authToken: '' }, (creds) => {
      if (!creds || !creds.authToken) {
        return reject('missing auth creds');
      }

      resolve(creds);
    });
  });
}
