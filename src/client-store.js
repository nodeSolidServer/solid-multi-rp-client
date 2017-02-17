const OIDCRelyingParty = require('oidc-rp')
const KVPFileStore = require('kvplus-files')
const COLLECTION_NAME = 'clients'

module.exports = class OIDCClientStore {
  /**
   * @constructor
   *
   * @param [options={}] {Object}
   *
   * @param [options.collectionName='clients'] {string}
   *
   * @param [options.backend] {KVPFileStore} Either pass in a backend store
   * @param [options.path] {string} Or initialize the store from path.
   */
  constructor (options = {}) {
    this.collectionName = options.collectionName || COLLECTION_NAME

    this.backend = options.backend ||
      new KVPFileStore({
        path: options.path,
        collections: [ this.collectionName ]
      })

    this.backend.serialize = (client) => { return client.serialize() }
    this.backend.deserialize = (data) => { return JSON.parse(data) }
  }

  del (client) {
    if (!this.backend) {
      return Promise.reject(new Error('Client store not configured'))
    }
    if (!client) {
      return Promise.reject(new Error('Cannot delete null client'))
    }
    let issuer = encodeURIComponent(client.provider.url)
    return this.backend.del(this.collectionName, issuer)
  }

  put (client) {
    if (!this.backend) {
      return Promise.reject(new Error('Client store not configured'))
    }
    if (!client) {
      return Promise.reject(new Error('Cannot store null client'))
    }
    let issuer = encodeURIComponent(client.provider.url)
    console.log('PATH:', this.backend.path)
    return this.backend.put(this.collectionName, issuer, client)
      .then(() => {
        return client
      })
  }

  get (issuer) {
    if (!this.backend) {
      return Promise.reject(new Error('Client store not configured'))
    }
    issuer = encodeURIComponent(issuer)
    return this.backend.get(this.collectionName, issuer)
      .then(result => {
        if (result) {
          return OIDCRelyingParty.from(result)
        }
        return result
      })
  }
}
