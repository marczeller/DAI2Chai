# DAI2Chai
Js script automating DAI to Chai conversion.

The script collect some DAI or SAI in a address and automaticaly convert it to CHAI, an interest-bearing token linked to MakerDAO Dai Saving Rate.

then Chai is sent to the address defined for storage *I recommend a Hardware Wallet such as a Ledger*

# Setup

`git clone https://github.com/marczeller/DAI2Chai.git`

`cd DAI2Chai`

`npm install`

then edit the `config.js` file with your credentials.

`node DAI2Chai.js`

you can visit the offical Chai token website on [chai.money](chai.money)

# Security

this bot have access to your funds, I **Highly** recommend to setup the script on a dedicated reception address , fill it with a small amount of ETH to pay gas and fill another address as your `GoToAddress` in `config.js`

Also, avoid running this script in a public VPS, use some self hosted device!

Another vector of attack is trolls sending you very small amount of DAI to make you waste your ETH for transaction fees. make sure the `Threshold` in the `config.js` is not set too low.
