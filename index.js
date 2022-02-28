//SETTING TOKEN TO TRADE

var pancakeswap_lp_token = '0x14E5C9b5CB59d2Af6D121Bbf5a322c6fE9F18657'; //PANCAKE_LP_BUSD
var token_contract = '0x6cC76132A84e2095c1F4f2EA71881dAEf8a75D5e'; //TOKEN_TO_TRADE
var buy_amount = 50;
var sell_amount = 100;
var buy_price1 = 0.5;
var sell_price = 0.75;




const Web3 = require('web3');
const abi = require('./abi');
require("dotenv").config();
var ENV = process.env;
var serverbnb = "https://bsc-dataseed1.defibit.io";
var my_addr = ENV.MY_ADDR;
var router = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
var busd = '0x55d398326f99059fF775485246999027B3197955';
const web3 = new Web3(serverbnb);



let deadline = 0;
var rate = {};
var rate_coin = 0;

var router_abi = abi.router;


const myAccount = async() => {
    try {
        return web3.eth.accounts.privateKeyToAccount(ENV.PRIVATE_KEY);
    } catch (err) {
        console.log(err);
        return false;
    }
}
let NONCE = 0;
var AAA = {
    nonce: async function() {

        let LASTNONCE = await web3.eth.getTransactionCount(
            my_addr
        );
        NONCE = LASTNONCE - 1;

    },
    getrate: async function(c) {
        const web3 = new Web3(serverbnb);
        var abi = [{
            "constant": true,
            "inputs": [],
            "name": "getReserves",
            "outputs": [{
                "internalType": "uint112",
                "name": "_reserve0",
                "type": "uint112"
            }, {
                "internalType": "uint112",
                "name": "_reserve1",
                "type": "uint112"
            }, {
                "internalType": "uint32",
                "name": "_blockTimestampLast",
                "type": "uint32"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }];
        rate_coin = 0;
        try {
            var contract = new web3.eth.Contract(abi, c);
            await contract.methods.getReserves().call().then(function(resp) {
                rate_coin = (resp[0] / resp[1]);
                // console.log(rate_coin);
                // return rate_coin;
                // d(rate_coin);
            });
        } catch (error) {
            //  d(0);

        }

        return rate_coin;
    },
    getSupply: async function(co) {

        const web3 = new Web3(serverbnb);
        var r = 0;
        try {

            var contract = new web3.eth.Contract(abi.erc20, co);
            await contract.methods.totalSupply().call().then(function(resp) {
                //console.log(resp);
                r = resp;
                // AAA.getBalance(co, resp ,  );
                //   price1['global_lp'][pid]=resp/(10**setting.pid[pid].digits);
            });
        } catch (error) {

        }

        return r;


    },
    balance: async function(co, addr, decimal) {

        const web3 = new Web3(serverbnb);
        var r = 0;
        try {

            var contract = new web3.eth.Contract(abi.erc20, co);
            await contract.methods.balanceOf(addr).call().then(function(resp) {
                //console.log(resp);
                if (resp > 0)
                    r = resp / (10 ** decimal);
                // AAA.getBalance(co, resp ,  );
                //   price1['global_lp'][pid]=resp/(10**setting.pid[pid].digits);
            });
        } catch (error) {

        }

        return r;


    },
    getDeadline: async() => {


        await web3.eth.getBlock('latest', (error, block) => {
            deadline = block.timestamp + 900; // transaction expires in 300 seconds (5 minutes)
            deadline = web3.utils.toHex(deadline);
        });


    },
    dead: async() => {
        await AAA.getDeadline();
        console.log(deadline);
    },
    buy: async(amount, amountOutMin) => {

        var contract = new web3.eth.Contract(router_abi, router);
        let swap, encodedABI, tx, account, gas, gasPrice, amountETH, signedTx;


        try {


            var am = web3.utils.toWei(amount.toString(), 'ether');
            amountOutMin = web3.utils.toWei(amountOutMin.toString(), 'ether');
            await AAA.getDeadline();
            swap = contract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                am, amountOutMin, [busd, token_contract],
                my_addr,
                deadline
            );


            encodedABI = swap.encodeABI();

            // gas = await web3.eth.estimateGas({
            //     to: data.YOUR_ADDRESS,
            //     data: encodedABI
            // });

            gasPrice = await web3.eth.getGasPrice();
            //amountETH = web3.utils.toWei(amount.toString(), 'ether');
            //console.log(amountETH);
            tx = {
                from: my_addr,
                to: router,
                data: encodedABI,
                gas: 500000,
                gasPrice: gasPrice,
                value: 0,
            };



            account = await myAccount();
            signedTx = await account.signTransaction(tx);

            console.log(' SEND BUY  ');

            return web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                .on('transactionHash', (hash) => {
                    console.log(`hash : https://bscscan.com/tx/${hash}`);
                })
                .on('error', (error => {
                    console.log(JSON.stringify(error));
                }));
        } catch (err) {
            console.log(JSON.parse(JSON.stringify(err)));
        }
    },
    sell: async(amount) => {

        var contract = new web3.eth.Contract(router_abi, router);
        let swap, encodedABI, tx, account, gas, gasPrice, amountETH, signedTx;



        try {


            var am = web3.utils.toWei(amount.toString(), 'ether');
            await AAA.getDeadline();
            swap = contract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                am, 0, [token_contract, busd],
                my_addr,
                deadline
            );


            encodedABI = swap.encodeABI();

            // gas = await web3.eth.estimateGas({
            //     to: data.YOUR_ADDRESS,
            //     data: encodedABI
            // });

            gasPrice = await web3.eth.getGasPrice();
            //amountETH = web3.utils.toWei(amount.toString(), 'ether');
            //console.log(amountETH);
            NONCE++;
            tx = {
                from: my_addr,
                to: router,
                data: encodedABI,
                gas: 500000,
                gasPrice: gasPrice,
                value: 0,
                nonce: NONCE
            };



            account = await myAccount();
            signedTx = await account.signTransaction(tx);

            console.log(' SEND SELL  ');

            return web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                .on('transactionHash', (hash) => {
                    console.log(`hash : https://bscscan.com/tx/${hash}`);
                })
                .on('error', (error => {
                    console.log(JSON.stringify(error));
                }));
        } catch (err) {
            console.log(JSON.parse(JSON.stringify(err)));
        }
    }

}




var event = async function() {
    var contract = new web3.eth.Contract(abi.erc20, token_contract);
    let block = await web3.eth.getBlockNumber();
    try {

        console.log(block)
        contract.getPastEvents('Transfer', {
                filter: {},
                fromBlock: block - 120,
                toBlock: block
            }, function(error, events) {})
            .then(async function(events) {

                console.log(events);

                console.log("EVENTS", events.length);
                if (events.length == 0) runing(0);
                else
                    runing(1);

            });


    } catch (error) {
        console.log(error);
    }

}



var runing = async function(send) {



    pause = 0;
    var rate = await AAA.getrate(pancakeswap_lp_token);
    //var supply = await AAA.getSupply(pancakeswap_lp_token);
    var balance_busd = await AAA.balance(busd, my_addr, 18);
    var balance_token = await AAA.balance(token_contract, my_addr, 18);

    rate = (rate * 1).toFixed(8);
    balance_busd = (balance_busd * 1).toFixed(8);
    balance_token = (balance_token * 1).toFixed(8);
    console.log("Rate", rate);
    console.log("Bal USDT", balance_busd);
    console.log("Bal NBG", balance_token);


    await AAA.nonce();

    if (rate > 0) {} else return;



    let USDTAMOUNT = Math.random() * 30 + 20;
    let BUYPRICE = 1;
    let SELLPRICE = 1.3;

    let USDTAMOUNTS = Math.random() * 100 + 300;


    if (send == 1)
        if (balance_token >= USDTAMOUNTS / rate)
            if (rate > SELLPRICE) {
                console.log("sell");
                AAA.sell(USDTAMOUNTS / rate);
            }



    if (send == 0)
        if (balance_busd >= USDTAMOUNT)
            if (rate < BUYPRICE) {
                console.log("buy");
                let amountOutMin = USDTAMOUNT / rate * 0.99;
                AAA.buy(USDTAMOUNT, amountOutMin);
            }


}

setInterval(event, 30000);
event();