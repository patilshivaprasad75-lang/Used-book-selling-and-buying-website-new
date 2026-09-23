import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";
import { useToast } from "./context/ToastContext";
import { ProtectedRoute, BuyerRoute, SellerRoute, AdminRoute, GuestRoute } from "./components/RouteGuards";

import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SellBook from "./pages/SellBook";
import TrackOrder from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";

import BuyerLayout from "./pages/buyer/BuyerLayout";
import BuyerOverview from "./pages/buyer/BuyerOverview";
import BuyerOrders from "./pages/buyer/BuyerOrders";
import BuyerWishlist from "./pages/buyer/BuyerWishlist";
import ProfileSettings from "./pages/shared/ProfileSettings";

import SellerLayout from "./pages/seller/SellerLayout";
import SellerOverview from "./pages/seller/SellerOverview";
import SellerListings from "./pages/seller/SellerListings";
import SellerOrders from "./pages/seller/SellerOrders";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminManageBooks from "./pages/admin/AdminManageBooks";
import AdminManageUsers from "./pages/admin/AdminManageUsers";
import AdminViewOrders from "./pages/admin/AdminViewOrders";
import AdminViewRevenue from "./pages/admin/AdminViewRevenue";
import AdminAddBook from "./pages/admin/AdminAddBook";

export default function App() {
  const toast = useToast();

  useEffect(() => {
    const onSlow = () =>
      toast.info("Waking up the server… the first request can take up to a minute on the free hosting tier.");
    window.addEventListener("api:slow", onSlow);
    return () => window.removeEventListener("api:slow", onSlow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sell-book" element={<SellBook />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/cart" element={<Cart />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
          </Route>

          <Route element={<BuyerRoute />}>
            <Route path="/dashboard" element={<BuyerLayout />}>
              <Route index element={<BuyerOverview />} />
              <Route path="orders" element={<BuyerOrders />} />
              <Route path="wishlist" element={<BuyerWishlist />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>
          </Route>

          <Route element={<SellerRoute />}>
            <Route path="/seller" element={<SellerLayout />}>
              <Route index element={<SellerOverview />} />
              <Route path="listings" element={<SellerListings />} />
              <Route path="orders" element={<SellerOrders />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="books" element={<AdminManageBooks />} />
              <Route path="users" element={<AdminManageUsers />} />
              <Route path="orders" element={<AdminViewOrders />} />
              <Route path="revenue" element={<AdminViewRevenue />} />
              <Route path="add-book" element={<AdminAddBook />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ChatBot />
    </>
  );
}
