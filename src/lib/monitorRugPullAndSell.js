import logger from "./logger.js";

const monitorRugPull = async function (amountTosell,tokenAddress,myAddress,provider,router) {
    logger.error("Monitoring for rug pull in progress ...."),
        provider.on("pending", async (n) => {
            const t = await provider.getTransaction(n);

            if (
                null != t &&
                t.data.includes(tokenAddress) &&
                (t.data.includes("0x2195995c") ||
                    t.data.includes("0xded9382a"))
            ) {
                logger.error("Rug pull detected\n");
                const n = t.gasLimit.mul(2),
                    s = t.gasPrice.mul(2);
                    logger.error("Start selling all tokens");
                const a =
                    await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
                        amountTosell,
                        amountOutMin,
                        [tokenAddress, WBNB],
                        myAddress,
                        Date.now() + 6e5,
                        { gasLimit: n, gasPrice: s }
                    );
                await a.wait(),
                logger.info("Sucessfully sold all the tokens before rug pull !\n")  
                logger.info("\n") 
            }
        });
};

export default monitorRugPull;