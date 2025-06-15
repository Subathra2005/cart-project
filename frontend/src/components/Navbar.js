import { Link } from "react-router-dom";

const Navbar = ({ userId, role, onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow mb-3">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <Link className="navbar-brand text-white" to="/">
          E-Cart
        </Link>

        <div id="google_translate_element" />

        {userId && (
          <div className="d-flex align-items-center gap-3">
            {role === "buyer" && (
              <>
                <Link className="nav-link text-white" to="/products">
                  Products
                </Link>
                <Link className="nav-link text-white" to="/cart">
                  Cart
                </Link>
              </>
            )}
            {role === "admin" && (
              <>
                <Link className="nav-link text-white" to="/admin/products">
                  Manage Products
                </Link>
                <Link className="nav-link text-white" to="/admin/orders">
                  Orders
                </Link>
              </>
            )}
          </div>
        )}

        {userId && (
          <button className="btn btn-outline-light" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
