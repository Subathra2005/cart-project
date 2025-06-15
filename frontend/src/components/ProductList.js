import React, { useEffect, useState } from "react";
import axios from "axios";
import Footer from "./Footer"; 

export default function ProductList() {
  const [productList, setProductList] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const userId = localStorage.getItem("userId"); // Or however you're storing it

  // Fetch products when component mounts
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:5001/api/cart?userId=${userId}`)
      .then((response) => {
        setProductList(response.data);
        const total = response.data.reduce(
          (acc, product) => acc + product.price * product.quantity,
          0
        );
        setTotalAmount(total);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, [userId]);
  
  const getQuantity = async (productId) => {
  try {
    const response = await axios.get(`http://localhost:5001/api/admin/${productId}`);
    return response.data.quantity;
  } catch (error) {
    console.error('Error fetching product quantity:', error);
    return 0;
  }
};
const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/cart/email`, {
          params: { userId },
        });
        setUserEmail(response.data.email); 
      } catch (err) {
        console.error('Failed to fetch user email:', err);
      }
    };

    if (userId) fetchUserEmail();
  }, [userId]);


  const incrementQuantity = async (index) => {
  if (!userId) return;

  const productToUpdate = { ...productList[index] };

  const maxQuantity = await getQuantity(productToUpdate.product_id);

  if (productToUpdate.quantity < maxQuantity) {
    productToUpdate.quantity++;

    const updatedProductList = [...productList];
    updatedProductList[index] = productToUpdate;

    setProductList(updatedProductList);
    setTotalAmount((prevTotal) => prevTotal + Number(productToUpdate.price));

    axios
      .put(`http://localhost:5001/api/cart/${productToUpdate.id}`, {
        name: productToUpdate.name,
        price: productToUpdate.price,
        quantity: productToUpdate.quantity,
        userId,
        productId: productToUpdate.product_id,
      })
      .catch((error) => {
        console.error("Error updating product:", error);
      });
  } else {
    alert("Cannot exceed available quantity in stock.");
  }
};

  const decrementQuantity = (index) => {
    if (!userId) return;

    const productToUpdate = { ...productList[index] };
    if (productToUpdate.quantity > 0) {
      productToUpdate.quantity--;

      const updatedProductList = [...productList];
      updatedProductList[index] = productToUpdate;

      setProductList(updatedProductList);
      setTotalAmount((prevTotal) => prevTotal - Number(productToUpdate.price));

      axios
        .put(`http://localhost:5001/api/cart/${productToUpdate.id}`, {
          name: productToUpdate.name,
          price: productToUpdate.price,
          quantity: productToUpdate.quantity,
          userId,
          productId: productToUpdate.product_id,
        })
        .catch((error) => {
          console.error("Error updating product:", error);
        });
    }
  };

  const removeItem = (index) => {
    if (!userId) return;

    let newProductList = [...productList];
    const removedProduct = newProductList[index];
    const deduction = removedProduct.quantity * removedProduct.price;

    axios
      .delete(`http://localhost:5001/api/cart/${removedProduct.id}`, {
        data: { userId },
      })
      .then(() => {
        newProductList.splice(index, 1);
        setProductList(newProductList);

        let newTotalAmount = totalAmount - deduction;
        if (newTotalAmount < 0) newTotalAmount = 0;
        setTotalAmount(newTotalAmount);
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
      });
  };

  const resetQuantity = () => {
    if (!userId) return;

    const resetProducts = productList.map((product) => ({
      ...product,
      quantity: 0,
    }));

    Promise.all(
      resetProducts.map((product) =>
        axios.put(`http://localhost:5001/api/cart/${product.id}`, {
          name: product.name,
          price: product.price,
          quantity: 0,
          userId,
          productId: product.product_id,
        })
      )
    )
      .then(() => {
        setProductList(resetProducts);
        setTotalAmount(0);
      })
      .catch((error) => {
        console.error("Error resetting quantities:", error);
      });
  };

  const Product = ({ product, index }) => (
  <div className="col-md-4 mb-4">
    <div className="card text-center shadow">
      <div className="card-body">
        <h5 className="card-title"><span className="notranslate">{product.name}</span></h5>
        <h6 className="card-subtitle mb-2 text-muted">
          Price: ${product.price}
        </h6>

        <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
          <button
            className="btn btn-danger"
            onClick={() => decrementQuantity(index)}
          >
            -
          </button>
          <span className="btn btn-warning disabled">
            {product.quantity}
          </span>
          <button
            className="btn btn-success"
            onClick={() => incrementQuantity(index)}
          >
            +
          </button>
        </div>

        <p className="card-text fw-bold">
          Total: ${product.quantity * product.price}
        </p>

        <button
          className="btn btn-outline-danger"
          onClick={() => removeItem(index)}
        >
          Remove
        </button>
      </div>
    </div>
  </div>
);

  return (
    <div className="container mt-4">
      <h1>Cart</h1>
      <br />
      <div className="row">
      {productList.length > 0 ? (
        productList.map((product, index) => (
          <Product key={product.id} product={product} index={index} />
        ))
      ) : (
        <h2>No products exist in the cart</h2>
      )}
      </div>
    <Footer userId={userId} email={userEmail} totalAmount={totalAmount} resetQuantity={resetQuantity} />
    </div>
  );
}
