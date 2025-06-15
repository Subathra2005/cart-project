import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Updated Product component with button next to price
const Product = ({ product, onAddToCart }) => (
  <div className="col-md-4 mb-4">
    <div className="card text-center" style={{ width: '18rem', margin: '0 auto' }}>
      <div className="card-body">
        <h5 className="card-title"><span className="notranslate">{product.name}</span></h5>
        <p className="card-text">Price: ${product.price}</p>
        <button
          onClick={() => onAddToCart(product)}
          className="btn btn-primary"
        >
          Add to cart
        </button>
      </div>
    </div>
  </div>
);

// Add product to cart via API
const addProductToCart = (product, userId) => {
  return axios.post('http://localhost:5001/api/cart', {
    name: product.name,
    price: product.price,
    userId,
    quantity: 0,
    productId: product.id,
  });
};

// Main Products component
const Products = ({ userId }) => {
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:5001/api/admin')
      .then((response) => {
        setProductList(response.data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, [userId]);

  const handleAddToCart = (product) => {
    addProductToCart(product, userId)
      .then(() => alert("Added to cart"))
      .catch((err) => alert("Failed to add to cart"));
  };

  return (
    <div className="container mt-4">
  <h1 className="mb-4">Products</h1>

  {productList.length > 0 ? (
    <div className="row">
      {productList.map((product) => (
        <Product
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  ) : (
    <h2>No products available</h2>
  )}
</div>

  );
};

export default Products;
