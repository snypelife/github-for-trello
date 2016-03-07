'use strict';

class SelectorEngine {
  constructor() {}

  getAll(selector, scope) {
    scope = scope || document;

    if (typeof scope === 'string') {
      scope = document.querySelector(scope);
    }

    return scope.querySelectorAll(selector);
  }

  get(selector, scope) {
    return this.getAll(selector, scope)[0];
  }
}

export default SelectorEngine
