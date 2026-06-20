import { BrowserRouter } from 'react-router-dom';
import AppToaster from './components/ui/AppToaster';
import { RefreshProvider } from './context/RefreshContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <RefreshProvider>
        <AppRoutes />
        <AppToaster />
      </RefreshProvider>
    </BrowserRouter>
  );
}
