'use strict';

import _ from './js/utility.js'
import Enums from './js/enums.js'
import SelectorEngine from './js/selector-engine.js'
import EventBus from './js/event-bus.js'
import Vault from './js/vault.js'
import Github from './js/github.js'
import { PullRequestSectionTemplate } from './js/templates.js'

let github, sel, eventBus, vault, cardWindow, cardWindowIsOpen;

function handleCredentialSuccess(credentials) {
  github = new Github(credentials.username, credentials.accessToken);
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
    sel.getAll(Enums.githubLinkClassName, Enums.cardDescription)
  ).filter((el) => {
    return el.hostname === 'github.com' && /pull/.test(el.pathname);
  });

  if (ghPrLinks.length === 0) { return; }

  // TODO: Attach PR to card from button in right sidebar
  // if (sel.get(Enums.pluginButtonOutlet)) {
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
          }, _.pick(result, Enums.pullRequestProps));

          link.classList.add('hide');

          resolve(state);
        })
        .catch(reject);
      });
    })
  )
  .then((pullRequests) => {
    sel.get(Enums.pluginMainOutlet).innerHTML = PullRequestSectionTemplate(pullRequests);
  })
  .catch((err) => {
    throw err;
  });
}

function handleDOMMutation() {
  if (!sel || !github) { return; }

  cardWindowIsOpen = _.is(cardWindow, 'visible?');

  if (cardWindowIsOpen) {
    eventBus.on(sel.get(Enums.cardDescription), 'change', '.field', () => {
      buildGithubSection();
    });
    buildGithubSection();
  } else {
    eventBus.off(sel.get(Enums.cardDescription), 'change');
  }
}

function main() {
  sel = new SelectorEngine();
  eventBus = new EventBus();
  vault = new Vault();

  cardWindow = sel.get(Enums.cardWindow);
  cardWindowIsOpen = _.is(cardWindow, 'visible?');

  vault.getCredentials()
  .then(handleCredentialSuccess)
  .catch(handleCredentialError);

  eventBus.observe(cardWindow, handleDOMMutation);
}

try {
  main();
}
catch (ex) {
  console.error(ex);
}
