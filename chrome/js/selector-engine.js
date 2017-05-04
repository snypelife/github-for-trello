'use strict'

function getAll (selector, scope) {
  scope = scope || document

  if (typeof scope === 'string') {
    scope = document.querySelector(scope)
  }

  return scope.querySelectorAll(selector)
}

function get (selector, scope) {
  return getAll(selector, scope)[0]
}

export { getAll, get }
