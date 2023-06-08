import { config } from "dotenv";
const env = config();
const privateKey = process.env.privateKey;
const ETH_NODE_WSS = process.env.ETH_NODE_WSS;
const ETH_NODE_HTP = process.env.ETH_NODE_HTP;
const tokenDecimals = process.env.tokenDecimals
const amountTouse = process.env.amountTouse;
const slippage = process.env.slippage;
const gasPrice = process.env.gasPrice;
const gasLimit = process.env.gasLimit;
const gasMultiplier = process.env.gasMultiplier;
const stopLossDelay = process.env.stopLossDelay;
const priceProtection = process.env.priceProtection;
const enableAntiRugpull=process.env.enableAntiRugpull;
const sniperDelayBuy=process.env.sniperDelayBuy;
const approveAuto = process.env.approveAuto;
const onlyBuyMode = process.env.onlyBuyMode;
const takeProfitPct = process.env.takeProfitPct; 
const waitForLiquidity = process.env.waitForLiquidity;
const minLiquidity = process.env.minLiquidity; 

export {
    privateKey ,
    ETH_NODE_WSS,
    ETH_NODE_HTP ,
    tokenDecimals, 
    amountTouse ,
    slippage,
    gasPrice,
    gasLimit ,
    gasMultiplier , 
    stopLossDelay , 
    priceProtection ,
    approveAuto ,
    onlyBuyMode ,
    takeProfitPct ,
    enableAntiRugpull, 
    minLiquidity ,
    sniperDelayBuy
}