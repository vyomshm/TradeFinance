import React, { Component } from "react";
import { Formik, Form, Field } from "formik";
import { message } from "antd";

class SellerBankDashboard extends Component {
  render() {
    return (
      <div>
        <h1> Seller Bank Dashboard </h1>
        <h3> Trade Details </h3>
        <h4>
          {" "}
          Trade Finance Contract :{" "}
          {this.props.contract && this.props.contract.options.address}
        </h4>
        <h4> Approved by Seller : {this.props.approval}</h4>
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
          <li> Terms fo Trade : {this.props.terms} </li>
        </ul>

        <h3> Seller Bank KYC approval </h3>
        <Formik
          initialValues={{
            kyc: ""
          }}
          validate={values => {
            let errors = [];
            //check if my values have errors
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            let hide = message.loading("Submitting Approval...", 0);
            await console.log(values);
            // let transactionHash = await this.props.indicateMetCondition(values.message);
            hide();
            message.success(`KYC Certificates uploaded!`);
            setSubmitting(false);
            return;
          }}
        >
          {isSubmitting => (
            <Form>
              <Field type="file" name="kyc" placeholder="message" />
              <button type="submit">Submit KYC approval</button>
            </Form>
          )}
        </Formik>

        <h2> Final Seller Bank Approval </h2>
        <h4> Trade status : {this.props.status} </h4>
        <button onClick={this.props.finalSellerBankApproval}>
          Final Seller Bank Approval
        </button>
      </div>
    );
  }
}

export default SellerBankDashboard;
