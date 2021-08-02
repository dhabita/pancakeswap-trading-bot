
//SETTING TOKEN TO TRADE

var pancakeswap_lp_token = '0x0511e110c536558db3dde405cd334621ca881221'; //PANCAKE_LP_BUSD
var token_contract       = '0x58d6f302aaf33dd30a7666e16909db3c5c74021b'; //TOKEN_TO_TRADE
var buy_amount = 25;
var sell_amount =2500;
var buy_price = 0.018;
var sell_price = 0.02;
   

const Web3 = require('web3'); 
const abi  = require('./abi'); 
require("dotenv").config();
var ENV = process.env;
var serverbnb = "https://bsc-dataseed1.defibit.io";
var my_addr = ENV.MY_ADDR;
var router = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
var busd ='0xe9e7cea3dedca5984780bafc599bd69add087d56';
const web3 = new Web3(serverbnb);
 
 
var busd_balance =0;
let deadline = 0;
var rate = {};
var rate_coin = 0;

var router_abi = abi.router;


    const myAccount = async () => {
        try {
            return web3.eth.accounts.privateKeyToAccount(ENV.PRIVATE_KEY);
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    
    var AAA = {
            getrate: async function(c){
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
                        rate_coin = (resp[1] / resp[0]);
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
                        r =resp;
                        // AAA.getBalance(co, resp ,  );
                        //   price1['global_lp'][pid]=resp/(10**setting.pid[pid].digits);
                    });
                } catch (error) {
        
                }
        
        return r;
        
        
            },
            balance: async function(co,addr,decimal) {
        
                const web3 = new Web3(serverbnb);
        var r = 0;
                try {
                
                    var contract = new web3.eth.Contract(abi.erc20, co);
                    await contract.methods.balanceOf(addr).call().then(function(resp) {
                        //console.log(resp);
                        if(resp>0)
                        r =resp / (10 ** decimal);
                        // AAA.getBalance(co, resp ,  );
                        //   price1['global_lp'][pid]=resp/(10**setting.pid[pid].digits);
                    });
                } catch (error) {
        
                }
        
        return r;
        
        
            },
            getDeadline: async () => {
        
        
                await web3.eth.getBlock('latest', (error, block) => {
                    deadline = block.timestamp + 300; // transaction expires in 300 seconds (5 minutes)
                    deadline = web3.utils.toHex(deadline);
                });
        
        
            },
            dead: async () => {
                await AAA.getDeadline();
                console.log(deadline);
            },
            buy: async (amount) => {
        
                    var contract = new web3.eth.Contract(router_abi, router);
                    let swap, encodedABI, tx, account, gas, gasPrice, amountETH, signedTx;
        
                    
                    try {
        
        
                        var am = web3.utils.toWei(amount.toString(), 'ether');
                        await AAA.getDeadline();
                        swap = contract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                            am, 0,
                            [busd, token_contract],
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
            sell: async (amount) => {
                    var contract = new web3.eth.Contract(router_abi, router);
                    let swap, encodedABI, tx, account, gas, gasPrice, amountETH, signedTx;
        

 
                    try {
        
        
                        var am = web3.utils.toWei(amount.toString(), 'ether');
                        await AAA.getDeadline();
                        swap = contract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                            am, 0,
                            [token_contract, busd],
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
 
  




var runing = async function(){

            pause = 0;
            var rate   = await AAA.getrate(pancakeswap_lp_token);
            //var supply = await AAA.getSupply(pancakeswap_lp_token);
            var balance_busd = await AAA.balance(busd,my_addr,18);
            var balance_token = await AAA.balance(token_contract,my_addr,18);

            rate   = (rate*1).toFixed(8);
            //supply = (supply*1);
            balance_busd = (balance_busd*1).toFixed(8);
            balance_token = (balance_token*1).toFixed(8);


            console.log(rate);
            //console.log(supply);
            console.log(balance_busd);
            console.log(balance_token);

            
            
            
            if(rate >0){console.log("a");} else return;

            
            if(rate>sell_price && balance_token>=sell_amount){ console.log("sell"); AAA.sell(sell_amount); }   
            if(rate<buy_price  && balance_token>=buy_amount ){ console.log("buy"); AAA.buy(buy_amount); } 
            
           
        }

  setInterval(runing,30000);
  runing();
 
 
 

