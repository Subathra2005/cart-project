import React from 'react';

class Navbar extends React.Component {
  render() {
    const { userId, onLogout } = this.props;

    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            E-cart
          </a>

          {/* Show Logout button if user is logged in */}
          {userId && (
            <>
            <button 
              className="btn btn-outline-light ms-auto"
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
            </>
          )}
        </div>
      </nav>
    );
  }
}

export default Navbar;