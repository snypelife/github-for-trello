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

function ajax(method, url, params, settings) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const precalls = is(settings.before, 'array?') ?
                     settings.before :
                     is(settings.before, 'function?') ?
                     [settings.before] : []
    let data;
    params = settings.json? JSON.stringify(params) : _serializeParams(params);
    if (/get/i.test(method)) {
      xhr.url = encodeURI(url + params);
      xhr.open('GET', xhr.url);
    } else if (/post/i.test(method)) {
      data = params;
      xhr.url = url;
      xhr.open('POST', xhr.url);
    } else{
      throw new Error('Invalid HTTP method!');
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status <= 299) {
          return resolve(xhr.responseText);
        }
        reject(xhr.status);
      }
    };

    precalls.forEach((precall) => precall(xhr));

    xhr.send(data);
  });
}

function get(url, params, settings) {
  return ajax('GET', url, params, settings);
}

function post(url, params, settings) {
  return ajax('POST', url, params, settings);
}

function getJSON(url, params, settings) {
  settings.json = true;
  return new Promise((resolve, reject) => {
    get(url, params, settings)
    .then((response) => {
      resolve(JSON.parse(response));
    }, reject);
  });
}

function postJSON(url, params, settings) {
  settings.json = true;
  return new Promise((resolve, reject) => {
    post(url, params, settings)
    .then((response) => {
      resolve(response);
    }, reject);
  });
}

export { _serializeParams, get, getJSON, post, postJSON }
