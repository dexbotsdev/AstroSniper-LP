import { BigNumber, Contract,  providers,utils ,Wallet } from 'ethers';

async function getNonce(provider,e) {
    return await provider.getTransactionCount(e);
}


async function getTokenBalance(e, o, n) {
    const t = new Contract(
        e,
        [
            {
                name: "balanceOf",
                type: "function",
                inputs: [{ name: "_owner", type: "address" }],
                outputs: [{ name: "balance", type: "uint256" }],
                constant: !0,
                payable: !1,
            },
        ],
        n
    );
    return await t.balanceOf(o);
}


export {
    getNonce,
    getTokenBalance
}