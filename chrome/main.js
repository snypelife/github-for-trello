'use strict'

import { merge, pick, toArray, filter, map } from 'lodash-es'
import Enums from './js/enums.js'
import { get as getElement, getAll as getElements } from './js/selector-engine.js'
import { on, off, observe } from './js/event-bus.js'
import github from './js/github.js'
import { PullRequestSectionTemplate } from './js/templates.js'
import { isVisible } from './js/utility.js'
import * as trello from './js/trello.js'

const prLinkRegex = /(?:http(?:s)?:\/\/)?(?:github\.com)?\/(.+)\/(.+)\/(.+)\/(.+)/

function handleCredentialError (reason) {
  if (reason === 'missing auth creds') {
    const redirect = window.confirm('Hold up, you need a Github username and access token to use this extension. Go set that ish up in the options section.')

    if (redirect) {
      if (chrome.runtime.openOptionsPage) {
        // New way to open options pages, if supported (Chrome 42+).
        chrome.runtime.openOptionsPage()
      } else {
        // Reasonable fallback.
        window.open(chrome.runtime.getURL('options.html'))
      }
    }
  }
}

function extractGithubInfoFromLink (link) {
  if (prLinkRegex.test(link)) {
    const linkParts = link.match(prLinkRegex)
    return {
      owner: linkParts[1],
      repo: linkParts[2],
      type: linkParts[3],
      number: linkParts[4]
    }
  } else {
    throw new Error('something happened')
  }
}

function ghSectionBuilder (github) {
  return () => {
    const ghPrLinks = filter(toArray(
      getElements(`${Enums.cardDescription} ${Enums.githubLinkClassName}`)
    ), (el) => el.hostname === 'github.com' && /pull/.test(el.pathname))

    if (ghPrLinks.length === 0) { return }

    Promise.all(
      map(ghPrLinks, (link) => {
        return new Promise((resolve, reject) => {
          const pr = extractGithubInfoFromLink(link.pathname)

          github.getPullRequest(pr.owner, pr.repo, pr.number)
          .then((result) => {
            const state = merge({
              repo: {
                full_name: `${pr.owner}/${pr.repo}`
              }
            }, pick(result, Enums.pullRequestProps))

            link.classList.add('hide')

            resolve(state)
          })
          .catch(reject)
        })
      })
    )
    .then((pullRequests) => {
      getElement(Enums.pluginMainOutlet).innerHTML = PullRequestSectionTemplate(pullRequests)
    }, (err) => {
      throw err
    })
  }
}

function lgtmHandler (github) {
  return (evt) => {
    evt.preventDefault()
    const link = evt.target.getAttribute('data-pr-link')
    const pr = extractGithubInfoFromLink(link)

    github.postPullRequestComment(pr.owner, pr.repo, pr.number, 'LGTM:+1:')
    .then(() => {
      console.log('SUCCESSFUL LGTM')
    })
    .then(null, (err) => {
      console.error('FAILED LGTM', err)
    })
  }
}

function DOMHandler (github) {
  const buildGithubSection = ghSectionBuilder(github)
  const handleLGTMClick = lgtmHandler(github)

  return () => {
    const cardWindow = getElement(Enums.cardWindow)
    const cardWindowIsOpen = isVisible(cardWindow)

    trello.insertPullRequestBadges()

    if (cardWindowIsOpen) {
      on('change', getElement(Enums.cardDescription), '.field', buildGithubSection)
      on('click', getElement(Enums.pluginMainOutlet), '.js-lgtm', handleLGTMClick)
      buildGithubSection()
    } else {
      off('change', getElement(Enums.cardDescription))
      off('click', getElement(Enums.pluginMainOutlet))
    }
  }
}

function start () {
  chrome.storage.sync.get({ username: '', accessToken: '' }, (creds) => {
    if (!creds || !creds.username || !creds.accessToken) {
      return handleCredentialError('missing auth creds')
    }

    const gh = github(creds.username, creds.accessToken)
    const handleDOMMutation = DOMHandler(gh)
    handleDOMMutation()
    observe(getElement(Enums.cardWindow), handleDOMMutation)
  })
}

try {
  start()
} catch (ex) {
  console.error(ex)
}
