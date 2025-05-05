import ProfileSetup from "./pages/Profile.page"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <ProfileSetup/>
    </QueryClientProvider>
  )
}

export default App
