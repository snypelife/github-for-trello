'use strict'

import Ajax from './ajax.js'
import Enums from './enums.js'
import { get as getElement } from './selector-engine.js'
import { GithubMergeIcon } from './templates.js'

// AmIt1mF1
const apiCards = (boardId) => {
  return `https://trello.com/1/boards/${boardId}/cards?fields=url,desc`
}
const cardUrlSet = []

export function getCards (cb) {
  const match = location.href.match(Enums.boardRegex)

  if (!match || !match[1]) { return }

  const boardId = match[1]
  Ajax.get(apiCards(boardId)).end((err, data) => {
    if (err) { return cb(err) }
    cb(null, data)
  })
}

export function insertPullRequestBadges () {
  getCards((err, cards) => {
    if (err) { throw err }

    cards.filter((card) => {
      return !cardUrlSet.includes(card.url) && Enums.prLinkRegex.test(card.desc)
    })
    .forEach((card) => {
      cardUrlSet.push(card.url)
      const cardPath = card.url.match(Enums.cardRegex)[1]
      const badge = document.createElement('div')
      badge.setAttribute('title', 'This card has a Github pull request attached')
      badge.classList.add('badge', 'is-icon-only')
      badge.innerHTML = GithubMergeIcon('clean', 20, 20)
      getElement(`[href="${cardPath}"] ~ .badges`).appendChild(badge)
    })
  })
}
