'use strict';

import { is, pick } from './js/utility.js'
import Enums from './js/enums.js'
import { get as getElement, getAll as getElements } from './js/selector-engine.js'
import { on, off, observe } from './js/event-bus.js'
import { getCredentials } from './js/vault.js'
import github from './js/github.js'
import { PullRequestSectionTemplate } from './js/templates.js'

let gh, cardWindow, cardWindowIsOpen;

function handleCredentialSuccess(credentials) {
  gh = github(credentials.username, credentials.accessToken);
}

function handleCredentialError(reason) {
  if (reason === 'missing auth creds') {
    const redirect = window.confirm('Hold up, you need a Github username and access token to use this extension. Go set that ish up in the options section.');

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

function buildGithubSection() {

  const ghPrLinks = Array.toArray(
    getElements(`${Enums.cardDescription} ${Enums.githubLinkClassName}`)
  ).filter((el) => el.hostname === 'github.com' && /pull/.test(el.pathname));

  if (ghPrLinks.length === 0) { return; }

  // TODO: Attach PR to card from button in right sidebar
  // if (getElement(Enums.pluginButtonOutlet)) {
  //   getElement(pluginButtonOutlet).innerHTML = `
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

        gh.getPullRequest(owner, repo, pullNumber)
        .then((result) => {
          const state = Object.extend({
            repo: {
              full_name: `${owner}/${repo}`
            }
          }, pick(result, Enums.pullRequestProps));

          link.classList.add('hide');

          resolve(state);
        })
        .catch(reject);
      });
    })
  )
  .then((pullRequests) => {
    getElement(Enums.pluginMainOutlet).innerHTML = PullRequestSectionTemplate(pullRequests);
  }, (err) => {
    throw err;
  });
}

function handleDOMMutation() {
  cardWindowIsOpen = is(cardWindow, 'visible?');

  if (cardWindowIsOpen) {
    on('change', getElement(Enums.cardDescription), '.field', buildGithubSection);
    on('click', getElement(Enums.pluginMainOutlet), '.js-lgtm', (evt) => {
      evt.preventDefault();
      alert('LGTM!');
    });
    buildGithubSection();
  } else {
    off('change', getElement(Enums.cardDescription));
  }
}

function main() {
  cardWindow = getElement(Enums.cardWindow);
  cardWindowIsOpen = is(cardWindow, 'visible?');

  getCredentials()
  .then(handleCredentialSuccess, handleCredentialError)
  .then(() => {
    observe(cardWindow, handleDOMMutation);
    if (cardWindowIsOpen) { handleDOMMutation(); }
  }, handleCredentialError);
}

try {
  main();
} catch (ex) {
  console.error(ex);
}
