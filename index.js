// Imports
import logger from "./src/lib/logger.js";
import { BigNumber, Contract, providers, utils, Wallet } from 'ethers';
import { privateKey, ETH_NODE_WSS, tokenDecimals, amountTouse, gasPrice, gasLimit, minLiquidity, slippage, priceProtection, sniperDelayBuy, enableAntiRugpull, takeProfitPct, stopLossDelay, } from "./src/lib/constants.js";
import {
    UniswapV2Factory,
    UniswapV2Router02,
    WETH9,
    ERC20ABI,
    UniswapPairABI
} from './src/abis/index.js'
import { getNonce, getTokenBalance } from "./src/lib/util.js";
import { HoneypotIsV1 } from '@normalizex/honeypot-is';
import { getPairInformationByChain } from 'dexscreener-api';
import { prompt } from 'readline-sync';
import approveToken from "./src/lib/approve.js";
import buyToken from "./src/lib/buyToken.js";
import sellTokenOnStopLoss from "./src/lib/sellOnStopLoss.js";
import monitorRugPull from "./src/lib/monitorRugPullAndSell.js";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const provider = new providers.WebSocketProvider(ETH_NODE_WSS)
const wallet = new Wallet(privateKey);
const myAddress = wallet.address;
const account = wallet.connect(provider);

const decimals = tokenDecimals;
const amountIn = utils.parseUnits(amountTouse, "ether");
const amountOutMin = utils.parseUnits(slippage, "ether");
const gassPrice = utils.parseUnits(gasPrice, "gwei");
const gassLimit = gasLimit;
let expected = parseInt(minLiquidity);
const uniRouterAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const uniFactoryAddr = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const UniversalRouterAddr = "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD";
const WETH9Addr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

const snipeToken = async () => {
    const uniRouter = new Contract(uniRouterAddr, UniswapV2Router02, account);
    const uniFactory = new Contract(uniFactoryAddr, UniswapV2Factory, account);
    logger.docs(" ----- Welcome to ASTROSNIPER BY DEXBOTSDEV -------- ")
    logger.sponsor("Connected to blockchain... ");
    logger.docs("Sniper started with current settings:");
    logger.sponsor("AMOUNT USED TO TRADE :" + amountTouse + " ETH");
    logger.docs("Buy Trade will be triggered in " + sniperDelayBuy + " seconds");
    logger.sponsor("Sell will be triggered if price goes below " + priceProtection + " %");
    logger.docs("Profit Booking if price goes above " + takeProfitPct + " %");
    logger.sponsor("Sell will be triggered if price stays stagnant for " + stopLossDelay + " seconds");
    logger.sponsor("AntiRugpull Enabled " + enableAntiRugpull);
    logger.docs("Sniper started with current settings: ");

    logger.info('Enter the Token Address')
    let tokenAddress = prompt();
    let sellContract = new Contract(tokenAddress, ERC20ABI, account);

    let delayedBuy = setTimeout(async () => {
        logger.info("Start approving token..for spend on router.");
        let tx = await approveToken(uniRouterAddr, sellContract)
        if (tx) logger.error('Approval Failed');
        else {

            const gasLimitMultiply = gasLimit
            const gasPriceMultiply = gasPrice
            let confirmation = await buyToken(tokenAddress, amountIn, gasLimitMultiply, gasPriceMultiply, myAddress, provider, uniRouter)

            if (confirmation) {
                logger.info("Sucessfully bought the token!");
                const tokenBalance = await getTokenBalance(tokenAddress, myAddress, provider);
                const pairAddress = await uniFactory.getPair(tokenAddress, WETH9Addr);
                const pairContract = new Contract(pairAddress, UniswapPairABI.abi, account);
                const lpTokenBalance = await sellContract.balanceOf(pairAddress);

                if (enableAntiRugpull) {
                    monitorRugPull(tokenBalance.toString(), tokenAddress, myAddress, provider, uniRouter)
                }
                let oldPrice = 0;
                let buyPrice = 0;
                let profitPct = 0;
                let delaySaleId = 0;
                const checkTradesToSell = setInterval(() => {

                    getPairInformationByChain("ethereum", pairAddress).then((response) => {
                        const pair = response.pair;
                        const currPrice = pair.priceUsd;
                        clearInterval(delaySaleId);
                        if (oldPrice !== 0 && currPrice !== oldPrice) {
                            profitPct = parseFloat(Number((currPrice - buyPrice) / buyPrice * 100).toFixed(2));

                            if (profitPct >= parseFloat(takeProfitPct)) {
                                logger.info('Selling to Take Profit')
                                sellTokenOnStopLoss(tokenAddress, tokenBalance.toString(), gasLimitMultiply, gasPriceMultiply, myAddress, provider, uniRouter).then((response) => {
                                    process.exit(0)
                                });
                                clearInterval(checkTradesToSell)

                            } else if (profitPct <= -parseFloat(priceProtection)) {
                                logger.info('Selling to Book stoploss')

                                sellTokenOnStopLoss(tokenAddress, tokenBalance.toString(), gasLimitMultiply, gasPriceMultiply, myAddress, provider, uniRouter).then((response) => {
                                    process.exit(0)
                                });
                                clearInterval(checkTradesToSell)

                            }
                        } else if (oldPrice !== 0 && currPrice === oldPrice || pair.volume.m5 === 0) {

                            delaySaleId = setInterval(() => {
                                logger.info('Selling to   stoploss stagnant')

                                sellTokenOnStopLoss(tokenAddress, tokenBalance.toString(), gasLimitMultiply, gasPriceMultiply, myAddress, provider, uniRouter).then((response) => {
                                    process.exit(0)
                                });
                                clearInterval(delaySaleId);
                                clearInterval(checkTradesToSell)

                            }, stopLossDelay * 1000);
                        } else if (oldPrice === 0) {
                            buyPrice = currPrice;
                        }

                        logger.warning('Current Price ' + currPrice + "  Prev Price " + oldPrice + "  Buy Price " + buyPrice + "  Profit " + profitPct);
                        oldPrice = currPrice;


                    }).catch((error) => {
                        console.log(error)
                        logger.error('Error while Price Query')
                    })
                }, 30 * 1000)

            }
        }


    }, sniperDelayBuy * 1000)


}


async function main() {

    try {
        snipeToken();

    } catch (error) {
        logger.error(new String(error))
    }
}

main();



