'use strict'

import { keys, forEach } from 'lodash-es'
import { get } from './selector-engine.js'

let events = {}

function _generateGuid () {
  // returns 00000000-0000-0000-0000-000000000000
  const guid = []
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint32Array(32)
  window.crypto.getRandomValues(array)

  forEach(array, (val, i) => {
    let char = charset[val % charset.length]
    if (i === 7 || i === 11 || i === 15) {
      char += '-'
    }
    guid.push(char)
  })

  return guid.join('')
}

function on (event, element, scope, cb) {
  if (element.getAttribute('data-guid')) {
    console.trace(`Element ${element.getAttribute('data-guid')} already has listener attached, ignoring..`)
    return
  }

  const guid = _generateGuid()
  const proxy = (evt) => {
    if (typeof scope === 'function') {
      cb = scope
      return cb(evt)
    }
    if (get(scope, evt.target.parentNode)) {
      return cb(evt)
    }
  }
  element.setAttribute('data-guid', guid)
  element.addEventListener(event, proxy, false)
  events[guid] = {
    handler: proxy,
    element
  }
}
function off (event, element) {
  if (element) {
    const proxy = events[element.getAttribute('guid')]
    element.removeEventListener(event, proxy, false)
    delete events[element.getAttribute('data-guid')]
    element.removeAttribute('data-guid')
  } else {
    forEach(keys(events), (key) => {
      const element = events[key].element
      const proxy = events[key].handler
      element.removeEventListener(event, proxy, false)
      delete events[key]
    })
  }
}

function observe (element, options, cb) {
  if (typeof options === 'function') {
    cb = options
    options = {
      attributes: true,
      attributeOldValue: true
    }
  }

  return new MutationObserver(cb).observe(element, options)
}

export { _generateGuid, on, off, observe }
