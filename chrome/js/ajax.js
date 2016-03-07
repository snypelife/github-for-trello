'use strict';

class Ajax {
  constructor() {
    this.prefilters = [];
  }

  addPrefilter(cb) {
    this.prefilters.push(cb);
  }

  serializeParams(params) {
    let queryParams = '';
    params = params || {};
    Object.keys(params).forEach((key, i) => {
      if (i === 0) { queryParams += '?'; }
      else { queryParams += '&'; }
      queryParams += encodeURI(`${key}=${params[key]}`);
    });
    return queryParams;
  }

  get(url, params) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      params = this.serializeParams(params);

      xhr.url = encodeURI(url + params);
      xhr.open('GET', xhr.url);
      xhr.onload = () => {
        if (xhr.status !== 200) {
          return reject(xhr.status);
        }
        resolve(xhr.responseText);
      };

      this.prefilters.forEach((prefilter) => {
        prefilter(xhr);
      });

      xhr.send();
    });
  }

  getJSON(url, params) {
    return new Promise((resolve, reject) => {
      this.get(url, params)
      .then((response) => {
        resolve(JSON.parse(response));
      })
      .catch(reject);
    });
  }
}

export default Ajax
