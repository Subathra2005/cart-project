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
  <div className="container mt-4">
    <h1 className="mb-4 text-center">Admin Page</h1>
    <AddItem addItem={addItem} />

    <div className="row">
      {adminProductList.length > 0 ? (
        adminProductList.map((product, i) => (
          <div key={i} className="col-md-4 mb-4">
            <div className="card text-center shadow">
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">
                  Price: ${product.price}
                </h6>
                <p className="card-text">Quantity: {product.quantity}</p>
                <button className="btn btn-danger" onClick={() => removeItem(i)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center mt-4">No products found.</p>
      )}
    </div>
  </div>
);

}
