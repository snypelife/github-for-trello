'use strict';

import { is } from './utility.js'

function _serializeParams(params) {
  let queryParams = '';
  params = params || {};
  Object.keys(params).forEach((key, i) => {
    if (i === 0) { queryParams += '?'; }
    else { queryParams += '&'; }
    queryParams += encodeURI(`${key}=${params[key]}`);
  });
  return queryParams;
}

function get(url, params, settings) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    params = _serializeParams(params);
    const precalls = is(settings.before, 'array?') ?
                     settings.before :
                     is(settings.before, 'function?') ?
                     [settings.before] : []

    xhr.url = encodeURI(url + params);
    xhr.open('GET', xhr.url);
    xhr.onload = () => {
      if (xhr.status !== 200) {
        return reject(xhr.status);
      }
      resolve(xhr.responseText);
    };

    precalls.forEach((precall) => precall(xhr));

    xhr.send();
  });
}

function getJSON(url, params, settings) {
  return new Promise((resolve, reject) => {
    get(url, params, settings)
    .then((response) => {
      resolve(JSON.parse(response));
    }, reject);
  });
}

export { _serializeParams, get, getJSON }
