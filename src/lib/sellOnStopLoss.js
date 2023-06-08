"use strict";
import retry from "async-retry";
import logger from "./logger.js";
import { getNonce } from "./util.js";

const sellSettings = {
    buyDelay: 1,
    buyRetries: 3,
    retryMinTimeout: 250,
    retryMaxTimeout: 3000,
    deadline: 60,
};
const WETH9Addr="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

const sellTokenOnStopLoss=async(token, saleAmount, gasLimit, gasPrice, myAddress,provider, router)=> {
    const sellPair = {
        pair: [
            WETH9Addr,
            token.toString()
        ]
    }
    const tx = await retry(
        async () => {
            logger.info(`Selling ${token}`)
            const amountOutMin = 0;
            let nonce = await getNonce(provider,myAddress);

            let sellConfirmation = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
                saleAmount,
                amountOutMin,
                sellPair.pair,
                myAddress,
                Date.now() + 6e5,
                {
                    gasLimit: gasLimit,
                    gasPrice: gasPrice,
                    nonce:nonce+1,
                }
            );
             
            return sellConfirmation;
        },
        {
            retries: sellSettings.buyRetries,
            minTimeout: sellSettings.retryMinTimeout,
            maxTimeout: sellSettings.retryMaxTimeout,
            onRetry: (err, number) => {
                logger.info("Sell Failed - Retrying", number);
                logger.info("Error", err.reason);
                if (number === sellSettings.buyRetries) {
                    logger.info("Stoploss Sniping has failed...");
                    logger.info("")
                }
            },
        }
    );
    logger.info(`Sold ${token}!`);
    logger.info("  Transaction receipt: https://etherscan.io/tx/" + tx.hash);
 
    logger.info("")
    return tx.hash;
 };

export default  
    sellTokenOnStopLoss
