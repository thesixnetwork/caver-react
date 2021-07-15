import { AbstractConnectorArguments, ConnectorUpdate } from '@kanthakarn-test/caverjs-react-types'
import { AbstractConnector } from '@kanthakarn-test/caverjs-react-abstract-connector'
// import warning from 'tiny-warning'
const Caver = require("caver-js")
import KlipProvider from "./KlipProvider"


export interface KlipArguments extends AbstractConnectorArguments {
  supportedChainIds?: number[]
  showModal: () => void
  closeModal: () => void
}


export class NoKlaytnProviderError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'No Klaytn provider was found on window.klaytn.'
  }
}

export class UserRejectedRequestError extends Error {
  public constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

export class KlipConnector extends AbstractConnector {
  public KlipConnectorProvider?: any
  constructor(kwargs: KlipArguments) {
    super(kwargs)
    this.showModal = kwargs.showModal
    this.closeModal = kwargs.closeModal
    this.handleNetworkChanged = this.handleNetworkChanged.bind(this)
    this.handleChainChanged = this.handleChainChanged.bind(this)
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
    this.handleClose = this.handleClose.bind(this)
    // const httpProvider = new Caver.providers.HttpProvider("https://kaikas.cypress.klaytn.net:8651/")
    this.providerCaver = (new Caver("https://kaikas.cypress.klaytn.net:8651/")).currentProvider
  }
  private providerCaver?:any 
  private showModal: () => void
  private closeModal: () => void
  private handleChainChanged(chainId: string | number): void {
    if (__DEV__) {
      console.log("Handling 'chainChanged' event with payload", chainId)
    }
    this.emitUpdate({ chainId, provider: this.providerCaver })
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (__DEV__) {
      console.log("Handling 'accountsChanged' event with payload", accounts)
    }
    if (accounts.length === 0) {
      this.emitDeactivate()
    } else {
      this.emitUpdate({ account: accounts[0] })
    }
  }

  private handleClose(code: number, reason: string): void {
    if (__DEV__) {
      console.log("Handling 'close' event with payload", code, reason)
    }
    this.emitDeactivate()
  }

  private handleNetworkChanged(networkId: string | number): void {
    if (__DEV__) {
      console.log("Handling 'networkChanged' event with payload", networkId)
    }
    this.emitUpdate({ chainId: networkId, provider: this.providerCaver })
  }

  public async activate(): Promise<ConnectorUpdate> {
    // if (window.klaytn.on) {
    //   window.klaytn.on('chainChanged', this.handleChainChanged)
    //   window.klaytn.on('accountsChanged', this.handleAccountsChanged)
    //   window.klaytn.on('close', this.handleClose)
    //   window.klaytn.on('networkChanged', this.handleNetworkChanged)
    // }
    
    this.KlipConnectorProvider = new KlipProvider()

    let account
 
    if (!account) {
      this.showModal()
      this.KlipConnectorProvider.genQRcode()
      account = await this.KlipConnectorProvider.checkResponse()
 

      this.closeModal()
      this.KlipConnectorProvider.login()
    }
 
    return { provider: this.providerCaver, ...(account ? { account } : {}) }
  }

  public async getProvider(): Promise<any> {
    return this.providerCaver
  }

  public async getChainId(): Promise<number | string> {

    return 8217
  }

  public async getAccount(): Promise<null | string> {

    return this.KlipConnectorProvider.getAccount()
  }

  public deactivate() {
    this.KlipConnectorProvider.logout()
  }

  public async isAuthorized(): Promise<boolean> {
    return this.KlipConnectorProvider.getAuth()
    //   if (!window.klaytn) {
    //     return false
    //   }

    //   try {
    //     return await (window.klaytn.send as Send)('klay_accounts').then(sendReturn => {
    //       if (parseSendReturn(sendReturn).length > 0) {
    //         return true
    //       } else {
    //         return false
    //       }
    //     })
    //   } catch {
    //     return false
    //   }
  }
}
