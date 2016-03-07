'use strict';

import SelectorEngine from './selector-engine.js'

class EventBus {
  constructor () {
    this.events = {};
    this.$ = new SelectorEngine();
  }

  _generateGuid() {
    // returns 00000000-0000-0000-0000-000000000000
    const guid = [];
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint32Array(32);
    window.crypto.getRandomValues(array);

    array.forEach((val, i) => {
      let char = charset[val % charset.length];
      if (i === 7 || i === 11 || i === 15) {
        char += '-';
      }
      guid.push(char);
    });

    return guid.join('');
  }

  on(element, event, scope, cb) {
    if (element.getAttribute('data-guid')) {
      console.warn(`Element ${element.getAttribute('data-guid')} already has listener attached, ignoring..`);
      return;
    }

    const guid = this._generateGuid();
    const proxy = (evt) => {
      if (typeof scope === 'function') {
        cb = scope;
        return cb(evt);
      }
      if (this.$.get(scope, evt.target.parentNode)) {
        return cb(evt);
      }
    };
    element.setAttribute('data-guid', guid);
    element.addEventListener(event, proxy, false);
    this.events[guid] = {
      handler: proxy,
      element
    }
  }

  off(element, eventName) {
    if (element) {
      const proxy = this.events[element.getAttribute('guid')];
      element.removeEventListener(eventName, proxy, false);
      delete this.events[element.getAttribute('data-guid')];
      element.removeAttribute('data-guid');
    } else {
      Object.keys(this.events).forEach((key) => {
        const element = this.events[key].element;
        const proxy = this.events[key].handler;
        element.removeEventListener(eventName, proxy, false);
        delete this.events[key];
      })
    }
  }

  observe(element, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {
        attributes: true,
        attributeOldValue: true
      };
    }

    return new MutationObserver(cb).observe(element, options);
  }
}

export default EventBus
