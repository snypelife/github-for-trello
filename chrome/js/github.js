'use strict'

import Ajax from './ajax.js'

export default function github (username, accessToken) {
  return {
    getPullRequests (owner, repo) {
      return new Promise((resolve, reject) => {
        Ajax.get(`https://api.github.com/repos/${owner}/${repo}/pulls`)
          .auth(username, accessToken)
          .end((err, res) => {
            if (err) { return reject(err) }
            resolve(res)
          })
      })
    },

    getPullRequest (owner, repo, number) {
      return new Promise((resolve, reject) => {
        Ajax.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`)
          .auth(username, accessToken)
          .end((err, res) => {
            if (err) { return reject(err) }
            resolve(res)
          })
      })
    },

    postPullRequestComment (owner, repo, number, comment) {
      return new Promise((resolve, reject) => {
        Ajax.post(`https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments`)
          .auth(username, accessToken)
          .send({ body: comment })
          .end((err, res) => {
            if (err) { return reject(err) }
            resolve(res)
          })
      })
    }
  }
}
