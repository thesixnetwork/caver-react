module.exports = {
  env: {
    RPC_URL_8217: 'https://kaikas.cypress.klaytn.net:8651/',
    RPC_URL_1001: 'https://kaikas.baobab.klaytn.net:8651/',
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.node = {
      fs: 'empty'
    }
    return config
  },
}
