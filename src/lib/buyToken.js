"use strict";
import retry from "async-retry";
import logger from "./logger.js";
import { getNonce } from "./util.js";

const buySettings = {
    buyDelay: 1,
    buyRetries: 3,
    retryMinTimeout: 250,
    retryMaxTimeout: 3000,
    deadline: 60,
};
const WETH9Addr="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

const buyToken =async(token, purchaseAmount, gasLimit, gasPrice, myAddress,provider, router)=> {
    const buyPair = {
        pair: [
            WETH9Addr,
            token.toString()
        ]
    }
    const tx = await retry(
        async () => {
            logger.info(`Buying ${token}`)
            const amountOutMin = 0;
            let nonce = await getNonce(provider,myAddress);

            let buyConfirmation = await router.swapExactETHForTokens(
                amountOutMin,
                buyPair.pair,
                myAddress,
                Date.now() + 1000 * buySettings.deadline,
                {
                    value: purchaseAmount,
                    gasLimit: gasLimit,
                    gasPrice: gasPrice,
                    nonce:nonce+1
                }
            );
            return buyConfirmation;
        },
        {
            retries: buySettings.buyRetries,
            minTimeout: buySettings.retryMinTimeout,
            maxTimeout: buySettings.retryMaxTimeout,
            onRetry: (err, number) => {
                logger.info("Buy Failed - Retrying", number);
                logger.info("Error", err.reason);
                if (number === buySettings.buyRetries) {
                    logger.info("Sniping has failed...");
                    logger.info("")
                }
            },
        }
    );
    logger.info(`Bought ${token}!`);
    logger.info("  Transaction receipt: https://etherscan.io/tx/" + tx.hash);
 
    logger.info("")
    return tx.hash;
 };

export default   buyToken;
