import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Routes from "./routes";

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <Routes />
    </QueryClientProvider>
  )
}

export default App
