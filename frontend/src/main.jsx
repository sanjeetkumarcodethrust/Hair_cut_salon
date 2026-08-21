import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import store from './redux/store.js'
import './index.css'
import App from './App.jsx'

import ErrorBoundary from './components/ErrorBoundary.jsx'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster position="bottom-right" />
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)
