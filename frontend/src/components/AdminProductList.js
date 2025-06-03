import React, { useEffect, useState } from "react";
import axios from "axios";
import AddItem from "../AddItem"; // make sure the path is correct

export default function AdminProductList() {
  const [adminProductList, setAdminProductList] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    axios
      .get("http://localhost:5001/api/admin")
      .then((response) => {
        setAdminProductList(response.data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, [userId]);

  const removeItem = (index) => {
    const removedProduct = adminProductList[index];
    if (!removedProduct || !userId) return;

    axios
      .delete(`http://localhost:5001/api/admin/${removedProduct.id}`)
      .then(() => {
        const newList = [...adminProductList];
        newList.splice(index, 1);
        setAdminProductList(newList);
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
      });
  };

  const addItem = (name, price, quantity) => {
    if (!userId) return;

    axios
      .post("http://localhost:5001/api/admin", {
        name,
        price,
        quantity,
      })
      .then((response) => {
        setAdminProductList((adminProductList) => [
          ...adminProductList,
          response.data,
        ]);
      })
      .catch((error) => {
        console.error("Error adding product:", error);
      });
  };

  return (
    <div>
      <h1>Admin Page</h1>
      <AddItem addItem={addItem} />

      {adminProductList.length > 0 ? (
        adminProductList.map((product, i) => (
          <div key={i} className="row mt-3 align-items-center">
            {/* Product name and price */}
            <div className="col-md-6">
              <h2>
                {product.name}
                <span className="badge text-bg-secondary ms-5">
                  $ {product.price}
                </span>
              </h2>
            </div>

            {/* Quantity and Remove Button */}
            <div className="col-md-6 d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Quantity: {product.quantity}</h4>
              <button className="btn btn-danger" onClick={() => removeItem(i)}>
                Remove
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
}
