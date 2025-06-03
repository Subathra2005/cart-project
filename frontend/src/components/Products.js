import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Product = ({ product }) => (
  <div className="row mt-3">
    <div className="col-5">
      <h2>
        {product.name}
        <span className="badge text-bg-secondary ms-3">
          $ {product.price}
        </span>
      </h2>
    </div>
  </div>
);


const addProductToCart = (product, userId) => {
  return axios.post('http://localhost:5001/api/cart', {
    name: product.name,
    price: product.price,
    userId,
    quantity: 0,
    productId: product.id,
  });
};

const Products = ({ userId }) => {
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:5001/api/admin') // Update if needed
      .then((response) => {
        setProductList(response.data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, [userId]);

  return (
    <div>
      <h1>Products</h1>
      <br />
      {productList.length > 0 ? (
        productList.map((product) => (
          <div key={product.id} >
          <Product product={product} />
          <button
            onClick={() => addProductToCart(product, userId)}
            className="btn btn-primary ms-3" > Add product to cart</button>
          </div>
        ))
      ) : (
        <h2>No products available</h2>
      )}
    </div>
  );
};

export default Products;
