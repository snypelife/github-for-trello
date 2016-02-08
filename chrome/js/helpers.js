'use strict';

const icons = {
  merge: (() => {
    function icon(state) {
      return `
      <svg class="tsi-merge-icon tsi-merge-icon-${state}" aria-hidden="true" height="45" role="img" version="1.1" viewBox="0 0 12 16" width="30">
        <path d="M11 11.28c0-1.73 0-6.28 0-6.28-0.03-0.78-0.34-1.47-0.94-2.06s-1.28-0.91-2.06-0.94c0 0-1.02 0-1 0V0L4 3l3 3V4h1c0.27 0.02 0.48 0.11 0.69 0.31s0.3 0.42 0.31 0.69v6.28c-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72z m-1 2.92c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2zM4 3c0-1.11-0.89-2-2-2S0 1.89 0 3c0 0.73 0.41 1.38 1 1.72 0 1.55 0 5.56 0 6.56-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72V4.72c0.59-0.34 1-0.98 1-1.72z m-0.8 10c0 0.66-0.55 1.2-1.2 1.2s-1.2-0.55-1.2-1.2 0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2z m-1.2-8.8c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2z"></path>
        </svg>
      `;
    }

    return {
      clean: icon('clean'),
      conflict: icon('conflict'),
      merged: icon('merged'),
      unknown: icon('unknown')
    }
  })()
};

function getAll(selector, scope) {
  scope = scope || document;
  return scope.querySelectorAll(selector);
}

function get(selector, scope) {
  return getAll(selector, scope)[0];
}

function getCreds() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({ username: '', accessToken: '' }, (items) => {
      if (!items || !items.username || !items.accessToken) {
        return reject('missing auth creds');
      }

      resolve(items);
    });
  });
}

function observe(element, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = { attributes: true, attributeOldValue: true };
  }

  new MutationObserver(cb).observe(element, options);
}

function is(element, state) {
  switch(state) {
    case 'hidden':
    case 'hidden?':
      return element.offsetWidth === element.offsetHeight == 0;
    case 'visible':
    case 'visible?':
      return element.offsetWidth > 0 < element.offsetHeight;
  }
}


function genGuid() {
  // returns 00000000-0000-0000-0000-000000000000
  const guid = [];
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint32Array(32);
  window.crypto.getRandomValues(array);

  array.forEach((val, i) => {
    let char = charset[val % charset.length];
    if (i === 7 || i === 11 || i === 15) {
      char += '-';
    }
    guid.push(char);
  });

  return guid.join('');
};

const eventListeners = {};
function on(element, event, scope, cb) {
  const guid = genGuid();
  const callbackProxy = (evt) => {
    if (typeof scope === 'function') {
      cb = scope;
      return cb(evt);
    }
    if (get(scope, evt.target.parentNode)) {
      cb(evt);
    }
  };
  element.setAttribute('data-guid', guid);
  element.addEventListener(event, callbackProxy, false);
  eventListeners[guid] = callbackProxy;
}

function off(element, event) {
  const callbackProxy = eventListeners[element.getAttibute('guid')];
  element.removeEventListener(event, callbackProxy, false);
  delete eventListeners[element.getAttribute('guid')];
  element.removeAttribute('data-guid');
}

function ajaxPrefilter(options) {
  if (!options.headers) {
    options.headers = {};
  }

  // Auto-authorize AJAX calls to Github API
  if (options.url.includes('https://api.github.com')) {
    let token = btoa(`${username}:${accessToken}`);
    options.headers['Authorization'] = `Basic ${token}`;
  }
}

function toArray(arrayLikeObject) {
  return [].slice.call(arrayLikeObject);
}
