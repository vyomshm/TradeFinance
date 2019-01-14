import React, { Component } from "react";
import { Formik, FormikProps, Form, Field, ErrorMessage } from "formik";

class BuyerBankDashboard extends Component {
  render() {
    return (
      <div>
        <h1> Buyer Bank Dashboard </h1>
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

        <button type="primary" onClick={this.props.fundEscrow}>
          Initiate Trade with deposit of{" "}
          {parseInt(this.props.price) * parseInt(this.props.quantity)}
        </button>

        <h2> Final Buyer Bank approval </h2>
        <Formik
          initialValues={{
            message: ""
          }}
          validate={values => {
            let errors = [];
            //check if my values have errors
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            await console.log(values);
            await this.props.indicateMetCondition(values.message);
            setSubmitting(false);
            return;
          }}
        >
          {isSubmitting => (
            <Form>
              <Field type="text" name="message" placeholder="message" />
              <button type="submit">Submit approval</button>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
}

export default BuyerBankDashboard;
