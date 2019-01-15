import React, { Component } from "react";
import { Layout, Menu, Card, message } from "antd";
import TradeFinance from "./contracts/TradeFinance.json";
import getWeb3 from "./utils/getWeb3";

import { BrowserRouter as Router, Route, Link } from "react-router-dom";
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

const { Header, Content } = Layout;

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
    contract: null,
    terms: null
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
        deployedNetwork && deployedNetwork.address
      );

      console.log(instance);
      console.log(accounts);
      console.log(networkId);
      console.log(deployedNetwork);
      console.log(deployedNetwork.address);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  // handler function for buyer dashboard
  deployContract = async values => {
    const { accounts, web3 } = this.state;
    const buyer = accounts[0];
    const seller = accounts[1];
    const buyerBank = accounts[2];
    const sellerBank = accounts[3];
    const status = [
      "Initialized",
      "Approved",
      "Active",
      "Fulfilled",
      "Concluded"
    ];

    let description = web3.utils.asciiToHex(
      "trade finance : agreement contract"
    );
    let commodity = web3.utils.asciiToHex(values.commodity);
    let price = values.price;
    let deliveryDate = new Date(values.deliveryDate);
    deliveryDate = deliveryDate.getTime() / 1000;
    let deliveryVehicle = web3.utils.asciiToHex(values.deliveryVehicle);
    let deliveryTerms = web3.utils.asciiToHex(values.deliveryTerms);
    let quantity = values.quantity;
    let tolerance = values.tolerance;
    let surveyCompany = web3.utils.asciiToHex(values.surveyCompany);
    let insuranceCertificate = web3.utils.asciiToHex(
      values.insuranceCertificate
    );
    let commodityInfo = web3.utils.asciiToHex(values.commodityInfo);

    let terms = web3.utils.asciiToHex(values.terms);

    const tf = new web3.eth.Contract(TradeFinance.abi);
    let deployedTradeFinanceContract = await tf
      .deploy({
        data: TradeFinance.bytecode,
        arguments: [
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
          commodityInfo,
          terms
        ]
      })
      .send({
        from: buyer,
        gas: 4712388
      });

    // fetch trade object and update state
    const trade = await deployedTradeFinanceContract.methods.trade().call();
    const approval = await deployedTradeFinanceContract.methods.approved().call();
    const retrievedTerms = await deployedTradeFinanceContract.methods.terms().call();
    // terms = terms.split(";");

    console.log("fetch: ", trade);
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
      status: status[parseInt(trade.status)],
      approval: approval.toString(),
      terms: web3.utils.hexToAscii(retrievedTerms)
    });

    console.log(deployedTradeFinanceContract);
    return deployedTradeFinanceContract.options.address;
  };

  // handler fn for seller dashboard
  handleSellerApproval = async () => {
    const { accounts, contract } = this.state;
    const seller = accounts[1];
    const status = [
      "Initialized",
      "Approved",
      "Active",
      "Fulfilled",
      "Concluded"
    ];

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
    message.success(`Contract now approved by seller! | tx : ${tx.transactionHash}`);
    return tx.transactionHash;
  };

  //handler for buyerBank dashboard
  fundEscrow = async () => {
    const { accounts, contract, price, quantity } = this.state;
    const buyerBank = accounts[2];
    const status = [
      "Initialized",
      "Approved",
      "Active",
      "Fulfilled",
      "Concluded"
    ];
    let amt = parseInt(price) * parseInt(quantity);
    amt = amt < 10000 ? 1500000 : amt;

    let tx = await contract.methods.initiateTrade().send({
      from: buyerBank,
      gas: 4712388,
      value: amt
    });

    console.log(tx);
    const trade = await contract.methods.trade().call();
    this.setState({ status: status[parseInt(trade.status)] });
    message.success(`Trade Initiated successfully! | tx : ${tx.transactionHash}`);
    return tx.transactionHash;
  };

  // common handler for all other dashboards
  // Note - *** To be Replaced with updated ref specs ****
  indicateMetCondition = async message => {
    const { accounts, web3, contract } = this.state;
    const buyerBank = accounts[2];
    const status = [
      "Initialized",
      "Approved",
      "Active",
      "Fulfilled",
      "Concluded"
    ];

    let tx = await contract.methods
      .indicateMetCondition(web3.utils.asciiToHex(message))
      .send({
        from: buyerBank,
        gas: 4712388
      });
    console.log(tx);

    // update state with latest status
    const trade = await contract.methods.trade().call();
    this.setState({ status: status[parseInt(trade.status)] });
    return tx.transactionHash;
    // TO-DO - Check if event emitted correctly
  };

  //handler for seller Bank dashboard
  finalSellerBankApproval = async () => {
    const { accounts, contract } = this.state;
    const sellerBank = accounts[3];
    const status = [
      "Initialized",
      "Approved",
      "Active",
      "Fulfilled",
      "Concluded"
    ];

    let tx = await contract.methods.finalSellerBankApproval().send({
      from: sellerBank,
      gas: 4712388
    });
    console.log(tx);

    // update state with latest status
    const trade = await contract.methods.trade().call();
    this.setState({ status: status[parseInt(trade.status)] });
    message.success(`Trade Concluded and Funds transferred successfully! | tx : ${tx.transactionHash}`);
    return tx.transactionHash;
  };


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <Router>
        <div className="App">
          <Layout>
            <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
              <Link to="/">
                <h2>Trade Finance</h2>
              </Link>

              <Menu mode="horizontal" style={{ lineHeight: "64px" }}>
                <Menu.Item>
                  <Link to="/">Buyer </Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to="/Seller-Dashboard/">Seller </Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to="/BuyerBank-Dashboard/">Buyer Bank</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to="/SurveyCompany-Dashboard/">Survey Company</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to="/InsuranceCompany-Dashboard/">
                    Insurance Company
                  </Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to="/Captain-Dashboard/">Captain</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to="/SellerBank-Dashboard/">Seller Bank</Link>
                </Menu.Item>
              </Menu>
            </Header>
            <Content
              style={{ padding: "0 50px", marginTop: 64, display: "flex" }}
            >
              {/* <Route
                path="/"
                render={() => (
                  <Card style={{ margin: 64, width: "50%" }}>
                    <p>
                      Web3 config is ready! Current ETH account -{" "}
                      {this.state.accounts[0].toString()}{" "}
                    </p>
                    <h2>Dev : Check log output</h2>
                    <p>
                      {" "}
                      Fetching trade specifics from pre-deployed contract...
                    </p>
                    <h3> Commodity : {this.state.trade}</h3>
                    <h4> Approved by Seller: {this.state.approval}</h4>
                  </Card>
                )}
              /> */}
              <Card
                style={{
                  margin: "auto",
                  marginTop: 64,
                  width: "50%",
                  textAlign: "left"
                }}
              >
                <Route
                  path="/"
                  exact
                  render={() => (
                    <BuyerDashboard deployContract={this.deployContract} />
                  )}
                />
                <Route
                  path="/Seller-Dashboard/"
                  render={() => (
                    <SellerDashboard
                      {...this.state}
                      handleSellerApproval={this.handleSellerApproval}
                    />
                  )}
                />
                <Route
                  path="/BuyerBank-Dashboard/"
                  render={() => (
                    <BuyerBankDashboard
                      {...this.state}
                      indicateMetCondition={this.indicateMetCondition}
                      fundEscrow={this.fundEscrow}
                    />
                  )}
                />
                <Route
                  path="/SellerBank-Dashboard/"
                  render={() => (
                    <SellerBankDashboard
                      {...this.state}
                      indicateMetCondition={this.indicateMetCondition}
                      finalSellerBankApproval={this.finalSellerBankApproval}
                    />
                  )}
                />
                <Route
                  path="/Captain-Dashboard/"
                  render={() => (
                    <CaptainDashboard
                      {...this.state}
                      indicateMetCondition={this.indicateMetCondition}
                    />
                  )}
                />
                <Route
                  path="/InsuranceCompany-Dashboard/"
                  render={() => (
                    <InsuranceCompanyDashboard
                      {...this.state}
                      indicateMetCondition={this.indicateMetCondition}
                    />
                  )}
                />
                <Route
                  path="/SurveyCompany-Dashboard/"
                  render={() => (
                    <SurveyCompanyDashboard
                      {...this.state}
                      indicateMetCondition={this.indicateMetCondition}
                    />
                  )}
                />
              </Card>
            </Content>
          </Layout>
        </div>
      </Router>
    );
  }
}

export default App;
