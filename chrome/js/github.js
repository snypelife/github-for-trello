'use strict';

import Enums from './enums.js'
import Ajax from './ajax.js'

class Github extends Ajax {
  constructor(username, accessToken) {
    super();

    this.enums = Enums;
    this.username = username;
    this.accessToken = accessToken;
    this.addPrefilter((xhr) => {
      if (xhr.url.indexOf('https://api.github.com') === 0) {
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

export default Github
