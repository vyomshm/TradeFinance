import React, { Component } from "react";
import TradeFinance from "./contracts/TradeFinance.json";
import getWeb3 from "./utils/getWeb3";
import { Formik, FormikProps, Form, Field, ErrorMessage } from 'formik';
import "./App.css";

// placeholder imports
// TO-DO - move all functionality inside respective components and manage state
import BuyerDashboard from "./components/buyerDashboard";
import SellerDashboard from "./components/sellerDashboard";
import BuyerBankDashboard from "./components/buyerBankDashboard";
import SellerBankDashboard from "./components/sellerBankDashboard";
import CaptainDashboard from "./components/captainDashboard";
import InsuranceCompanyDashboard from "./components/insuranceCompanyDashboard";
import SurveyCompanyDashboard from "./components/surveyCompanyDashboard";

class App extends Component {
  state = { 
    commodity: null,
    price: null,
    deliveryDate: null,
    deliveryVehicle: null,
    deliveryTerms: null,
    quantity: null,
    tolerance: null,
    surveyCompany: null,
    insuranceCertificate: null,
    commodityInfo: null,
    status: null,
    approval: null, 
    web3: null, 
    accounts: null, 
    contract: null 
  };

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
    const { contract } = this.state;

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.approved().call();
    console.log('response', response);
    let t = await contract.methods.trade().call();
    console.log('trade specs: ', t);
    // Update state with the result.
    this.setState({ commodity: this.state.web3.utils.hexToAscii(t.commodity), approval: response.toString() });
  };

  // handler function for buyer dashboard
  deployContract = async (values) => {
    const { accounts, web3 } = this.state;
    const buyer = accounts[0];
    const seller = accounts[1];
    const buyerBank = accounts[2];
    const sellerBank = accounts[3];
    const status = ["Initialized", "Approved", "Active", "Fulfilled", "Concluded"];

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
    let deployedTradeFinanceContract = await tf.deploy({
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

    // fetch trade object and update state
    const trade = await deployedTradeFinanceContract.methods.trade().call();
    console.log('fetch: ', trade);
    this.setState({
      contract: deployedTradeFinanceContract,
      commodity: web3.utils.hexToAscii(trade.commodity),
      price: trade.price,
      deliveryDate: trade.deliveryDate,
      deliveryVehicle: web3.utils.hexToAscii(trade.deliveryVehicle),
      deliveryTerms: web3.utils.hexToAscii(trade.deliveryTerm),
      quantity: trade.quantity,
      tolerance: trade.tolerance,
      surveyCompany: web3.utils.hexToAscii(trade.surveyCompany),
      insuranceCertificate: web3.utils.hexToAscii(trade.insuranceCertificate),
      commodityInfo: web3.utils.hexToAscii(trade.commodityInfo),
      status: status[parseInt(trade.status)]
    });

    console.log(deployedTradeFinanceContract);
    return deployedTradeFinanceContract.options.address;
  }

  // handler fn for seller dashboard
  handleSellerApproval = async () => {
    const { accounts, contract } = this.state;
    const seller = accounts[1];
    const status = ["Initialized", "Approved", "Active", "Fulfilled", "Concluded"];

    let tx = await contract.methods.approveContract().send({
      from: seller,
      gas: 4712388
    });
    console.log(tx);
    //update state
    const approval = await contract.methods.approved().call();
    const trade = await contract.methods.trade().call();

    this.setState({
      approval: approval.toString(),
      status: status[parseInt(trade.status)]
    });
  }

  //handler for buyerBank dashboard
  fundEscrow = async () => {
    const { accounts, contract, price, quantity } = this.state;
    const buyerBank = accounts[2];
    const status = ["Initialized", "Approved", "Active", "Fulfilled", "Concluded"];
    let amt = parseInt(price)*parseInt(quantity);
    amt = amt < 10000 ? 1500000 : amt;

    let tx = await contract.methods.initiateTrade().send({
      from: buyerBank,
      gas: 4712388,
      value: amt
    });

    console.log(tx);
    const trade = await contract.methods.trade().call();
    this.setState({ status: status[parseInt(trade.status)]});
  }

  // common handler for all other dashboards
  // Note - *** To be Replaced with updated ref specs ****
  indicateMetCondition = async (message) => {
    const { accounts, web3, contract } = this.state;
    const buyerBank = accounts[2];
    const status = ["Initialized", "Approved", "Active", "Fulfilled", "Concluded"];

    let tx = await contract.methods.indicateMetCondition(
      web3.utils.asciiToHex(message)
    ).send({
      from: buyerBank,
      gas: 4712388
    });
    console.log(tx);

    // update state with latest status
    const trade = await contract.methods.trade().call();
    this.setState({ status: status[parseInt(trade.status)]});
    
    // TO-DO - Check if event emitted correctly 
  }

  //handler for seller Bank dashboard
  finalSellerBankApproval = async () => {
    const { accounts, web3, contract } = this.state;
    const sellerBank = accounts[3];
    const status = ["Initialized", "Approved", "Active", "Fulfilled", "Concluded"];

    let tx = await contract.methods.finalSellerBankApproval().send({
      from: sellerBank,
      gas: 4712388
    });
    console.log(tx);

    // update state with latest status
    const trade = await contract.methods.trade().call();
    this.setState({ status: status[parseInt(trade.status)]});
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
        <h4> Approved by Seller: {this.state.approval}</h4>

        <BuyerDashboard />
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

        <h1>****************************</h1>

        <SellerDashboard />
        <h4> Trade Finance Contract : {this.state.contract.options.address}</h4>
        <h3> Trade Details </h3>
        <h4> Trade Status : {this.state.status} </h4>
        <ul>
          <li> Commodity : {this.state.commodity} </li>
          <li> Price : {this.state.price} </li>
          <li> Delivery Date : {this.state.deliveryDate} </li>
          <li> Delivery Vehicle : {this.state.deliveryVehicle} </li>
          <li> Delivery Terms : {this.state.deliveryTerms} </li>
          <li> Quantity : {this.state.quantity} </li>
          <li> Tolerance : {this.state.tolerance} </li>
          <li> Survey Company : {this.state.surveyCompany} </li>
          <li> Insurance Certificate : {this.state.insuranceCertificate} </li>
          <li> Commodity Info : {this.state.commodityInfo} </li>
        </ul>
        <h4> Approved by Seller : {this.state.approval}</h4>
        <button onClick={this.handleSellerApproval}>
          Approve Contract
        </button>

        <h1>****************************</h1>

        <BuyerBankDashboard />
        <h4> Trade Finance Contract : {this.state.contract.options.address}</h4>
        <h3> Trade Details </h3>
        <h4> Trade Status : {this.state.status} </h4>
        <ul>
          <li> Commodity : {this.state.commodity} </li>
          <li> Price : {this.state.price} </li>
          <li> Delivery Date : {this.state.deliveryDate} </li>
          <li> Delivery Vehicle : {this.state.deliveryVehicle} </li>
          <li> Delivery Terms : {this.state.deliveryTerms} </li>
          <li> Quantity : {this.state.quantity} </li>
          <li> Tolerance : {this.state.tolerance} </li>
          <li> Survey Company : {this.state.surveyCompany} </li>
          <li> Insurance Certificate : {this.state.insuranceCertificate} </li>
          <li> Commodity Info : {this.state.commodityInfo} </li>
        </ul>
        <h4> Approved by Seller : {this.state.approval}</h4>
        
        <button onClick={this.fundEscrow}>
          Initiate Trade with deposit of {parseInt(this.state.price)*parseInt(this.state.quantity)}
        </button>

        <h2> Final Buyer Bank approval </h2>
        <Formik 
          initialValues={{
            message: ""
          }}
          validate={(values) => {
            let errors = [];
            //check if my values have errors
            return errors;
          }}
          onSubmit={ async (values, { setSubmitting })=>{
            await console.log(values);

            await this.indicateMetCondition(values.message);
            setSubmitting(false);
            return;
          }}
        >
          {( isSubmitting ) => (
            <Form>
              <Field type="text" name="message" placeholder="message"/>
              <button type="submit">
                Submit approval
              </button>
            </Form>
          )}
        </Formik>


        <h1>****************************</h1>
        <SellerBankDashboard />

        <h4> Trade Finance Contract : {this.state.contract.options.address}</h4>
        <h3> Trade Details </h3>
        <h4> Trade Status : {this.state.status} </h4>
        <ul>
          <li> Commodity : {this.state.commodity} </li>
          <li> Price : {this.state.price} </li>
          <li> Delivery Date : {this.state.deliveryDate} </li>
          <li> Delivery Vehicle : {this.state.deliveryVehicle} </li>
          <li> Delivery Terms : {this.state.deliveryTerms} </li>
          <li> Quantity : {this.state.quantity} </li>
          <li> Tolerance : {this.state.tolerance} </li>
          <li> Survey Company : {this.state.surveyCompany} </li>
          <li> Insurance Certificate : {this.state.insuranceCertificate} </li>
          <li> Commodity Info : {this.state.commodityInfo} </li>
        </ul>
        <h4> Approved by Seller : {this.state.approval}</h4>

        <h3> Seller Bank  KYC approval </h3>
        <Formik 
          initialValues={{
            kyc: ""
          }}
          validate={(values) => {
            let errors = [];
            //check if my values have errors
            return errors;
          }}
          onSubmit={ async (values, { setSubmitting })=>{
            await console.log(values);

            //await this.indicateMetCondition(values.message);
            setSubmitting(false);
            return;
          }}
        >
          {( isSubmitting ) => (
            <Form>
              <Field type="file" name="kyc" placeholder="message"/>
              <button type="submit">
                Submit KYC approval
              </button>
            </Form>
          )}
        </Formik>

        <h2> Final Seller Bank Approval </h2>
        <h4> Trade status : {this.state.status} </h4>
        <button onClick={this.finalSellerBankApproval}>
          Final Seller Bank Approval
        </button>

        <h1>****************************</h1>

        <CaptainDashboard />
        <h4> Trade Finance Contract : {this.state.contract.options.address}</h4>
        <h3> Trade Details </h3>
        <h4> Trade Status : {this.state.status} </h4>
        <ul>
          <li> Commodity : {this.state.commodity} </li>
          <li> Price : {this.state.price} </li>
          <li> Delivery Date : {this.state.deliveryDate} </li>
          <li> Delivery Vehicle : {this.state.deliveryVehicle} </li>
          <li> Delivery Terms : {this.state.deliveryTerms} </li>
          <li> Quantity : {this.state.quantity} </li>
          <li> Tolerance : {this.state.tolerance} </li>
          <li> Survey Company : {this.state.surveyCompany} </li>
          <li> Insurance Certificate : {this.state.insuranceCertificate} </li>
          <li> Commodity Info : {this.state.commodityInfo} </li>
        </ul>
        <h4> Approved by Seller : {this.state.approval}</h4>


        <h2> Captain approval </h2>

        <Formik 
          initialValues={{
            bol:"",
            message: ""
          }}
          validate={(values) => {
            let errors = [];
            //check if my values have errors
            return errors;
          }}
          onSubmit={ async (values, { setSubmitting })=>{
            await console.log(values);

            await this.indicateMetCondition(values.message);
            setSubmitting(false);
            return;
          }}
        >
          {( isSubmitting ) => (
            <Form>
              <Field type="text" name="message" placeholder="message"/>
              <label> Upload Bill of Lading and invoices</label>
              <Field type="file" name="bol" placeholder="Bill of Lading"/>
              <button type="submit">
                Submit approval
              </button>
            </Form>
          )}
        </Formik>

        <h1>****************************</h1>

        <InsuranceCompanyDashboard />

        <h4> Trade Finance Contract : {this.state.contract.options.address}</h4>
        <h3> Trade Details </h3>
        <h4> Trade Status : {this.state.status} </h4>
        <ul>
          <li> Commodity : {this.state.commodity} </li>
          <li> Price : {this.state.price} </li>
          <li> Delivery Date : {this.state.deliveryDate} </li>
          <li> Delivery Vehicle : {this.state.deliveryVehicle} </li>
          <li> Delivery Terms : {this.state.deliveryTerms} </li>
          <li> Quantity : {this.state.quantity} </li>
          <li> Tolerance : {this.state.tolerance} </li>
          <li> Survey Company : {this.state.surveyCompany} </li>
          <li> Insurance Certificate : {this.state.insuranceCertificate} </li>
          <li> Commodity Info : {this.state.commodityInfo} </li>
        </ul>
        <h4> Approved by Seller : {this.state.approval}</h4>

        <h2> Insurance approval </h2>

        <Formik 
          initialValues={{
            message: "",
            insureCert:""
          }}
          validate={(values) => {
            let errors = [];
            //check if my values have errors
            return errors;
          }}
          onSubmit={ async (values, { setSubmitting })=>{
            await console.log(values);

            await this.indicateMetCondition(values.message);
            setSubmitting(false);
            return;
          }}
        >
          {( isSubmitting ) => (
            <Form>
              <Field type="text" name="message" placeholder="message"/>
              <label> Upload Insurance Certificate</label>
              <Field type="file" name="insureCert" placeholder="Insurance Certificate"/>
              <button type="submit">
                Submit approval
              </button>
            </Form>
          )}
        </Formik>

        <h1>****************************</h1>

        <SurveyCompanyDashboard />

        <h4> Trade Finance Contract : {this.state.contract.options.address}</h4>
        <h3> Trade Details </h3>
        <h4> Trade Status : {this.state.status} </h4>
        <ul>
          <li> Commodity : {this.state.commodity} </li>
          <li> Price : {this.state.price} </li>
          <li> Delivery Date : {this.state.deliveryDate} </li>
          <li> Delivery Vehicle : {this.state.deliveryVehicle} </li>
          <li> Delivery Terms : {this.state.deliveryTerms} </li>
          <li> Quantity : {this.state.quantity} </li>
          <li> Tolerance : {this.state.tolerance} </li>
          <li> Survey Company : {this.state.surveyCompany} </li>
          <li> Insurance Certificate : {this.state.insuranceCertificate} </li>
          <li> Commodity Info : {this.state.commodityInfo} </li>
        </ul>
        <h4> Approved by Seller : {this.state.approval}</h4>

        <h2> Survey Company approval </h2>

        <Formik 
          initialValues={{
            message: "",
            surveyDoc:""
          }}
          validate={(values) => {
            let errors = [];
            //check if my values have errors
            return errors;
          }}
          onSubmit={ async (values, { setSubmitting })=>{
            await console.log(values);

            await this.indicateMetCondition(values.message);
            setSubmitting(false);
            return;
          }}
        >
          {( isSubmitting ) => (
            <Form>
              <Field type="text" name="message" placeholder="message"/>
              <label> Upload Survey docs</label>
              <Field type="file" name="surveyDoc" placeholder="Assurance Doc"/>
              <button type="submit">
                Submit approval
              </button>
            </Form>
          )}
        </Formik>

        <h1>****************************</h1>
      </div>
    );
  }
}

export default App;
