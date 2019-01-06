const web3 = require('web3');

function hexToAscii(hexData) {
	return web3.utils.hexToAscii(hexData);
}

async function getBuyerAddress(instance){
	return await instance.methods.buyer().call();
}

async function getSellerAddress(instance){
	return await instance.methods.seller().call();
}

async function getBuyerBankAddress(instance){
	return await instance.methods.buyerBank().call();
}

async function getSellerBankAddress(instance){
	return await instance.methods.sellerBank().call();
}

async function getTrade(instance){
	return await instance.methods.trade().call();
}

async function getTradeDescription(instance){
	return await instance.methods.description().call();
}

module.exports = {
	hexToAscii,
	getBuyerAddress,
	getSellerAddress,
	getBuyerBankAddress,
	getSellerBankAddress,
	getTrade,
	getTradeDescription
}