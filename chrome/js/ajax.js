'use strict'

class Ajax {
  constructor (xhr) {
    this.xhr = xhr
  }
  static get (url) {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    return new Ajax(xhr)
  }
  static post (url) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    return new Ajax(xhr)
  }
  auth (user, pass) {
    const auth = btoa(`${user}:${pass}`)
    this.xhr.setRequestHeader('Authorization', `Basic ${auth}`)
    return this
  }
  send (payload) {
    this.payload = JSON.stringify(payload)
    return this
  }
  end (cb) {
    this.xhr.responseType = 'json'
    this.xhr.onreadystatechange = () => {
      if (this.xhr.readyState === XMLHttpRequest.DONE) {
        if (this.xhr.status >= 200 && this.xhr.status <= 299) {
          cb(null, this.xhr.response)
        } else {
          cb(new Error(this.xhr.statusText))
        }
      }
    }
    this.xhr.send(this.payload)
  }
}

export default Ajax
