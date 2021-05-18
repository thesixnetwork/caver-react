import { useState, useEffect } from 'react'
import { useCaverJsReact } from 'caverjs-react-core'

import { injected } from './connectors'

export function useEagerConnect() {
  const { activate, active } = useCaverJsReact()

  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        setTried(true)
      }
    })
  }, []) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true)
    }
  }, [tried, active])

  return tried
}

export function useInactiveListener(suppress: boolean = false) {
  const { active, error, activate } = useCaverJsReact()

  useEffect((): any => {
    const { klaytn } = window as any
    if (klaytn && klaytn.on && !active && !error && !suppress) {
      const handleConnect = () => {
        console.log("Handling 'connect' event")
        activate(injected)
      }
      const handleChainChanged = (chainId: string | number) => {
        console.log("Handling 'chainChanged' event with payload", chainId)
        activate(injected)
      }
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("Handling 'accountsChanged' event with payload", accounts)
        if (accounts.length > 0) {
          activate(injected)
        }
      }
      const handleNetworkChanged = (networkId: string | number) => {
        console.log("Handling 'networkChanged' event with payload", networkId)
        activate(injected)
      }

      klaytn.on('connect', handleConnect)
      klaytn.on('chainChanged', handleChainChanged)
      klaytn.on('accountsChanged', handleAccountsChanged)
      klaytn.on('networkChanged', handleNetworkChanged)

      return () => {
        if (klaytn.removeListener) {
          klaytn.removeListener('connect', handleConnect)
          klaytn.removeListener('chainChanged', handleChainChanged)
          klaytn.removeListener('accountsChanged', handleAccountsChanged)
          klaytn.removeListener('networkChanged', handleNetworkChanged)
        }
      }
    }
  }, [active, error, suppress, activate])
}
