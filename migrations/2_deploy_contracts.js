const web3 = require("web3");
let TradeFinance = artifacts.require("TradeFinance");

module.exports = function(deployer, network, accounts){
	let buyer = accounts[0];
	let seller = accounts[1];
	let buyerBank = accounts[2];
	let sellerBank = accounts[3];

	let description = web3.utils.asciiToHex("description");
	let commodity = web3.utils.asciiToHex("Crude Oil");
	let price = 1000;
	let deliveryDate = Date.now() + 30*24*60*60;
	let deliveryVehicle = web3.utils.asciiToHex("Truck");
	let deliveryTerm = web3.utils.asciiToHex("CTF");
	let quantity = 15000;
	let tolerance = 5;
	let surveyCompany = web3.utils.asciiToHex("ABC INC.");
	let insuranceCertificate = web3.utils.asciiToHex("Milo Insurance certificate");
	let commodityInfo = web3.utils.asciiToHex("something 3");

	deployer.deploy(
		TradeFinance, 
		buyer, 
		seller, 
		buyerBank, 
		sellerBank,
		description,
		commodity,
		price,
		deliveryDate,
		deliveryVehicle,
		deliveryTerm,
		quantity,
		tolerance,
		surveyCompany,
		insuranceCertificate,
		commodityInfo
	);
}