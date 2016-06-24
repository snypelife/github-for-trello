'use strict';

import { getJSON, postJSON } from './ajax.js'
import { startsWith } from './utility.js'

const github = (authToken) => {
  const prefilter = (xhr) => {
    if (startsWith(xhr.url, 'https://api.github.com')) {
      xhr.setRequestHeader('Authorization', `Basic ${authToken}`);
    }
  };

  return {
    getPullRequests(owner, repo) {
      return new Promise((resolve, reject) => {
        getJSON(`https://api.github.com/repos/${owner}/${repo}/pulls`, {}, {
          before: prefilter
        }).then(resolve).then(null, reject);
      })
    },

    getPullRequest(owner, repo, number) {
      return new Promise((resolve, reject) => {
        getJSON(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`, {}, {
          before: prefilter
        }).then(resolve).then(null, reject);
      });
    },

    postPullRequestComment(owner, repo, number, comment) {
      return new Promise((resolve, reject) => {
        postJSON(`https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments`, {
            body: comment
          }, {
          before: prefilter
        }).then(resolve).then(null, reject);
      });
    }
  }
}

export default github
