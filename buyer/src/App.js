import React, { Component } from "react";
import TradeFinance from "./contracts/TradeFinance.json";
import getWeb3 from "./utils/getWeb3";
import CrudeOil from "./components/crudeOil";

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

      // console.log(instance);
      // console.log(accounts);
      // console.log(networkId);
      // console.log(deployedNetwork);
      // console.log(deployedNetwork.address);

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

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <CrudeOil />
        <h1>Good to Go!</h1>
        <p>Web3 config is ready! </p>
        <h2>Dev : Check log output</h2>
        <p> Fetching trade specifics from deployed contract</p>
        <h3> Commodity : {this.state.trade}</h3>
        <h4> Approved by buyer: {this.state.approval}</h4>
        <p>Check log output to view the comlete trade object....</p>
      </div>
    );
  }
}

export default App;
