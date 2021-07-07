import { AbstractConnectorArguments, ConnectorUpdate } from 'caverjs-react-types'
import { AbstractConnector } from 'caverjs-react-abstract-connector'
// import warning from 'tiny-warning'
import * as klipProvider from "./klipProvider"

import { SendReturnResult, SendReturn, Send } from './types'

export interface KlipArguments extends AbstractConnectorArguments {
  supportedChainIds?: number[]
  showModal: () => void
  closeModal: () => void
}

function parseSendReturn(sendReturn: SendReturnResult | SendReturn): any {
  return sendReturn.hasOwnProperty('result') ? sendReturn.result : sendReturn
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
  }
  private showModal: () => void
  private closeModal: () => void
  private handleChainChanged(chainId: string | number): void {
    if (__DEV__) {
      console.log("Handling 'chainChanged' event with payload", chainId)
    }
    this.emitUpdate({ chainId, provider: window.klaytn })
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (__DEV__) {
      console.log("Handling 'accountsChanged' event with payload", accounts)
    }
    if (accounts.length === 0) {
      this.emitDeactivate()
    } else {
      this.emitUpdate({ account: accounts[0]})
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
    this.emitUpdate({ chainId: networkId, provider: window.klaytn })
  }

  public async activate(): Promise<ConnectorUpdate> {
   

    // if (window.klaytn.on) {
    //   window.klaytn.on('chainChanged', this.handleChainChanged)
    //   window.klaytn.on('accountsChanged', this.handleAccountsChanged)
    //   window.klaytn.on('close', this.handleClose)
    //   window.klaytn.on('networkChanged', this.handleNetworkChanged)
    // }
    let account
    // console.log("test")
    console.log("klip activate 1")

    if (!account) {
      this.showModal()
      klipProvider.genQRcode()
      account = await klipProvider.checkResponse()
      // await (window.klaytn.send as Send)('klay_accounts').then(sendReturn => parseSendReturn(sendReturn)[0])
      
      this.closeModal()
      
    }
    console.log("account klip : ", account)
    // await window.klaytn.enable().then(sendReturn => sendReturn && parseSendReturn(sendReturn)[0])
    
    
    return { provider:window.klaytn, ...(account ? { account } : {})}
  }

  public async getProvider(): Promise<any> {
    return window.klaytn
  }

  public async getChainId(): Promise<number | string> {

    return 8217
  }

  public async getAccount(): Promise<null | string> {

    return klipProvider.getAccount()
  }
  
  public deactivate() {
    if (window.klaytn && window.klaytn.removeListener) {
      window.klaytn.removeListener('chainChanged', this.handleChainChanged)
      window.klaytn.removeListener('accountsChanged', this.handleAccountsChanged)
      window.klaytn.removeListener('close', this.handleClose)
      window.klaytn.removeListener('networkChanged', this.handleNetworkChanged)
    }
  }

  public async isAuthorized(): Promise<boolean> {
    if (!window.klaytn) {
      return false
    }

    try {
      return await (window.klaytn.send as Send)('klay_accounts').then(sendReturn => {
        if (parseSendReturn(sendReturn).length > 0) {
          return true
        } else {
          return false
        }
      })
    } catch {
      return false
    }
  }
}
