import { Navigate, Route, Routes } from 'react-router-dom';
import ApplicationLayout from '../layouts/ApplicationLayout';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import Customers from '../pages/Customers';
import Orders from '../pages/Orders';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<ApplicationLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
