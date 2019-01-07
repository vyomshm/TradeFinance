import React, { Component } from "react";
import TradeFinance from "./contracts/TradeFinance.json";
import getWeb3 from "./utils/getWeb3";
import Dashboard from "./components/dashboard";
import { Formik, FormikProps, Form, Field, ErrorMessage } from 'formik';

import "./App.css";

class App extends Component {
  state = { trade: null, approval: null, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = TradeFinance.networks[networkId];
      const instance = new web3.eth.Contract(
        TradeFinance.abi,
        deployedNetwork && deployedNetwork.address,
      );

      console.log(instance);
      console.log(accounts);
      console.log(networkId);
      console.log(deployedNetwork);
      console.log(deployedNetwork.address);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.approved().call();
    console.log('response', response);
    let t = await contract.methods.trade().call();
    console.log('trade specs: ', t);
    // Update state with the result.
    this.setState({ trade: this.state.web3.utils.hexToAscii(t.commodity), approval: response.toString() });
  };

  // handleSubmit = ( values ) =>{
  //   console.log(values);

  //   setSubmitting(false);
  //   return;
  // }

  deployContract = async (values) => {
    const { accounts, contract, web3 } = this.state;
    let buyer = accounts[0];
    let seller = accounts[1];
    let buyerBank = accounts[2];
    let sellerBank = accounts[3];

    let description = web3.utils.asciiToHex("trade finance : agreement contract");
    let commodity = web3.utils.asciiToHex(values.commodity);
    let price = values.price;
    let deliveryDate = new Date(values.deliveryDate);
    deliveryDate = deliveryDate.getTime() / 1000;
    let deliveryVehicle = web3.utils.asciiToHex(values.deliveryVehicle);
    let deliveryTerms = web3.utils.asciiToHex(values.deliveryTerms);
    let quantity = values.quantity;
    let tolerance = values.tolerance;
    let surveyCompany = web3.utils.asciiToHex(values.surveyCompany);
    let insuranceCertificate = web3.utils.asciiToHex(values.insuranceCertificate);
    let commodityInfo = web3.utils.asciiToHex(values.commodityInfo);

    const tf = new web3.eth.Contract(TradeFinance.abi);
    let tx = await tf.deploy({
      data: TradeFinance.bytecode,
      arguments: [
        buyer,
        seller,
        buyerBank,
        sellerBank,
        description,
        commodity,
        parseInt(price),
        parseInt(deliveryDate),
        deliveryVehicle,
        deliveryTerms,
        parseInt(quantity),
        parseInt(tolerance),
        surveyCompany,
        insuranceCertificate,
        commodityInfo
      ] 
    }).send({
      from: accounts[0],
      gas: 4712388
    });

    console.log(tx);
    return tx.options.address;
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Trade Finance</h1>
        <p>Web3 config is ready! Current ETH account - {this.state.accounts[0].toString()} </p>
        <h2>Dev : Check log output</h2>
        <p> Fetching trade specifics from pre-deployed contract...</p>
        <h3> Commodity : {this.state.trade}</h3>
        <h4> Approved by buyer: {this.state.approval}</h4>

        <Dashboard />
        <Formik 
          initialValues={{
            commodity: "",
            price: "",
            deliveryDate:"",
            deliveryVehicle:"",
            deliveryTerms:"",
            quantity:"",
            tolerance:"",
            surveyCompany:"",
            insuranceCertificate:"",
            commodityInfo:""
          }}
          validate={(values) => {
            let errors = [];
            //check if my values have errors
            return errors;
          }}
          onSubmit={ async (values, { setSubmitting })=>{
            await console.log(values);
            let tfAddress = await this.deployContract(values);
            console.log("Contract Deployed at :", tfAddress);
            setSubmitting(false);
            return;
          }}
        >
          {( isSubmitting ) => (
            <Form>
              <Field component="select" name="commodity" placeholder="commodity">
                <option selected value="crude oil">Crude Oil</option>
                <option value="coal">Coal</option>
                <option value="distillates">Distillates</option>
                <option value="grain">Grain</option>
                <option value="sugar">Sugar</option>
              </Field>
              <Field type="text" name="price" placeholder="price"/>
              <Field type="date" name="deliveryDate" />
              <Field component="select" name="deliveryVehicle" placeholder="delivery vehicle">
                <option selected value="truck">Truck</option>
                <option value="ship">Ship</option>
                <option value="rail">Railways</option>
                <option value="air">Air Cargo</option>
              </Field>
              <Field component="select" name="deliveryTerms" placeholder="delivery terms">
                <option selected value="FOB">FOB</option>
                <option value="CIF">CIF</option>
                <option value="DAP">DAP</option>
                <option value="C&F">C&F</option>
              </Field>
              <Field type="text" name="quantity" placeholder="quantity" />
              <Field type="text" name="tolerance" placeholder="tolerance" />
              <Field type="text" name="surveyCompany" placeholder="survey company" />
              <Field component="select" name="insuranceCertificate" placeholder="insurance certificate">
                <option selected value="milo insurnace certificate">MILO Insurance certificate</option>
                <option value="enterprise insurance certificate">Enterprise Insurance certificate</option>
              </Field>
              <Field type="text" name="commodityInfo" placeholder="commodity info" />
              <button type="submit">
                Deploy Contract
              </button>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
}

export default App;
