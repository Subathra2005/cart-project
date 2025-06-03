import React, { Component } from 'react';

class AddItem extends Component {
  constructor(props){
    super(props);
    this.state={
        productName:"",
        productPrice:0,
        productQuantity:0
    }

  }

  render() {
    return (
      <form className="row mb-5 mt-5" onSubmit={(e) => {
  e.preventDefault();
  this.props.addItem(
    this.state.productName,
    Number(this.state.productPrice),
    Number(this.state.productQuantity)
  );
}}>
  {/* Name Input */}
  <div className="mb-3 col-3">
    <label htmlFor="inputName" className="form-label">Name</label>
    <input
      type="text"
      className="form-control"
      id="inputName"
      name="productName"
      onChange={(e) => this.setState({ productName: e.currentTarget.value })}
      value={this.state.productName}
    />
  </div>

  {/* Price Input */}
  <div className="mb-3 col-3">
    <label htmlFor="inputPrice" className="form-label">Price</label>
    <input
      type="number"
      className="form-control"
      id="inputPrice"
      name="productPrice"
      onChange={(e) => this.setState({ productPrice: Number(e.currentTarget.value) })}
      value={this.state.productPrice}
    />
  </div>

  {/* Quantity Input */}
  <div className="mb-3 col-3">
    <label htmlFor="inputQuantity" className="form-label">Quantity</label>
    <input
      type="number"
      className="form-control"
      id="inputQuantity"
      name="productQuantity"
      onChange={(e) => this.setState({ productQuantity: Number(e.currentTarget.value) })}
      value={this.state.productQuantity}
    />
  </div>

  {/* Submit Button aligned with inputs */}
  <div className="mb-3 col-3 d-flex align-items-end">
    <button type="submit" className="btn btn-primary w-100">Add Item</button>
  </div>
</form>

    );
  }
}

export default AddItem;
