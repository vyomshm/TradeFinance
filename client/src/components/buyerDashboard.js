import React, { Component } from "react";
import { Formik, FormikProps, Form, Field, ErrorMessage } from "formik";
import { message } from "antd";

class BuyerDashboard extends Component {
  render() {
    return (
      <div>
        <h1> Buyer Dashboard </h1>
        <Formik
          initialValues={{
            commodity: "",
            price: "",
            deliveryDate: "",
            deliveryVehicle: "",
            deliveryTerms: "",
            quantity: "",
            tolerance: "",
            surveyCompany: "",
            insuranceCertificate: "",
            commodityInfo: ""
          }}
          validate={values => {
            let errors = [];
            //check if my values have errors
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            await console.log(values);
            try {
              var hide = message.loading("Deploying Contract", 0);
              let tfAddress = await this.props.deployContract(values);
              hide();
              console.log("Contract Deployed at :", tfAddress);
              message.success(`Contract Deployed at : ${tfAddress}`);
              setSubmitting(false);
              return;
            } catch (e) {
              hide();
              message.error("An error occured");
            }
          }}
        >
          {isSubmitting => (
            <Form>
              <Field
                component="select"
                name="commodity"
                placeholder="commodity"
                required
              >
                <option selected value="crude oil">
                  Crude Oil
                </option>
                <option value="coal">Coal</option>
                <option value="distillates">Distillates</option>
                <option value="grain">Grain</option>
                <option value="sugar">Sugar</option>
              </Field>
              <Field type="text" required name="price" placeholder="price" />
              <Field type="date" required name="deliveryDate" />
              <Field
                component="select"
                name="deliveryVehicle"
                placeholder="delivery vehicle"
                required
              >
                <option selected value="truck">
                  Truck
                </option>
                <option value="ship">Ship</option>
                <option value="rail">Railways</option>
                <option value="air">Air Cargo</option>
              </Field>
              <Field
                component="select"
                name="deliveryTerms"
                placeholder="delivery terms"
                required
              >
                <option selected value="FOB">
                  FOB
                </option>
                <option value="CIF">CIF</option>
                <option value="DAP">DAP</option>
                <option value="C&F">C&F</option>
              </Field>
              <Field
                type="text"
                name="quantity"
                required
                placeholder="quantity"
              />
              <Field
                type="text"
                name="tolerance"
                required
                placeholder="tolerance"
              />
              <Field
                type="text"
                name="surveyCompany"
                placeholder="survey company"
                required
              />
              <Field
                component="select"
                name="insuranceCertificate"
                placeholder="insurance certificate"
                required
              >
                <option selected value="milo insurnace certificate">
                  MILO Insurance certificate
                </option>
                <option value="enterprise insurance certificate">
                  Enterprise Insurance certificate
                </option>
              </Field>
              <Field
                type="text"
                name="commodityInfo"
                placeholder="commodity info"
                required
              />

              <button type="submit">Deploy Contract</button>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
}

export default BuyerDashboard;
