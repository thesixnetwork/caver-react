import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { CaverJsReactProvider } from '../src'

function App() {
  return (
    <CaverJsReactProvider getLibrary={() => {}}>
      <div>test!</div>
    </CaverJsReactProvider>
  )
}

describe('it', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<App />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
})
