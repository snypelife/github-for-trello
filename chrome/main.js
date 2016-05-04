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

function extractGithubInfoFromLink(link) {
  const regex = /(?:http(?:s)?:\/\/)?(?:github\.com)?\/(.+)\/(.+)\/(.+)\/(.+)/;

  if (regex.test(link)) {
    const linkParts = link.match(regex);
    return {
      owner: linkParts[1],
      repo: linkParts[2],
      type: linkParts[3],
      number: linkParts[4]
    };
  } else {
    throw new Error('something happened')
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
        const pr = extractGithubInfoFromLink(link.pathname);

        gh.getPullRequest(pr.owner, pr.repo, pr.number)
        .then((result) => {
          const state = Object.extend({
            repo: {
              full_name: `${pr.owner}/${pr.repo}`
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

function handleLGTMClick(evt) {
  evt.preventDefault();
  const link = evt.target.getAttribute('data-pr-link');
  const pr = extractGithubInfoFromLink(link);

  gh.postPullRequestComment(pr.owner, pr.repo, pr.number, 'LGTM:+1:')
  .then(() => {
    console.log('SUCCESSFUL LGTM');
  }, () => {
    console.error('FAILED LGTM')
  });
}

function handleDOMMutation() {
  cardWindowIsOpen = is(cardWindow, 'visible?');

  if (cardWindowIsOpen) {
    on('change', getElement(Enums.cardDescription), '.field', buildGithubSection);
    on('click', getElement(Enums.pluginMainOutlet), '.js-lgtm', handleLGTMClick);
    buildGithubSection();
  } else {
    off('change', getElement(Enums.cardDescription));
    off('click', getElement(Enums.pluginMainOutlet));
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
