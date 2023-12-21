import { PAIR_ERC20_ABI, UNISWAP_V2_ROUTER02_ABI, UNISWAP_V2_ROUTER02_ADDRESS } from "./config.js"
import { getProvider, getSigner } from "./init.js"
import { ethers } from "ethers"

export const createWallet = () => {
    const wallet = ethers.Wallet.createRandom()
    console.log(wallet)

    return [wallet.address, wallet.mnemonic.phrase]
}

export const getBalance = async (ca, address) => {
    const token = new ethers.Contract(
        ca,
        PAIR_ERC20_ABI.abi,
        getProvider()
    )
    const decimals = Number(await token.decimals())
    const points = decimals == 18 ? 18 : 18 - decimals
    const balance = decimals == 18 ? 
        Number(ethers.formatEther(await token.balanceOf(address))) :
        Number(ethers.formatEther(await token.balanceOf(address))) * 10**points
    console.log(await token.name(), decimals, points, balance)

    return balance
}

export const approveSwap = async (ca, phrase, spender, amount) => {
    const token = new ethers.Contract(
        ca,
        PAIR_ERC20_ABI.abi,
        getSigner(phrase)
    )
    console.log(await token.totalSupply(), await token.decimals())

    try {
        const approve = await token.approve(
            spender,
            ethers.parseEther(`${amount}`)
        )
        console.log(approve)
    } catch (err) {
        console.log(err)
    }
}

export const name = async (address) => {
    const token = new ethers.Contract(
        address,
        PAIR_ERC20_ABI.abi,
        getProvider()
    )

    console.log(await token.name())

    return await token.name()
}

export const buyToken = async (phrase, address, amount, to) => {
    const router = new ethers.Contract(
        UNISWAP_V2_ROUTER02_ADDRESS,
        UNISWAP_V2_ROUTER02_ABI,
        getSigner(phrase)
    )
    const block = await getProvider().getBlock("latest")
    const time = block.timestamp + 10000
    console.log(await router.WETH(), time, block.timestamp, amount, address, to)

    try {
        const swap = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
            ethers.parseEther("0"),
            [await router.WETH(), address],
            to,
            time,
            { 
                value : ethers.parseEther(`${amount}`)
            }
        )
        console.log(swap)
    } catch (err) {
        console.log(err)
    }
}

export const sellToken = async (phrase, address, amount, to) => {
    const router = new ethers.Contract(
        UNISWAP_V2_ROUTER02_ADDRESS,
        UNISWAP_V2_ROUTER02_ABI,
        getSigner(phrase)
    )
    const block = await getProvider().getBlock("latest")
    const time = block.timestamp + 10000
    console.log(await router.WETH(), time, block.timestamp, amount, address, to)

    try {
        const swap = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            ethers.parseEther(`${amount}`),
            ethers.parseEther("0"),
            [address, await router.WETH()],
            to,
            time
        )
        console.log(swap)
    } catch (err) {
        console.log(err)
    }
}