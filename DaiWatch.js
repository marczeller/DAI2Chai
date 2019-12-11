async function Launcher() {
    
    //imports

    const myAddress = require('./MyAddress.js')['NewAccount']['address']
    const MyAccount = require('./MyAddress.js')['NewAccount']
    const Web3 = require('web3')
    const provider = require('./config.js')['config']['provider']
    const web3 = new Web3(provider)
    const DAIABI = require('./DAItokenABI.js')['DAIABI']
    const DAIAddress = require('./config.js')['config']['DAIAddress']
    const ContractDAI = new web3.eth.Contract(DAIABI, DAIAddress)
    
    // check if address have some DAI
    const DAIToSend = await ContractDAI.methods.balanceOf(myAddress).call()
    const DAISent = web3.utils.fromWei(DAIToSend)
    const chaiAddress = require('./config.js')['config']['chaiAddress']
    const chaiABI = require('./chaiABI.js')['chaiABI']
    const contractChai = new web3.eth.Contract(chaiABI, chaiAddress)
    const addressForChai = require('./config.js')['config']['GoToAddress']
    const threshold = require('./config.js')['config']['threshold']
    
    // if address doesn't have DAI let's wait...
    if (DAIToSend < web3.utils.toWei(threshold, "ether")) {
        console.log("Not enough balance to send!, let's wait for some deposit.")
        setTimeout(Launcher, 10000)
        
    } else {

        console.log("Sending %s DAI now !!!",  DAISent)
        // create and send the DAI -> CHAI transaction

        const GasPrice = await web3.eth.getGasPrice()
        let nonce = await web3.eth.getTransactionCount(myAddress, "pending")
        const rawTransaction = {
        "from": myAddress,
        "to": chaiAddress,
        "value": web3.utils.toHex(web3.utils.toWei("0", "ether")),
        "gasPrice" : GasPrice,
        "gas" : 220000,
        "chainId": 1,
        "nonce" : nonce
        }
        
        rawTransaction.data = await contractChai.methods.join(myAddress, DAIToSend).encodeABI()
        signedTx = await MyAccount.signTransaction(rawTransaction)
        console.log("Converting DAI to Chai...")
        /// FIXME check if .on Receipt makes sendSecondTX() wrapping not useful
        sendTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        .on('receipt', console.log)
        
        async function sendSecondTx(){
            if (await web3.eth.getTransactionReceipt(sendTx['transactionHash']) === null) {
                /// waiting for first Tx to be mined
                setTimeout(sendSecondTx, 10000)
    
            } else {
                // check the amount of DAI then sent it to second wallet
                
                chaiBalance = await contractChai.methods.balanceOf(myAddress).call()
                delete rawTransaction.data
                rawTransaction.data = await contractChai.methods.transfer(addressForChai, chaiBalance).encodeABI()
                rawTransaction.gas = 70000
                delete rawTransaction.nonce
                nonce ++
                rawTransaction.nonce = nonce
                signedTx = await MyAccount.signTransaction(rawTransaction)
                sendSignedTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction) 

                console.log("Chai sent, waiting for next deposit...")
        }}
        // if you don't care about sending the chai elsewhere, just comment sendSecondTx() with //
        sendSecondTx()
        setTimeout(Launcher, 3000)
    }
}
Launcher()
