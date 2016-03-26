'use strict';

import { getJSON } from './ajax.js'
import { startsWith } from './utility.js'

const github = (username, accessToken) => {
  const authToken = btoa(`${username}:${accessToken}`);
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
        }).then(resolve, reject);
      })
    },

    getPullRequest(owner, repo, number) {
      return new Promise((resolve, reject) => {
        getJSON(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`, {}, {
          before: prefilter
        }).then(resolve, reject);
      });
    }
  }
}

export default github
