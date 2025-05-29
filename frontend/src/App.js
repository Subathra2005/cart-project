import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Navbar from './components/Navbar';
import AddItem from './AddItem';
import ProductList from './components/ProductList';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  // Initialize from localStorage (only once)
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('userId') || null;
  });

  const [productList, setProductList] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showLogin, setShowLogin] = useState(true);

  // Sync userId changes to localStorage
  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
  }, [userId]);

  // Fetch products from backend on userId change
  useEffect(() => {
    if (!userId) return;

    axios.get(`http://localhost:5001/api/cart?userId=${userId}`)
      .then(response => {
        setProductList(response.data);
        const total = response.data.reduce(
          (acc, product) => acc + product.price * product.quantity,
          0
        );
        setTotalAmount(total);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, [userId]);

  // Add new product (POST)
  const addItem = (name, price) => {
    if (!userId) return; // extra guard

    axios.post('http://localhost:5001/api/cart', {
      name,
      price,
      quantity: 0,
      userId
    })
      .then(response => {
        setProductList(prevList => [...prevList, response.data]);
      })
      .catch(error => {
        console.error('Error adding product:', error);
      });
  };

  // Increment quantity (PUT)
  const incrementQuantity = (index) => {
    if (!userId) return;

    const productToUpdate = { ...productList[index] };
    productToUpdate.quantity++;

    const updatedProductList = [...productList];
    updatedProductList[index] = productToUpdate;

    setProductList(updatedProductList);
    setTotalAmount(prevTotal => prevTotal + Number(productToUpdate.price));

    axios.put(`http://localhost:5001/api/cart/${productToUpdate.id}`, {
      name: productToUpdate.name,
      price: productToUpdate.price,
      quantity: productToUpdate.quantity,
      userId
    }).catch(error => {
      console.error('Error updating product:', error);
    });
  };

  // Decrement quantity (PUT)
  const decrementQuantity = (index) => {
    if (!userId) return;

    const productToUpdate = { ...productList[index] };
    if (productToUpdate.quantity > 0) {
      productToUpdate.quantity--;

      const updatedProductList = [...productList];
      updatedProductList[index] = productToUpdate;

      setProductList(updatedProductList);
      setTotalAmount(prevTotal => prevTotal - Number(productToUpdate.price));

      axios.put(`http://localhost:5001/api/cart/${productToUpdate.id}`, {
        name: productToUpdate.name,
        price: productToUpdate.price,
        quantity: productToUpdate.quantity,
        userId
      }).catch(error => {
        console.error('Error updating product:', error);
      });
    }
  };

  // Remove item (DELETE)
  const removeItem = (index) => {
    if (!userId) return;

    let newProductList = [...productList];
    const removedProduct = newProductList[index];
    const deduction = removedProduct.quantity * removedProduct.price;

    axios.delete(`http://localhost:5001/api/cart/${removedProduct.id}`, {
      data: { userId }
    })
      .then(() => {
        newProductList.splice(index, 1);
        setProductList(newProductList);

        let newTotalAmount = totalAmount - deduction;
        if (newTotalAmount < 0) newTotalAmount = 0;
        setTotalAmount(newTotalAmount);
      })
      .catch(error => {
        console.error('Error deleting product:', error);
      });
  };

  // Reset quantity for all products (PUT all to zero)
  const resetQuantity = () => {
    if (!userId) return;

    const resetProducts = productList.map(product => ({
      ...product,
      quantity: 0
    }));

    Promise.all(
      resetProducts.map(product =>
        axios.put(`http://localhost:5001/api/cart/${product.id}`, {
          name: product.name,
          price: product.price,
          quantity: 0,
          userId
        })
      )
    )
      .then(() => {
        setProductList(resetProducts);
        setTotalAmount(0);
      })
      .catch(error => {
        console.error('Error resetting quantities:', error);
      });
  };

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
        ) : (
          <>
            <AddItem addItem={addItem} />
            <ProductList
              productList={productList}
              incrementQuantity={incrementQuantity}
              decrementQuantity={decrementQuantity}
              removeItem={removeItem}
            />
          </>
        )}
      </div>
      {userId && <Footer totalAmount={totalAmount} resetQuantity={resetQuantity} />}
    </>
  );
}

export default App;
