'use strict'

class Enum {
  constructor (obj) {
    const keysByValue = new Map()
    const EnumLookup = (value) => keysByValue.get(value)

    for (const key of Object.keys(obj)) {
      EnumLookup[key] = obj[key]
      keysByValue.set(EnumLookup[key], key)
    }

    // Return a function with all your enum properties attached.
    // Calling the function with the value will return the key.
    return Object.freeze(EnumLookup)
  }
}

export default new Enum({
  pluginMainOutlet: '.js-plugin-sections',
  pluginButtonOutlet: '.js-plugin-buttons',
  cardClassName: '.list-card',
  githubLinkClassName: '.known-service-link',
  cardWindow: '.window',
  cardDescription: '.js-desc-content',

  githubIconUrl: 'https://d78fikflryjgj.cloudfront.net/images/services/8cab38550d1f23032facde191031d024/github.png',
  pullRequestProps: [
    'additions',
    'body',
    'changed_files',
    'comments',
    'commits',
    'closed_at',
    'created_at',
    'deletions',
    'diff_url',
    'html_url',
    'mergeable',
    'mergeable_state',
    'merged',
    'merged_at',
    'merged_by',
    'number',
    'repo',
    'title',
    'user'
  ],
  prLinkRegex: /(?:http(?:s)?:\/\/)?(?:github\.com)\/(.+)\/(.+)\/(.+)\/(.+)/,
  boardRegex: /(?:http(?:s)?:\/\/)?(?:trello\.com)\/b\/(.+)\/.*/,
  cardRegex: /(?:http(?:s)?:\/\/)?(?:trello\.com)(\/c\/.+)/
})
