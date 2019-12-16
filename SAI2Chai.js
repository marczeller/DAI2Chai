async function Launcher() {
    
    //imports
    const BigNumber = require('bignumber.js')
    const myAddress = require('./MyAddress.js')['NewAccount']['address']
    const MyAccount = require('./MyAddress.js')['NewAccount']
    const Web3 = require('web3')
    const provider = require('./config.js')['config']['provider']
    const web3 = new Web3(provider)
    const threshold = require('./config.js')['config']['threshold']
    const SAIABI = require('./SAIABI.js')['SAIABI']
    const SAIAddress = require('./config.js')['config']['SAIAddress']
    const ContractSAI = new web3.eth.Contract(SAIABI, SAIAddress)
    const migrationContractAddress = require('./config.js')['config']['migrationContractAddress']
    const migrationContractABI = require('./migrateABI.js')['migrateABI']
    const Contractmigrate = new web3.eth.Contract(migrationContractABI, migrationContractAddress)
    const chaiAddress = require('./config.js')['config']['chaiAddress']
    const chaiABI = require('./chaiABI.js')['chaiABI']
    const ContractChai = new web3.eth.Contract(chaiABI, chaiAddress)
    const DAIAddress = require('./config.js')['config']['DAIAddress']
    const DAIABI = require('./DAItokenABI.js')['DAIABI']
    const ContractDAI = new web3.eth.Contract(DAIABI, DAIAddress)
    let GasPrice = await web3.eth.getGasPrice()
    GasPrice = parseInt(GasPrice) + parseInt(web3.utils.toHex(web3.utils.toWei("0.1111", "gwei")))
    GasPrice = GasPrice.toFixed(0)
    
    let addressForChai = require('./config.js')['config']['GoToAddress']
    if (addressForChai.endsWith('.eth') === true) {
        addressForChai = await web3.eth.ens.getAddress(addressForChai)
        } else { addressForChai = addressForChai}

    let nonce = await web3.eth.getTransactionCount(myAddress, "pending")
    //build first tx schema
    const rawTransaction = {
        "from": myAddress,
        "to": SAIAddress,
        "value": web3.utils.toHex(web3.utils.toWei("0", "ether")),
        "gasPrice" : GasPrice,
        "gas" : 75000,
        "chainId": 1,
        "nonce" : nonce
        }
    
    async function SAIBalanceCheck(){
        // check if address has at least 20 SAI
        if (await ContractSAI.methods.balanceOf(myAddress).call() < web3.utils.fromWei('20', 'ether')) {
            console.log('Not enough SAI for migration, waiting for more deposit...')
            setTimeout(Launcher, 300000)
        } else {
            checkSAIAllowance()
        }
    }

    async function checkSAIAllowance(){
        if (await ContractSAI.methods.allowance(myAddress, migrationContractAddress).call() === '0') {
            // set max allowance for the migration contract
            bigAllowance = new BigNumber('115792089237316195423570985008687907853269984665640564039457584007913129639934').toFixed(0)
            rawTransaction.data = ContractSAI.methods.approve(migrationContractAddress, bigAllowance).encodeABI()
            signedTx = await MyAccount.signTransaction(rawTransaction)
            sendTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            .on('receipt', console.log)
            delete rawTransaction.nonce
            nonce ++
            rawTransaction.nonce = nonce
            setTimeout(Launcher, 180000)
        } else {
            SAItoDAI()
        }
        }
    async function DAIBalanceCheck(){
        if (await ContractDAI.methods.balanceOf(myAddress).call() < threshold){
            console.log('Not enough DAI for conversion, waiting for more deposit...')
            setTimeout(Launcher, 300000)
        } else {
            checkChaiAllowance()
            }
        }

    async function SAItoDAI() {
        
        const SAIToSend = await ContractSAI.methods.balanceOf(myAddress).call()
        
        // convert SAI to DAI
        rawTransaction.data = Contractmigrate.methods.swapSaiToDai(SAIToSend).encodeABI()
        rawTransaction.to = migrationContractAddress
        rawTransaction.gas = 700000
        signedTx = await MyAccount.signTransaction(rawTransaction)
        sendTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        .on('receipt', console.log)
        delete rawTransaction.nonce
        nonce++
        rawTransaction.nonce = nonce
        console.log('SAI converted to DAI, converting DAI into chai now...')
        setTimeOut(DAIBalanceCheck, 300000)
    }


    async function checkChaiAllowance() {
        if (await ContractDAI.methods.allowance(myAddress, chaiAddress) === '0') {
            // set max allowance for chai Contract
            bigAllowance = new BigNumber('115792089237316195423570985008687907853269984665640564039457584007913129639934')
            rawTransaction.data = ContractDAI.methods.approve(chaiAddress, bigAllowance).encodeABI()
            signedTx = await MyAccount.signTransaction(rawTransaction)
            sendTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            .on('receipt', console.log)
            delete rawTransaction.nonce
            nonce++
            rawTransaction.nonce = nonce
            setTimeout(Launcher, 10000)
        } else {
            DAItoChai()
        }
    }

    async function DAItoChai() {
        // converting DAI to Chai
        const DAIToSend = await ContractDAI.methods.balanceOf(myAddress).call()
        delete rawTransaction.data
        rawTransaction.to = chaiAddress
        rawTransaction.gas = 500000
        rawTransaction.data = await ContractChai.methods.join(myAddress, DAIToSend).encodeABI()

        signedTx = await MyAccount.signTransaction(rawTransaction)
        sendTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        .on('receipt', console.log)
        delete rawTransaction.nonce
        nonce++
        rawTransaction.nonce = nonce
        console.log('DAI converted to chai, sending chai to storage address now...')
        setTimeout(sendToStorage, 100000)
    }

    async function sendToStorage() {
        chaiBalance = await ContractChai.methods.balanceOf(myAddress).call()
        delete rawTransaction.data
        delete rawTransaction.to
        rawTransaction.to = chaiAddress
        rawTransaction.gas = 70000
        rawTransaction.data = await ContractChai.methods.transfer(addressForChai, chaiBalance).encodeABI()

        signedTx = await MyAccount.signTransaction(rawTransaction)
        sendSignedTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        .on('receipt', console.log) 

        console.log("Chai sent to Storage, waiting for next deposit...")
        setTimeout(Launcher, 100000)
    }
SAIBalanceCheck()
DAIBalanceCheck()
}

Launcher()
