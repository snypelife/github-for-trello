'use strict';

const pluginMainOutlet = '.js-plugin-sections';
const pluginButtonOutlet = '.js-plugin-buttons';
const githubIconUrl = 'https://d78fikflryjgj.cloudfront.net/images/services/8cab38550d1f23032facde191031d024/github.png';
const pullRequestProps = [
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
];

const cardClassName = '.list-card';
const githubLinkClassName = '.known-service-link';

const cardWindow = get('.window');

let cardIsOpen = is(cardWindow, 'visible?');

let username;
let accessToken;

function getJSON(url, cb) {
  $.ajax({
    url,
    type: 'GET',
    success: (res) => {
      cb(null, res);
    },
    error: (jqXhr) => {
      cb(jqXhr);
    }
  });
}

function getPullRequests(owner, repo, cb) {
  getJSON(`https://api.github.com/repos/${owner}/${repo}/pulls`, cb);
}

function getPullRequest(owner, repo, number, cb) {
  getJSON(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`, cb);
}

on(cardWindow, 'click', '.js-attach-pull-request', (evt) => {
  evt.preventDefault();
  const button = evt.target;
  const popover = get('.pop-over');

  popover.innerHTML = pullRequestPopoverTemplate;
  popover.classList.add('is-shown');
  popover.style.left = (cardWindow.offsetLeft + cardWindow.offsetWidth - get('.window-sidebar').offsetWidth) + 'px';
  popover.style.top = (button.offsetTop + button.offsetHeight) + 'px';

  getPullRequests();

  const popoverClose = get('.pop-over-header-close-btn');
  on(popoverClose, 'click', (evt) => {
    evt.preventDefault();
    const button = evt.target;
    const popover = get('.pop-over');
    popover.innerHTML = '';
    popover.classList.remove('is-shown');
    off(popoverClose, 'click');
  });
});


getCreds().then(
  (creds) => {
  username = creds.username;
  accessToken = creds.accessToken;

  $.ajaxPrefilter(ajaxPrefilter);

  observe(cardWindow, (mutations, observer) => {
    if (cardIsOpen) {

      const ghPrLinks = toArray(getAll(githubLinkClassName, cardWindow)).filter((el) => {
        return el.hostname === 'github.com' && /pull/.test(el.pathname);
      });

      if (get(pluginButtonOutlet)) {
        get(pluginButtonOutlet).innerHTML = `
          <h3>Github</h3>
          ${pullRequestButton}
        `;
      }

      if (ghPrLinks.length > 0) {
        Promise.all(
          ghPrLinks.map((link) => {
            return new Promise((resolve, reject) => {
              const linkParts = link.pathname.split('/').filter(Boolean);
              const owner = linkParts[0];
              const repo = linkParts[1];
              const pullNumber = linkParts[3];

              getPullRequest(owner, repo, pullNumber, (err, res) => {
                if (err) {
                  return reject(err);
                }
                const state = _.merge({
                  repo: {
                    full_name: `${owner}/${repo}`
                  }
                }, _.pick(res, pullRequestProps));

                link.classList.add('hide');

                resolve(state);
              });
            });
          })
        ).then(
          (pullRequests) => {
            get(pluginMainOutlet).innerHTML = pullRequestSectionTemplate(pullRequests);
          },
          (err) => {
            throw err;
        });
      }
    }

    cardIsOpen = is(cardWindow, 'visible?');
  });
},
(reason) => {
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
});
