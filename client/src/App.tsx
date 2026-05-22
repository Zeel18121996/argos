import { Provider } from 'react-redux'
import { store } from '@/app/store'
import { AppRouter } from '@/router'
import { AuthBootstrapper } from '@/features/auth/AuthBootstrapper'

export default function App() {
  return (
    <Provider store={store}>
      {/* Mounted above the router so /auth/refresh runs regardless of which
          tree the user lands on (customer or admin). */}
      <AuthBootstrapper />
      <AppRouter />
    </Provider>
  )
}
