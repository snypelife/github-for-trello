'use strict'

import { escape as htmlEscape } from 'lodash-es'

export function GithubMergeIcon (state, height, width) {
  if (!state || typeof state !== 'string' || !['clean', 'conflict', 'merged'].includes(state.toLowerCase())) {
    throw new Error('Invalid GithubMergeIcon state')
  }

  height = height || 45
  width = width || 30

  const htmlString = `
    <svg class="trello-merge-icon trello-merge-icon-${state}" aria-hidden="true" height="${height}" role="img" version="1.1" viewBox="0 0 12 16" width="${width}">
      <path d="M11 11.28c0-1.73 0-6.28 0-6.28-0.03-0.78-0.34-1.47-0.94-2.06s-1.28-0.91-2.06-0.94c0 0-1.02 0-1 0V0L4 3l3 3V4h1c0.27 0.02 0.48 0.11 0.69 0.31s0.3 0.42 0.31 0.69v6.28c-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72z m-1 2.92c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2zM4 3c0-1.11-0.89-2-2-2S0 1.89 0 3c0 0.73 0.41 1.38 1 1.72 0 1.55 0 5.56 0 6.56-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72V4.72c0.59-0.34 1-0.98 1-1.72z m-0.8 10c0 0.66-0.55 1.2-1.2 1.2s-1.2-0.55-1.2-1.2 0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2z m-1.2-8.8c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2z"></path>
      </svg>
    `

  return htmlString.trim()
}

export function PullRequestTemplate (pullRequest) {
  const mergeState = pullRequest.merged && pullRequest.closed_at ? 'merged'
                     : !pullRequest.merged && pullRequest.closed_at ? 'conflict'
                     : pullRequest.mergeable ? 'clean' : 'conflict'
  const mergeStatusIcon = GithubMergeIcon(mergeState)
  const mergedBy = pullRequest.merged ? `
      <div class="trello-pull-request-merged-by">
        Merged by <b>${pullRequest.merged_by.login}</b> on ${new Date(pullRequest.merged_at).toLocaleString()}
      </div>
    ` : ''
  const closedBy = pullRequest.closed_at && !pullRequest.merged ? `
      <div class="trello-pull-request-closed-at">
        Closed on ${new Date(pullRequest.closed_at).toLocaleString()}
      </div>
    ` : ''
  const bodyText = pullRequest.body ? `<p>${htmlEscape(pullRequest.body)}</p>` : ''
  const LGTM = mergeState === 'clean'
      ? `<a class="button-link js-lgtm" href="#" data-pr-link="${pullRequest.html_url}"><span class="icon-sm icon-vote"></span>LGTM!</a>`
      : ''

  const htmlString = `
      <div class="trello-github-plugin-pull-request">
        <div class="container">
          <div class="row">
            <div class="col-md-1">
              <div class="trello-pull-request-merge-state">
                ${mergeStatusIcon}
              </div>
            </div>
            <div class="col-md-11">
              <div class="row">
                <div class="col-md-9">
                  <a class="trello-pull-request-title" href="${pullRequest.html_url}" target="_blank">
                    ${htmlEscape(pullRequest.title)}
                  </a>
                  <div class="trello-pull-request-slug">
                    ${htmlEscape(pullRequest.repo.full_name)} #${pullRequest.number}
                  </div>
                  <div class="trello-pull-request-opened-by">
                    Opened by <b>${htmlEscape(pullRequest.user.login)}</b> on ${new Date(pullRequest.created_at).toLocaleString()}
                  </div>
                  ${mergedBy}
                  ${closedBy}
                </div>
                <div class="col-md-3">
                  <div class="trello-pull-request-changes">
                    <span class="trello-pull-request-additions">
                      +${pullRequest.additions}
                    </span>
                    /
                    <span class="trello-pull-request-deletions">
                      -${pullRequest.deletions}
                    </span>
                  </div>
                  ${LGTM}
                </div>
              </div>
              ${bodyText}
            </div>
          </div>
        </div>
      </div>
    `

  return htmlString.trim()
}

export function PullRequestSectionTemplate (pullRequests) {
  const prList = pullRequests.map((prData) => PullRequestTemplate(prData))
  const htmlString = `
    <div class="trello-github-plugin">
      <div class="window-module-title">
        <h3>Github Pull Requests</h3>
        ${prList.join('\n')}
        </div>
      </div>
    </div>
  `

  return htmlString.trim()
}
