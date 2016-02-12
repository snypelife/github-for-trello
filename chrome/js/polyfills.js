'use strict';

if (!Array.toArray) {
  Array.toArray = function toArray(arrayLikeObject) {
    return [].slice.call(arrayLikeObject);
  };
}

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

if (!Object.extend) {
  Object.extend = function (destination, source) {
    for (var property in source) {
      if (source.hasOwnProperty(property)) {
        if (source[property] === null || source[property] === undefined) {
          destination[property] = destination[property];
        } else if (source[property].constructor &&
         source[property].constructor === Object) {
          destination[property] = Object.extend(Object.assign({},destination[property]), source[property]);
        } else {
          destination[property] = source[property];
        }
      }
    }
    return destination;
  };
}
