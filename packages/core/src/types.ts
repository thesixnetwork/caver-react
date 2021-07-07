import { AbstractConnector } from 'caverjs-react-abstract-connector'

export interface CaverJsReactManagerFunctions {
  activate: (connector: AbstractConnector, onError?: (error: Error) => void, throwErrors?: boolean) => Promise<void>
  setError: (error: Error) => void
  deactivate: () => void
}

export interface CaverJsReactManagerReturn extends CaverJsReactManagerFunctions {
  connector?: AbstractConnector
  provider?: any
  chainId?: number
  account?: null | string

  error?: Error
}

export interface CaverJsReactContextInterface<T = any> extends CaverJsReactManagerFunctions {
  connector?: AbstractConnector
  library?: T
  chainId?: number
  account?: null | string
  connectorId?: string
  active: boolean
  error?: Error
}
