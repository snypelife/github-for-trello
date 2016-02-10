'use strict';

function pullRequestTemplate(pr) {
  const mergeState = pr.closed_at? icons.merge.conflict :
                     pr.merged_at? icons.merge.merged :
                     icons.merge.clean;
  const mergedBy = pr.merged? `
    <div class="tsi-pull-request-merged-by">
      Merged by <b>${pr.merged_by.login}</b> on ${new Date(pr.merged_at).toLocaleString()}
    </div>
  ` : '';
  const closedAt = pr.closed_at? `
    <div class="tsi-pull-request-closed-at">
      Closed on ${new Date(pr.closed_at).toLocaleString()}
    </div>
  ` : '';
  const bodyText = pr.body? `<p>${pr.body}</p>` : '';

  return `<div class="tsi-github-plugin-pull-request">
    <div class="container">
      <div class="row">
        <div class="col-md-1">
          <div class="tsi-pull-request-merge-state">
            ${mergeState}
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
          ${closedAt}
          ${bodyText}
        </div>
      </div>
    </div>
  </div>`;
}

function pullRequestSectionTemplate(pullRequests) {
  const prList = pullRequests.map(pullRequestTemplate);
  return `
    <div class="tsi-github-plugin">
      <div class="window-module-title">
        <h3>Github Pull Requests</h3>
        ${prList.join('\n')}
        </div>
    </div>
  </div>
  `;
}

const pullRequestButton = `
  <a class="button-link js-attach-pull-request" href="#">
    Attach PR
  </a>
`;

const pullRequestPopoverTemplate = `
  <div>
    <div class="pop-over-header js-pop-over-header">
      <span class="pop-over-header-title">Which pull request?</span>
      <a href="#" class="pop-over-header-close-btn icon-sm icon-close"></a>
    </div>
  </div>
`;
