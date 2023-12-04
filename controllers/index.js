import { getGroup, getGroups, getUser } from "../__db__/index.js"
import { WETH } from "../__web3__/config.js"
import { buyToken, getBalance, sellToken } from "../__web3__/index.js"

export const userExists = async (userId, groupId) => {
    const user = await getUser(userId, groupId)
    console.log(user)

    return user ? true : false
}

export const groupExists = async (groupId) => {
    const group = await getGroup(groupId)
    console.log(group)

    return group ? true : false
}

export const extract = (str) => {
    const startIndex = str.indexOf("0x")
    const endIndex = startIndex + 42
    console.log(startIndex, endIndex)

    const address = str.slice(startIndex, endIndex)

    return address
}

export const getTokens = async (flag, groupId) => {
    const group = await getGroup(groupId)
    console.log(group)

    const tokens = group.tokens.filter(token => token.flag == flag)
    console.log(tokens.sort((a, b) => b.votes - a.votes))

    return tokens.sort((a, b) => b.votes - a.votes)
}

export const swapTokens = async () => {
    const groups = await getGroups()
    console.log(groups)

    groups.forEach(async group => {
        const buy_tokens = await getTokens("buy", group.groupId)
        console.log(buy_tokens)

        if(buy_tokens.length > 0) {
            const balance = await getBalance(WETH, group.wallet)
            await buyToken(
                buy_tokens[0].address,
                Math.floor(balance * 0.25),
                group.wallet
            )
        }

        const sell_tokens = await getTokens("sell", group.groupId)
        console.log(sell_tokens)

        if(sell_tokens.length > 0) {
            const balance = await getBalance(sell_tokens[0].address, group.wallet)
            await sellToken(
                sell_tokens[0].address,
                Math.floor(balance * 0.25),
                group.wallet
            )
        }
    })
}