import { ethers } from "ethers"
import { config } from "dotenv"

config()

export const getProvider = () => {
    return new ethers.JsonRpcProvider(process.env.GOERLI_API_URL)
}

export const getSigner = (phrase) => {
    return ethers.Wallet.fromPhrase(phrase)
}