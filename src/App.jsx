import { BrowserRouter } from 'react-router-dom';
import { RefreshProvider } from './context/RefreshContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <RefreshProvider>
        <AppRoutes />
      </RefreshProvider>
    </BrowserRouter>
  );
}
