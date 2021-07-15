import React, { createContext, useContext, useMemo } from 'react'
import invariant from 'tiny-invariant'

import { CaverJsReactContextInterface } from './types'
import { useCaverJsReactManager } from './manager'

export const PRIMARY_KEY = 'primary'
const CONTEXTS: { [key: string]: React.Context<CaverJsReactContextInterface> } = {}

interface CaverJsReactProviderArguments {
  getLibrary: (provider?: any, connector?: Required<CaverJsReactContextInterface>['connector']) => any
  children: any
}

export function createCaverJsReactRoot(key: string): (args: CaverJsReactProviderArguments) => JSX.Element {
  invariant(!CONTEXTS[key], `A root already exists for provided key ${key}`)

  CONTEXTS[key] = createContext<CaverJsReactContextInterface>({
    activate: async () => {
      invariant(false, 'No <CaverJsReactProvider ... /> found.')
    },
    setError: () => {
      invariant(false, 'No <CaverJsReactProvider ... /> found.')
    },
    deactivate: () => {
      invariant(false, 'No <CaverJsReactProvider ... /> found.')
    },
    active: false
  })
  CONTEXTS[key].displayName = `CaverJsReactContext - ${key}`

  const Provider = CONTEXTS[key].Provider

  return function CaverJsReactProvider({ getLibrary, children }: CaverJsReactProviderArguments): JSX.Element {
    const {
      connector,
      provider,
      chainId,
      account,
      activate,
      setError,
      deactivate,
      error
    } = useCaverJsReactManager()
    
    const active = connector !== undefined && chainId !== undefined && account !== undefined && !!!error
    
    const library = useMemo(
      () =>
        active && chainId !== undefined && Number.isInteger(chainId) && !!connector
          ? getLibrary(provider, connector)
          : undefined,
      [active, getLibrary, provider, connector, chainId]
    )

    const caverJsReactContext: CaverJsReactContextInterface = {
      connector,
      library,
      chainId,
      account,
      activate,
      setError,
      deactivate,
      connectorId: key,
      active,
      error
    }

    return <Provider value={caverJsReactContext}>{children}</Provider>
  }
}

export const CaverJsReactProvider = createCaverJsReactRoot(PRIMARY_KEY)

export function getCaverJsReactContext<T = any>(key: string = PRIMARY_KEY): React.Context<CaverJsReactContextInterface<T>> {

  invariant(Object.keys(CONTEXTS).includes(key), `Invalid key ${key}`)
  return CONTEXTS[key]
}

export function useCaverJsReact<T = any>(key?: string): CaverJsReactContextInterface<T> {

  return useContext(getCaverJsReactContext(key))
}

