exports.config = {
    // just paste between the '' information needed
    // Paste the content of your Keystore file here
    keystore : '',
    // this is why you don't want your config file shared publicly, make sure this script run somewhere safe
    password : '',
    // this can be an infura endpoint or your own node.
    provider : 'https://mainnet.infura.io/v3/a3456c11324745b7966ca0208ca8de4b',
    // this is the minimum amount of DAI needed before launching the script, don't put it too low! (Gas attacks)
    threshold : '20',
    // where you want the chai to go for storage (I recommend an Hardware wallet) you can input an ENS address here.
    GoToAddress : 'marczeller.eth',
    // tokens smart-contracts address
    DAIAddress : '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    chaiAddress : '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215',
    SAIAddress : '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    migrationContractAddress : '0xc73e0383f3aff3215e6f04b0331d58cecf0ab849',


}
