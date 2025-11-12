import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/admin/AdminPage";
import ProductManagePage from "./pages/admin/ProductManagePage";
import ProductCreatePage from "./pages/admin/ProductCreatePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderListPage from "./pages/OrderListPage";
import OrderFailurePage from "./pages/OrderFailurePage";
import OrderManagePage from "./pages/admin/OrderManagePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/products" element={<ProductManagePage />} />
      <Route path="/admin/products/new" element={<ProductCreatePage />} />
      <Route path="/admin/orders" element={<OrderManagePage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order/success" element={<OrderSuccessPage />} />
      <Route path="/order/failure" element={<OrderFailurePage />} />
      <Route path="/orders" element={<OrderListPage />} />
    </Routes>
  );
}

export default App;



