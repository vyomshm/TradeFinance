import React, { Component } from "react";
import { Formik, Form, Field } from "formik";
import { message } from "antd";

class InsuranceCompanyDashboard extends Component {
  render() {
    return (
      <div>
        <h1> Insurance Company Dashboard </h1>
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
          <li> Terms of Trade : {this.props.terms} </li>
        </ul>

        <h1> ***************** </h1>

        <h2> Insurance approval </h2>

        <Formik
          initialValues={{
            message: "",
            insureCert: ""
          }}
          validate={values => {
            let errors = [];
            //check if my values have errors
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            let hide = message.loading("Submitting Insurance docs", 0);
            await console.log(values);
            let transactionHash = await this.props.indicateMetCondition(values.message);
            hide();
            message.success(`Approval added | tx : ${transactionHash}`);
            setSubmitting(false);
            return;
          }}
        >
          {isSubmitting => (
            <Form>
              <Field type="text" name="message" placeholder="insurance certificate uid" />
              <br />
              <label> Upload Insurance Certificate</label>
              <Field
                type="file"
                name="insureCert"
                placeholder="Insurance Certificate"
              />
              <button type="submit">Submit approval</button>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
}

export default InsuranceCompanyDashboard;
