import { AbstractConnectorArguments, ConnectorUpdate } from 'caverjs-react-types'
import { AbstractConnector } from 'caverjs-react-abstract-connector'
import warning from 'tiny-warning'
import * as klipProvider from "./klipProvider" 

import { SendReturnResult, SendReturn, Send, SendOld } from './types'

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
  constructor(kwargs: AbstractConnectorArguments) {
    super(kwargs)

    this.handleNetworkChanged = this.handleNetworkChanged.bind(this)
    this.handleChainChanged = this.handleChainChanged.bind(this)
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

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
    this.emitUpdate({ chainId: networkId, provider: window.klaytn })
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!window.klaytn) {
      throw new NoKlaytnProviderError()
    }

    if (window.klaytn.on) {
      window.klaytn.on('chainChanged', this.handleChainChanged)
      window.klaytn.on('accountsChanged', this.handleAccountsChanged)
      window.klaytn.on('close', this.handleClose)
      window.klaytn.on('networkChanged', this.handleNetworkChanged)
    }

    // if ((window.klaytn as any).isMetaMask) {
    //   ;(window.klaytn as any).autoRefreshOnNetworkChange = false
    // }

    // try to activate + get account via klay_requestAccounts
    let account
    // try {
    //   account = await (window.klaytn.send as Send)('klay_requestAccounts').then(
    //     sendReturn => parseSendReturn(sendReturn)[0]
    //   )
    // } catch (error) {
    //   if ((error as any).code === 4001) {
    //     throw new UserRejectedRequestError()
    //   }
    //   warning(false, 'klay_requestAccounts was unsuccessful, falling back to enable')
    // }

    // if unsuccessful, try enable
    
    // if (!account) {
    //   // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
    //   // account = await window.klaytn.enable().then(sendReturn => sendReturn && parseSendReturn(sendReturn)[0])
    //   klipProvider.genQRcode()
    //   account = await klipProvider.checkResponse()
    // }
    console.log("test")
    klipProvider.genQRcode()
      account = await klipProvider.checkResponse()

    return { provider: window.klaytn, ...(account ? { account } : {}) }
  }

  public async getProvider(): Promise<any> {
    return window.klaytn
  }

  public async getChainId(): Promise<number | string> {
    if (!window.klaytn) {
      throw new NoKlaytnProviderError()
    }

    let chainId
    try {
      chainId = await (window.klaytn.send as Send)('klay_chainId').then(parseSendReturn)
    } catch {
      warning(false, 'klay_chainId was unsuccessful, falling back to net_version')
    }

    if (!chainId) {
      try {
        chainId = await (window.klaytn.send as Send)('net_version').then(parseSendReturn)
      } catch {
        warning(false, 'net_version was unsuccessful, falling back to net version v2')
      }
    }

    if (!chainId) {
      try {
        chainId = parseSendReturn((window.klaytn.send as SendOld)({ method: 'net_version' }))
      } catch {
        warning(false, 'net_version v2 was unsuccessful, falling back to manual matches and static properties')
      }
    }

    if (!chainId) {
      if ((window.klaytn as any).isDapper) {
        chainId = parseSendReturn((window.klaytn as any).cachedResults.net_version)
      } else {
        chainId =
          (window.klaytn as any).chainId ||
          (window.klaytn as any).netVersion ||
          (window.klaytn as any).networkVersion ||
          (window.klaytn as any)._chainId
      }
    }

    return chainId
  }

  public async getAccount(): Promise<null | string> {
    if (!window.klaytn) {
      throw new NoKlaytnProviderError()
    }

    let account
    try {
      account = await (window.klaytn.send as Send)('klay_accounts').then(sendReturn => parseSendReturn(sendReturn)[0])
    } catch {
      warning(false, 'klay_accounts was unsuccessful, falling back to enable')
    }

    if (!account) {
      try {
        account = await window.klaytn.enable().then(sendReturn => parseSendReturn(sendReturn)[0])
      } catch {
        warning(false, 'enable was unsuccessful, falling back to klay_accounts v2')
      }
    }

    if (!account) {
      account = parseSendReturn((window.klaytn.send as SendOld)({ method: 'klay_accounts' }))[0]
    }

    return account
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
