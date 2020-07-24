'use strict'

const test = require('tape')
const KVPFileStore = require('kvplus-files')

const ClientStore = require('../../src/client-store')
const OIDCRelyingParty = require('@solid/oidc-rp')

const storeBasePath = './test/store/'
const storeOptions = { path: storeBasePath }

test('setup', t => {
  const store = new ClientStore(storeOptions)
  store.backend.createCollection('clients')
    .then(() => {
      t.end()
    })
})

test('client store test', t => {
  const issuer = 'https://oidc.example.com'
  const store = new ClientStore(storeOptions)
  const client = new OIDCRelyingParty({ provider: { url: issuer } })
  return store.put(client)
    .then((storedClient) => {
      t.equal(storedClient, client,
        'store.put() should return the stored client')
      return store.del(client)
    })
    .then(() => {
      t.end()
    })
    .catch(err => {
      console.log(err)
      t.fail(err)
    })
})
