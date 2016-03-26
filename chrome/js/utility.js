'use strict';

function is(target, state) {
  switch (state.replace(/\?/g, '')) {
    case 'hidden':
      return target.offsetWidth === target.offsetHeight == 0;
    case 'visible':
      return target.offsetWidth > 0 < target.offsetHeight;
    case 'empty':
      return Object.keys(target).length
    case 'object':
      return /object/i.test(target.constructor.name);
    case 'string':
      return /string/i.test(target.constructor.name);
    case 'array':
      return Array.isArray(target);
    case 'function':
      return /function/i.test(target.constructor.name);
  }
}

function pick(target, props) {
  const dest = {};

  if (is(props, 'string?')) {
    props = [props];
  }

  props.forEach((key) => {
    dest[key] = target[key];
  })

  return dest;
}

function filter(target, iterator) {
  if (!is(target, 'array?') || !is(iterator, 'function?')) { return []; }
  return target.filter(iterator);
}

function startsWith(target, substring) {
  return target.indexOf(substring) === 0;
}

export { is, pick, filter, startsWith }
