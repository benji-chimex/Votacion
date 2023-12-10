import { ethers } from "ethers"
import { config } from "dotenv"

config()

export const getProvider = () => {
    return new ethers.JsonRpcProvider(process.env.MAINNET_API_URL)
}

export const getSigner = () => {
    return new ethers.Wallet(process.env.PRIVATE_KEY, getProvider())
}