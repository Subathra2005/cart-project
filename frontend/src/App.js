import React, { useState, useEffect } from "react";
import axios from "axios";

import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminProductList from "./components/AdminProductList";
import Products from "./components/Products"; // Import Products component

function App() {
  // Initialize from localStorage (only once)
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem("userId") || null;
  });

  const [productList, setProductList] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showLogin, setShowLogin] = useState(true);

  // Sync userId changes to localStorage

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
  const [role, setRole] = useState("buyer");

  // Logout: clear userId from state and localStorage
  const handleLogout = () => {
    setUserId(null);
    setProductList([]);
    setTotalAmount(0);
    // localStorage is cleared automatically by useEffect on userId change
  };

  return (
    <>
      <Navbar userId={userId} onLogout={handleLogout} />
      <div className="container">
        {!userId ? (
          showLogin ? (
            <Login onLogin={setUserId} onSwitchToSignup={() => setShowLogin(false)} />
          ) : (
            <Signup onSwitchToLogin={() => setShowLogin(true)} />
          )
        ) : role==='buyer'?(
          <>
            <ProductList/>
            <Products userId={userId} />
            
          
          </>
        ) : (
          <>
          <AdminProductList/>
          </>
        )}
      </div>
    </>
  );
}

export default App;
