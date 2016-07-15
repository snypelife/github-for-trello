'use strict';

import Ajax from './ajax.js';
import Enums from './enums.js';
import { get as getElement } from './selector-engine.js';
import { GithubMergeIcon } from './templates.js';

//AmIt1mF1
const API_cards = (boardId) => {
  return `https://trello.com/1/boards/${boardId}/cards?fields=url,desc`;
};
const cardUrlSet = [];

export function getCards(cb) {
  const boardId = location.href.match(Enums.boardRegex)[1];
  Ajax.get(API_cards(boardId)).end((err, data) => {
    if (err) { throw err; }
    cb(data);
  });
}

export function insertPullRequestBadges() {
  getCards((cards) => {
    cards.filter((card) => {
      return !cardUrlSet.includes(card.url) && Enums.prLinkRegex.test(card.desc);
    })
    .forEach((card) => {
      cardUrlSet.push(card.url);
      const cardPath = card.url.match(Enums.cardRegex)[1];
      const badge = document.createElement('div');
      badge.setAttribute('title', 'This card has a Github pull request attached')
      badge.classList.add('badge', 'is-icon-only');
      badge.innerHTML = GithubMergeIcon('clean', 20, 20);
      getElement(`[href="${cardPath}"] ~ .badges`).appendChild(badge);
    });
  });
}
