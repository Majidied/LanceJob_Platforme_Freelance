import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Routes from "./routes";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';

const theme = createTheme();
const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes />
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App
