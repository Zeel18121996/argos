import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import PublicRoutes from '@/routes/PublicRoutes'

const App: React.FC = () => (
  <Provider store={store}>
    <BrowserRouter>
      <PublicRoutes />
    </BrowserRouter>
  </Provider>
)

export default App
