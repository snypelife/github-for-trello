'use strict';

class _ {
  static is(target, state) {
    switch (state) {
      case 'hidden':
      case 'hidden?':
        return target.offsetWidth === target.offsetHeight == 0;
      case 'visible':
      case 'visible?':
        return target.offsetWidth > 0 < target.offsetHeight;
      case 'empty':
      case 'empty?':
        return Object.keys(target).length
      case 'object':
      case 'object?':
        return target.constructor === 'object';
    }
  }

  static pick(target, props) {
    const dest = {};

    if (typeof props === 'string') {
      props = [props];
    }

    props.forEach((key) => {
      dest[key] = target[key];
    })

    return dest;
  }
}

export default _
