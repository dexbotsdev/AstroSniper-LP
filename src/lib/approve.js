"use strict";
import { constants } from "ethers";
import { config } from "dotenv";
import logger from "./logger.js";

const result = config()

if (result.error) {
    throw result.error
}
 
const approveToken = async (uniRouterAddr,sellContract) => {
    const tokenName = await sellContract.name();

    logger.info(`Approving ${tokenName}`)  
try{
    const tx = await sellContract.approve(uniRouterAddr, constants.MaxUint256);
    const receipt = await tx.wait();
    logger.info("Approved " + tokenName + "!");
    logger.info("  Transaction receipt: https://etherscan.io/tx/" + receipt.transactionHash); 
    return receipt.transactionHash;
}catch(error){
    
    return false;
}
   
};

export default  approveToken;
