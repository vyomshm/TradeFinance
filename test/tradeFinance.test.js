const TradeFinance = artifacts.require('TradeFinance.sol');
const assert = require('assert');
// const web3 = require('web3');

contract("TradeFinance", (accounts) => {
	let tradeFinance;
	let tx;
	let trade;
	let escrow;
	let conditions;

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
	let commodityInfo = web3.utils.asciiToHex("extra info");

	before(async () => {
		tradeFinance = await TradeFinance.new(
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
		escrow = await tradeFinance.escrow.call();
	});

	// To-DO write proper unit tests here!!!
	describe("demo workflow", () => {
		it("should deploy", async () => {
			assert.ok(tradeFinance.address);
			let approval = await tradeFinance.approved.call();
			assert.equal(approval, false);
		});

		it("should set parameters correctly", async () => {
			trade = await tradeFinance.trade.call();
			assert.equal(trade.status, 0);
			// console.log(trade);
		});

		// Step 1: Buyer approval
		it("buyer should be able to approve trade params", async () => {
			tx = await tradeFinance.approveContract({
				from: buyer
			});
			let approval = await tradeFinance.approved.call();
			assert.equal(approval, true);
			trade = await tradeFinance.trade.call();
			assert.equal(trade.status, 1);

		});

		// Buyer bank / Issuing bank initiates trade by making an escrow deposit
		it("Issuing bank should be able to initiateTrade by depositing funds into an escrow", async () => {
			assert.equal(await web3.eth.getBalance(escrow), 0);
			let approval = await tradeFinance.approved.call();
			assert.equal(approval, true);

			tx = await tradeFinance.initiateTrade({
				from: buyerBank,
				value: web3.utils.toWei("15", "ether")
			});
			trade = await tradeFinance.trade.call();
			assert.equal(trade.status, 2);
			assert.equal(await web3.eth.getBalance(escrow), web3.utils.toWei("15", "ether"));
		});

		it("should require 4 met conditions before funds are made accessible to sellerBank", async () => {
			conditions = ["Captain approval", "Insurance approval", "Logistics approval", "KYC approval"];
			for (let i = 0; i < 4; i++) {
				await tradeFinance.indicateMetCondition(
					web3.utils.asciiToHex(conditions[i]),
					{ from: buyerBank }
				);
			}
			trade = await tradeFinance.trade.call();
			assert.equal(trade.status, 3);
		});

		it("should allow sellerBank to withdraw funds and conclude the trade", async () => {
			let initialBalance = await web3.eth.getBalance(sellerBank);
			tx = await tradeFinance.finalSellerBankApproval({
				from: sellerBank
			});
			// console.log(tx);
			let finalBalance = await web3.eth.getBalance(sellerBank);
			assert.equal(await web3.eth.getBalance(escrow), 0);
			assert(finalBalance > initialBalance, "error");
			// let transferred = finalBalance - initialBalance;
			// console.log(tx.receipt.gasUsed * 100);
			// assert.equal(transferred + (tx.receipt.gasUsed * 100) , web3.utils.toWei("15", "ether"));
		});
	});
});