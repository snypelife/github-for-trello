'use strict'

export function isHidden (target) {
  return target.offsetWidth === target.offsetHeight === 0
}

export function isVisible (target) {
  return target.offsetWidth > 0 < target.offsetHeight
}
