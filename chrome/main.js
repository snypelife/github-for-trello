'use strict';

class Enum {
  constructor(obj) {
    const keysByValue = new Map();
    const EnumLookup = (value) => keysByValue.get(value);

    for (const key of Object.keys(obj)){
      EnumLookup[key] = obj[key];
      keysByValue.set(EnumLookup[key], key);
    }

    // Return a function with all your enum properties attached.
    // Calling the function with the value will return the key.
    return Object.freeze(EnumLookup);
  }
}

const DOMClassName = new Enum({
  pluginMainOutlet: '.js-plugin-sections',
  pluginButtonOutlet: '.js-plugin-buttons',
  cardClassName: '.list-card',
  githubLinkClassName: '.known-service-link',
  cardWindow: '.window',
  cardDescription: '.js-desc-content'
});

class SelectorEngine {
  constructor() {}

  getAll(selector, scope) {
    scope = scope || document;

    if (typeof scope === 'string') {
      scope = document.querySelector(scope);
    }

    return scope.querySelectorAll(selector);
  }

  get(selector, scope) {
    return this.getAll(selector, scope)[0];
  }
}

class Ajax {
  constructor() {
    this.prefilters = [];
  }

  addPrefilter(cb) {
    this.prefilters.push(cb);
  }

  get(url, params) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let queryParams = '';
      params = params || {};

      Object.keys(params).forEach((key, i) => {
        if (i === 0) { queryParams += '?'; }
        else { queryParams += '&'; }
        queryParams += encodeURI(`${key}=${params[key]}`);
      });

      xhr.url = encodeURI(url + queryParams);
      xhr.open('GET', xhr.url);
      xhr.onload = () => {
        if (xhr.status !== 200) {
          return reject(xhr.status);
        }
        resolve(xhr.responseText);
      };

      this.prefilters.forEach((prefilter) => {
        prefilter(xhr);
      });

      xhr.send();
    });
  }

  getJSON(url, params) {
    return new Promise((resolve, reject) => {
      this.get(url, params)
      .then((response) => {
        resolve(JSON.parse(response));
      })
      .catch(reject);
    });
  }
}

class Vault {
  constructor() {}

  getCredentials() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get({ username: '', accessToken: '' }, (creds) => {
        if (!creds || !creds.username || !creds.accessToken) {
          return reject('missing auth creds');
        }

        resolve(creds);
      });
    });
  }
}

class Github extends Ajax {
  constructor(username, accessToken) {
    super();

    this.enums = new Enum({
      githubIconUrl: 'https://d78fikflryjgj.cloudfront.net/images/services/8cab38550d1f23032facde191031d024/github.png',
      pullRequestProps: [
        'additions',
        'body',
        'changed_files',
        'comments',
        'commits',
        'closed_at',
        'created_at',
        'deletions',
        'diff_url',
        'html_url',
        'mergeable',
        'mergeable_state',
        'merged',
        'merged_at',
        'merged_by',
        'number',
        'repo',
        'title',
        'user'
      ]
    });
    this.username = username;
    this.accessToken = accessToken;
    this.addPrefilter((xhr) => {
      if (xhr.url.includes('https://api.github.com')) {
        let token = btoa(`${this.username}:${this.accessToken}`);
        xhr.setRequestHeader('Authorization', `Basic ${token}`);
      }
    });

    return this;
  }

  getPullRequests(owner, repo) {
    return new Promise((resolve, reject) => {
      this.getJSON(`https://api.github.com/repos/${owner}/${repo}/pulls`).then(resolve).catch(reject);
    })
  }

  getPullRequest(owner, repo, number) {
    return new Promise((resolve, reject) => {
      this.getJSON(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`).then(resolve).catch(reject);
    });
  }
}

class EventBus {
  constructor () {
    this.events = {};
  }

  _generateGuid() {
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
  }

  on(element, event, scope, cb) {
    const guid = this._generateGuid();
    const proxy = (evt) => {
      if (typeof scope === 'function') {
        cb = scope;
        return cb(evt);
      }
      if (get(scope, evt.target.parentNode)) {
        cb(evt);
      }
    };
    element.setAttribute('data-guid', guid);
    element.addEventListener(event, proxy, false);
    this.events[guid] = proxy;
  }

  off(element, event) {
    const proxy = this.events[element.getAttibute('guid')];
    element.removeEventListener(event, proxy, false);
    delete this.events[element.getAttribute('data-guid')];
    element.removeAttribute('data-guid');
  }

  observe(element, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = { attributes: true, attributeOldValue: true };
    }

    return new MutationObserver(cb).observe(element, options);
  }
}

class GithubMergeIcon {
  constructor(state) {
    if (!state || typeof state !== 'string' || !['clean', 'conflict', 'merged'].includes(state.toLowerCase())) {
      throw new Error('Invalid GithubMergeIcon state');
    }

    this.htmlString = `
      <svg class="tsi-merge-icon tsi-merge-icon-${state}" aria-hidden="true" height="45" role="img" version="1.1" viewBox="0 0 12 16" width="30">
        <path d="M11 11.28c0-1.73 0-6.28 0-6.28-0.03-0.78-0.34-1.47-0.94-2.06s-1.28-0.91-2.06-0.94c0 0-1.02 0-1 0V0L4 3l3 3V4h1c0.27 0.02 0.48 0.11 0.69 0.31s0.3 0.42 0.31 0.69v6.28c-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72z m-1 2.92c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2zM4 3c0-1.11-0.89-2-2-2S0 1.89 0 3c0 0.73 0.41 1.38 1 1.72 0 1.55 0 5.56 0 6.56-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72V4.72c0.59-0.34 1-0.98 1-1.72z m-0.8 10c0 0.66-0.55 1.2-1.2 1.2s-1.2-0.55-1.2-1.2 0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2z m-1.2-8.8c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2z"></path>
        </svg>
      `;
  }

  toString() {
    return this.htmlString.trim();
  }
}

class PullRequestTemplate {
  constructor(pr) {
    const mergeState = pr.merged && pr.closed_at? 'merged' :
                     !pr.merged && pr.closed_at? 'conflict' :
                     pr.mergeable? 'clean' : 'conflict';
    const mergeStatusIcon = new GithubMergeIcon(mergeState);
    const mergedBy = pr.merged? `
      <div class="tsi-pull-request-merged-by">
        Merged by <b>${pr.merged_by.login}</b> on ${new Date(pr.merged_at).toLocaleString()}
      </div>
    ` : '';
    const closedBy = pr.closed_at && !pr.merged? `
      <div class="tsi-pull-request-closed-at">
        Closed on ${new Date(pr.closed_at).toLocaleString()}
      </div>
    ` : '';
    const bodyText = pr.body? `<p>${pr.body}</p>` : '';

    this.htmlString = `
      <div class="tsi-github-plugin-pull-request">
        <div class="container">
          <div class="row">
            <div class="col-md-1">
              <div class="tsi-pull-request-merge-state">
                ${mergeStatusIcon}
              </div>
            </div>
            <div class="col-md-11">
              <div class="row">
                <div class="col-md-9">
                  <a class="tsi-pull-request-title" href="${pr.html_url}" target="_blank">
                    ${pr.title}
                  </a>
                </div>
                <div class="col-md-3">
                  <div class="tsi-pull-request-changes">
                    <span class="tsi-pull-request-additions">
                      +${pr.additions}
                    </span>
                    /
                    <span class="tsi-pull-request-deletions">
                      -${pr.deletions}
                    </span>
                  </div>
                </div>
              </div>
              <div class="tsi-pull-request-slug">
                ${pr.repo.full_name} #${pr.number}
              </div>
              <div class="tsi-pull-request-opened-by">
                Opened by <b>${pr.user.login}</b> on ${new Date(pr.created_at).toLocaleString()}
              </div>
              ${mergedBy}
              ${closedBy}
              ${bodyText}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  toString() {
      return this.htmlString.trim();
  }
}

class PullRequestSectionTemplate {
  constructor(data) {
    this.prList = data.map((prData) => {
      return new PullRequestTemplate(prData);
    });
    this.htmlString = `
      <div class="tsi-github-plugin">
        <div class="window-module-title">
          <h3>Github Pull Requests</h3>
          ${this.prList.join('\n')}
          </div>
        </div>
      </div>
    `;
  }

  toString() {
      return this.htmlString.trim();
  }
}

// const pullRequestButton = `
//   <a class="button-link js-attach-pull-request" href="#">
//     Attach PR
//   </a>
// `;

// const pullRequestPopoverTemplate = `
//   <div>
//     <div class="pop-over-header js-pop-over-header">
//       <span class="pop-over-header-title">Which pull request?</span>
//       <a href="#" class="pop-over-header-close-btn icon-sm icon-close"></a>
//     </div>
//   </div>
// `;

class Util {
  static is(target, state) {
    switch (state) {
      case 'hidden':
      case 'hidden?':
        return target.offsetWidth === target.offsetHeight == 0;
      case 'visible':
      case 'visible?':
        return target.offsetWidth > 0 < target.offsetHeight;
      case 'empty':
      case 'empty?':
        return Object.keys(target).length
      case 'object':
      case 'object?':
        return target.constructor === 'object';
    }
  }

  static pick(target, props) {
    const dest = {};

    if (typeof props === 'string') {
      props = [props];
    }

    props.forEach((key) => {
      dest[key] = target[key];
    })

    return dest;
  }
}

class Main {
  constructor() {
    const sel = this.sel = new SelectorEngine();
    const eventBus = this.eventBus = new EventBus();
    const vault = this.vault = new Vault();
    this.github = null;

    this.cardWindow = sel.get(DOMClassName.cardWindow);
    this.cardWindowIsOpen = Util.is(this.cardWindow, 'visible?');

    vault.getCredentials()
    .then(this.handleCredentialSuccess.bind(this))
    .catch(this.handleCredentialError.bind(this));

    this.eventBus.observe(this.cardWindow, this.handleDOMMutation.bind(this));

    // TODO: Event handling for sidebar button
    // sel.on(cardWindow, 'click', '.js-attach-pull-request', (evt) => {
    //   evt.preventDefault();
    //   const button = evt.target;
    //   const popover = get('.pop-over');

    //   popover.innerHTML = pullRequestPopoverTemplate;
    //   popover.classList.add('is-shown');
    //   popover.style.left = (cardWindow.offsetLeft + cardWindow.offsetWidth - get('.window-sidebar').offsetWidth) + 'px';
    //   popover.style.top = (button.offsetTop + button.offsetHeight) + 'px';

    //   getPullRequests();

    //   const popoverClose = get('.pop-over-header-close-btn');
    //   on(popoverClose, 'click', (evt) => {
    //     evt.preventDefault();
    //     const button = evt.target;
    //     const popover = get('.pop-over');
    //     popover.innerHTML = '';
    //     popover.classList.remove('is-shown');
    //     off(popoverClose, 'click');
    //   });
    // });
  }

  handleCredentialSuccess(credentials) {
    this.github = new Github(credentials.username, credentials.accessToken);
  }

  handleCredentialError(reason) {
    if (reason === 'missing auth creds') {
      const redirect = window.confirm('Hold up Cochise, you need a Github username and access token to use this extension. Go set that ish up in the options section.');

      if (redirect) {
         if (chrome.runtime.openOptionsPage) {
            // New way to open options pages, if supported (Chrome 42+).
            chrome.runtime.openOptionsPage();
          } else {
            // Reasonable fallback.
            window.open(chrome.runtime.getURL('options.html'));
          }
      }
    }
  }

  handleDOMMutation(mutations, observer) {
    const github = this.github;
    const sel = this.sel;

    if (!sel || !github) { return }

    this.cardWindowIsOpen = Util.is(this.cardWindow, 'visible?');

    if (this.cardWindowIsOpen) {
      const ghPrLinks = Array.toArray(
        sel.getAll(DOMClassName.githubLinkClassName, DOMClassName.cardDescription)
      ).filter((el) => {
        return el.hostname === 'github.com' && /pull/.test(el.pathname);
      });

      if (ghPrLinks.length === 0) {
        return;
      }

      // TODO: Attach PR to card from button in right sidebar
      // if (sel.get(DOMClassName.pluginButtonOutlet)) {
      //   sel.get(pluginButtonOutlet).innerHTML = `
      //     <h3>Github</h3>
      //     ${pullRequestButton}
      //   `;
      // }

      Promise.all(
        ghPrLinks.map((link) => {
          return new Promise((resolve, reject) => {
            const linkParts = link.pathname.split('/').filter(Boolean);
            const owner = linkParts[0];
            const repo = linkParts[1];
            const pullNumber = linkParts[3];

            github.getPullRequest(owner, repo, pullNumber)
            .then((result) => {
              const state = Object.extend({
                repo: {
                  full_name: `${owner}/${repo}`
                }
              }, Util.pick(result, github.enums.pullRequestProps));

              link.classList.add('hide');

              resolve(state);
            })
            .catch(reject);
          });
        })
      )
      .then((pullRequests) => {
        sel.get(DOMClassName.pluginMainOutlet).innerHTML = new PullRequestSectionTemplate(pullRequests);
      })
      .catch((err) => {
        throw err;
      });
    }
  }
}

try {
  new Main();
}
catch (ex) {
  console.error(ex);
}
