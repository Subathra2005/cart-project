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
  const [editingProductId,setEditingProductId]=useState('');
  const [editingProductName,setEditingProductName]=useState('');
  const [editingProductPrice,setEditingProductPrice]=useState('');
  const [editingProductQuantity,setEditingProductQuantity]=useState('');

  const handleEdit = async (product) => {
    setEditingProductId(product.id);
    setEditingProductName(product.name);
    setEditingProductPrice(product.price);
    setEditingProductQuantity(product.quantity);
  }
  const editProduct = async () => {
    try {
      await axios.put("http://localhost:5001/api/admin/edit", {
        id: editingProductId,
        name: editingProductName,
        price: editingProductPrice,
        quantity: editingProductQuantity,
        userId,
      });

      alert("Product updated");

      // Refresh product list after edit
      const res = await axios.get("http://localhost:5001/api/admin");
      setAdminProductList(res.data);

      setEditingProductId(null);
    } catch (err) {
      console.error("Error editing product:", err);
      alert("Failed to update product.");
    }
  };


 return (
    <div className="container mt-4">
      <h1 className="mb-4 text-center">Manage Products</h1>
      <AddItem addItem={addItem} />

      <div className="row">
        {adminProductList.length > 0 ? (
          adminProductList.map((product, i) => (
            <div key={i} className="col-md-4 mb-4">
              <div className="card text-center shadow">
                <div className="card-body">
                  {editingProductId === product.id ? (
                    <>
                      <input
                        type="text"
                        value={editingProductName}
                        onChange={(e) => setEditingProductName(e.target.value)}
                        className="form-control mb-2"
                        placeholder="Product Name"
                      />
                      <input
                        type="number"
                        value={editingProductPrice}
                        onChange={(e) => setEditingProductPrice(e.target.value)}
                        className="form-control mb-2"
                        placeholder="Price"
                      />
                      <input
                        type="number"
                        value={editingProductQuantity}
                        onChange={(e) => setEditingProductQuantity(e.target.value)}
                        className="form-control mb-2"
                        placeholder="Quantity"
                      />
                      <button className="btn btn-success me-2" onClick={editProduct}>
                        Save
                      </button>
                      <button className="btn btn-secondary" onClick={() => setEditingProductId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <h5 className="card-title"><span className="notranslate">{product.name}</span></h5>
                      <h6 className="card-subtitle mb-2 text-muted">
                        Price: ${product.price}
                      </h6>
                      <p className="card-text">Quantity: {product.quantity}</p>
                      <button className="btn btn-danger me-2" onClick={() => removeItem(i)}>
                        Remove
                      </button>
                      <button className="btn btn-primary" onClick={() => handleEdit(product)}>
                        Edit
                      </button>
                    </>
                  )}
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
