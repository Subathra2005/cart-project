import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminProductList from "./components/AdminProductList";
import Orders from "./components/Orders"; // 👈 make sure you created this file
import Products from "./components/Products";

function App() {
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem("userId") || null;
  });

  const [productList, setProductList] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showLogin, setShowLogin] = useState(true);
  const [role, setRole] = useState("buyer");

  useEffect(() => {
    const findRole = () => {
      if (!userId) return;
      axios
        .get(`http://localhost:5001/api/admin/role`, { params: { userId } })
        .then((response) => {
          setRole(response.data.role);
        })
        .catch((error) => {
          console.error("Error fetching role:", error);
        });
    };
    if (userId) {
      localStorage.setItem("userId", userId);
      findRole();
    } else {
      localStorage.removeItem("userId");
    }
  }, [userId]);

  const handleLogout = () => {
    setUserId(null);
    setProductList([]);
    setTotalAmount(0);
  };

  return (
    <>
      <Navbar userId={userId} role={role} onLogout={handleLogout} />
      <div className="container">
        {!userId ? (
          showLogin ? (
            <Login
              onLogin={setUserId}
              onSwitchToSignup={() => setShowLogin(false)}
            />
          ) : (
            <Signup onSwitchToLogin={() => setShowLogin(true)} />
          )
        ) : role === "buyer" ? (
          <Routes>
            <Route path="/" element={<Navigate to="/products" />} />
            <Route path="/products" element={<Products userId={userId} />} />
            <Route path="/cart" element={<ProductList />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/admin/products" />} />
            <Route path="/admin/products" element={<AdminProductList />} />
            <Route path="/admin/orders" element={<Orders />} />
          </Routes>
        )}
      </div>
    </>
  );
}

export default App;
