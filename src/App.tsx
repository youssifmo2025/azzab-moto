import { HelmetProvider } from 'react-helmet-async'
import { AppRouter } from '@/app/router/AppRouter'

export default function App() {
  return (
    <HelmetProvider>
      <AppRouter />
    </HelmetProvider>
  )
}
