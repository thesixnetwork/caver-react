import { InjectedConnector } from 'caverjs-react-injected-connector'
import { NetworkConnector } from 'caverjs-react-network-connector'

const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
  8217: process.env.RPC_URL_8217 as string,
  1001: process.env.RPC_URL_1001 as string
}

export const injected = new InjectedConnector({ supportedChainIds: [8217, 1001] })

export const network = new NetworkConnector({
  urls: { 8217: RPC_URLS[8217], 1001: RPC_URLS[1001] },
  defaultChainId: 1001
})

// export const walletconnect = new WalletConnectConnector({
//   rpc: { 97: RPC_URLS[97], 56: RPC_URLS[56] },
//   qrcode: true,
//   pollingInterval: POLLING_INTERVAL
// })

// export const walletlink = new WalletLinkConnector({
//   url: RPC_URLS[97],
//   appName: 'web3-react example'
// })

// export const ledger = new LedgerConnector({ chainId: 97, url: RPC_URLS[97], pollingInterval: POLLING_INTERVAL })

// export const trezor = new TrezorConnector({
//   chainId: 97,
//   url: RPC_URLS[97],
//   pollingInterval: POLLING_INTERVAL,
//   manifestEmail: 'dummy@abc.xyz',
//   manifestAppUrl: 'http://localhost:1234'
// })

// export const lattice = new LatticeConnector({
//   chainId: 97,
//   appName: 'web3-react',
//   url: RPC_URLS[97]
// })

// export const frame = new FrameConnector({ supportedChainIds: [97] })

// export const authereum = new AuthereumConnector({ chainId: 97 })

// export const fortmatic = new FortmaticConnector({ apiKey: process.env.FORTMATIC_API_KEY as string, chainId: 97 })

// export const magic = new MagicConnector({
//   apiKey: process.env.MAGIC_API_KEY as string,
//   chainId: 97,
//   email: 'hello@example.org'
// })

// export const portis = new PortisConnector({ dAppId: process.env.PORTIS_DAPP_ID as string, networks: [97, 56] })

// export const torus = new TorusConnector({ chainId: 97 })
