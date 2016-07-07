'use strict';

class Ajax {
  constructor(xhr) {
    this.xhr = xhr;
  }
  static get(url) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    return new Ajax(xhr);
  }
  static post(url) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    return new Ajax(xhr);
  }
  auth(user, pass) {
    const auth = btoa(`${user}:${pass}`);
    this.xhr.setRequestHeader('Authorization', `Basic ${auth}`)
    return this;
  }
  send(payload) {
    this.payload = JSON.stringify(payload);
    return this;
  }
  end(cb) {
    this.xhr.responseType = 'json';
    this.xhr.onreadystatechange = () => {
      if (this.xhr.readyState === XMLHttpRequest.DONE) {
        if (this.xhr.status >= 200 && this.xhr.status <= 299) {
          cb(null, this.xhr.response);
        } else {
          cb(new Error(this.xhr.statusText));
        }
      }
    };
    this.xhr.addEventListener('load', cb);
    this.xhr.send(this.payload);
  }
}

export default function github(username, accessToken) {
  return {
    getPullRequests(owner, repo) {
      return new Promise((resolve, reject) => {
        Ajax.get(`https://api.github.com/repos/${owner}/${repo}/pulls`)
          .auth(username, accessToken)
          .end((err, res) => {
            if (err) { return reject(err); }
            resolve(res);
          });
      });
    },

    getPullRequest(owner, repo, number) {
      return new Promise((resolve, reject) => {
        Ajax.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`)
          .auth(username, accessToken)
          .end((err, res) => {
            if (err) { return reject(err); }
            resolve(res);
          });
      });
    },

    postPullRequestComment(owner, repo, number, comment) {
      return new Promise((resolve, reject) => {
        Ajax.post(`https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments`)
          .auth(username, accessToken)
          .send({ body: comment })
          .end((err, res) => {
            if (err) { return reject(err); }
            resolve(res);
          });
      });
    }
  }
}
