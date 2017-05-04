'use strict'

import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'

export default {
  entry: 'chrome/main.js',
  format: 'es',
  plugins: [
    babel(),
    nodeResolve({ jsnext: true, browser: true }),
    uglify()
  ],
  dest: 'chrome/bundle.js'
}
