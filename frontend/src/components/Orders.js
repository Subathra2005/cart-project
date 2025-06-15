import React, { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/admin/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.post(
        `http://localhost:5001/api/admin/orders/${orderId}/status`,
        { status: newStatus }
      );
      alert(`Order ${newStatus}`);
      fetchOrders(); // Refresh after update
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update order status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading orders...</p>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">All Orders</h2>
      <div className="row">
        {orders.map((order) => {
          const details =
            typeof order.order_details === "string"
              ? JSON.parse(order.order_details)
              : order.order_details;
          return (
            <div key={order.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Order ID: {order.id}</h5>
                  <p>
                    <strong>Email:</strong> {order.email}
                  </p>
                  <p>
                    <strong>Address:</strong> {order.address}
                  </p>
                  <p>
                    <strong>Items:</strong>
                  </p>
                  <ul className="list-group list-group-flush mb-3">
                    {details.map((item, i) => (
                      <li key={i} className="list-group-item">
                        {item.name} × {item.quantity} — ₹{item.price}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Status: </strong>
                    <span
                      className={`badge 
                      ${
                        order.status === "accepted"
                          ? "bg-success"
                          : order.status === "rejected"
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </p>
                  {order.status === "pending" && (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success w-50"
                        onClick={() => handleStatusUpdate(order.id, "accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-sm btn-danger w-50"
                        onClick={() => handleStatusUpdate(order.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {order.status !== null && (
                    <div className="text-muted mt-2 text-center">
                      Already {order.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && <p className="text-center">No orders found.</p>}
      </div>
    </div>
  );
};

export default Orders;
