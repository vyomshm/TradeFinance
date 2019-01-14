import React, { Component } from "react";
import { Formik, FormikProps, Form, Field, ErrorMessage } from "formik";

class SellerDashboard extends Component {
  render() {
    return (
      <div>
        <h1> Seller Dashboard </h1>
        <h4>
          {" "}
          Trade Finance Contract :{" "}
          {this.props.contract && this.props.contract.options.address}
        </h4>
        <h3> Trade Details </h3>
        <h4> Trade Status : {this.props.status} </h4>
        <ul>
          <li> Commodity : {this.props.commodity} </li>
          <li> Price : {this.props.price} </li>
          <li> Delivery Date : {this.props.deliveryDate} </li>
          <li> Delivery Vehicle : {this.props.deliveryVehicle} </li>
          <li> Delivery Terms : {this.props.deliveryTerms} </li>
          <li> Quantity : {this.props.quantity} </li>
          <li> Tolerance : {this.props.tolerance} </li>
          <li> Survey Company : {this.props.surveyCompany} </li>
          <li> Insurance Certificate : {this.props.insuranceCertificate} </li>
          <li> Commodity Info : {this.props.commodityInfo} </li>
        </ul>
        <h4> Approved by Seller : {this.props.approval}</h4>
        <button onClick={this.props.handleSellerApproval}>
          Approve Contract
        </button>
      </div>
    );
  }
}

export default SellerDashboard;
