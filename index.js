import { Telegraf, Markup } from "telegraf"
import { addUser, updateUserWallet, addGroup, updateGroupTokens, updateGroupToken, getGroup, connectDB } from "./__db__/index.js"
import { userExists, extract, groupExists, getTokens, swapTokens } from "./controllers/index.js"
import { createWallet, getBalance, name } from "./__web3__/index.js"
import { config } from "dotenv"

config()

const URL = process.env.TG_BOT_TOKEN

const bot = new Telegraf(URL)

bot.use(Telegraf.log())

bot.command("start",  async ctx => {
    try {
        if (ctx.message.chat.type != "private") {
            const args = ctx.args

            if(args && args.length == 1) {
                const group_exists = await groupExists(ctx.chat.id)

                if(group_exists) {
                    await ctx.replyWithHTML("<b>🔰 This group has been authenticated ✅.</b>")
                } else {
                    const wallet = createWallet()
                    console.log(wallet)
                    
                    const group = await addGroup(
                        ctx.chat.id,
                        ctx.chat.title,
                        args[0],
                        wallet[0],
                        wallet[1]
                    )
                    console.log(group)

                    await ctx.replyWithHTML(`<b>Congratulations ${ctx.message.from.username} 🎉, ${ctx.chat.title} have been successfully authenticated ✅.</b>\n\n<b>A Community wallet have been created. Public Address is ${wallet[0]}. Make sure you fund the wallet ETH for signing transactions.</b>\n\n<i>🔰 Users can now shill and vote their favourite tokens.</i>\n\n<b>Powered by the Votacion bot 🤖.</b>`)
                }
            } else {
                await ctx.replyWithHTML("<b>🚨 Use the command appropriately.</b>\n\n<i>Example:\n/start 'Community Token Address'</i>\n\n<b>🚫 Make sure you enter a correct ETH addresses.</b>")
            }
        } else {
            await ctx.replyWithHTML(`<b>🚨 Add this bot to a group to use it.</b>`)
        }
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

bot.command("wallet",  async ctx => {
    try {
        if (ctx.message.chat.type != "private") {
            const group_exists = await groupExists(ctx.chat.id)

            if(group_exists) {
                const args = ctx.args

                if(args && args.length == 1) {
                    const user_exists = await userExists(ctx.message.from.id, ctx.chat.id)

                    if (!user_exists) {
                        const user = await addUser(
                            ctx.message.from.id,
                            ctx.chat.id,
                            ctx.chat.title,
                            ctx.message.from.username,
                            args[0]
                        )
                        console.log(user)
                    }

                    const group = await getGroup(ctx.chat.id)
                    const balance = await getBalance(group.token, args[0])

                    if(balance > 0) {
                        const user = await updateUserWallet(ctx.message.from.id, ctx.chat.id, args[0])
                        console.log(user)

                        await ctx.replyWithHTML(`<b>Congratulations ${ctx.message.from.username} 🎉, You have been successfully authenticated ✅. You can shill and vote tokens to be bought by the ${ctx.chat.title} Community Wallet.</b>`)
                    } else {
                        await ctx.replyWithHTML("<b>🚨 Authentication failed. You do not have sufficent balance of the Community token.</b>")   
                    }
                } else {
                    await ctx.replyWithHTML("<b>🚨 Use the command appropriately.</b>\n\n<i>Example:\n/wallet 'Your Wallet Address'</i>\n\n<b>🚫 Make sure you enter a correct ETH address.</b>")
                }
            } else {
                await ctx.replyWithHTML("<b>🚨 This group has not been authenticated 🚫.</b>")
            }
        } else {
            await ctx.replyWithHTML(`<b>🚨 Add this bot to a group to use it.</b>`)
        }
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

bot.command("buy_votes",  async ctx => {
    try {
        if (ctx.message.chat.type != "private") {
            const group_exists = await groupExists(ctx.chat.id)

            if(group_exists) {
                const user_exists = await userExists(ctx.message.from.id, ctx.chat.id)

                if(user_exists) {
                    const tokens = await getTokens("buy", ctx.chat.id)
                    console.log(tokens)

                    let markup = []

                    tokens.forEach(async (token, index) => {
                        if(index == 0) {
                            const _markup = [Markup.button.callback(`🥇 ${token.name} - ${token.votes} 🚀`, "vote")]
                            markup.push(_markup)
                        } else if(index == 1) {
                            const _markup = [Markup.button.callback(`🥈 ${token.name} - ${token.votes} 🚀`, "vote")]
                            markup.push(_markup)
                        } else if(index == 2) {
                            const _markup = [Markup.button.callback(`🥉 ${token.name} - ${token.votes} 🚀`, "vote")]
                            markup.push(_markup)
                        } else {
                            const _markup = [Markup.button.callback(`${index + 1}. ${token.name} - ${token.votes} 🎯`, "vote")]
                            markup.push(_markup)   
                        }
                    })
                    console.log(markup)

                    await ctx.replyWithHTML(
                        `<b>🏆 This is the Buy-Side token leaderboard!</b>\n\n<i>To vote for a token to be bought, use the command: /buy_vote 'Token_Contract_Address'.</i>`,
                        {
                            parse_mode : "HTML",
                            ...Markup.inlineKeyboard(markup)
                        }
                    )
                } else {
                    await ctx.replyWithHTML("<b>🚨 You have not been authenticated, hence cannot use this bot.</b>")
                }
            } else {
                await ctx.replyWithHTML("<b>🚨 This group has not been authenticated 🚫.</b>")
            }
        } else {
            await ctx.replyWithHTML(`<b>🚨 Add this bot to a group to use it.</b>`)
        }
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

bot.command("sell_votes",  async ctx => {
    try {
        if (ctx.message.chat.type != "private") {
            const group_exists = await groupExists(ctx.chat.id)

            if(group_exists) {
                const user_exists = await userExists(ctx.message.from.id, ctx.chat.id)

                if(user_exists) {
                    const tokens = await getTokens("sell", ctx.chat.id)
                    console.log(tokens)

                    let markup = []

                    tokens.forEach(async (token, index) => {
                        if(index == 0) {
                            const _markup = [Markup.button.callback(`🥇 ${token.name} - ${token.votes} 🚀`, "vote")]
                            markup.push(_markup)
                        } else if(index == 1) {
                            const _markup = [Markup.button.callback(`🥈 ${token.name} - ${token.votes} 🚀`, "vote")]
                            markup.push(_markup)
                        } else if(index == 2) {
                            const _markup = [Markup.button.callback(`🥉 ${token.name} - ${token.votes} 🚀`, "vote")]
                            markup.push(_markup)
                        } else {
                            const _markup = [Markup.button.callback(`${index + 1}. ${token.name} - ${token.votes} 🎯`, "vote")]
                            markup.push(_markup)   
                        }
                    })

                    await ctx.replyWithHTML(
                        `<b>🏆 This is the Sell-Side token leaderboard!</b>\n\n<i>To vote for a token to be sold, use the command: /sell_vote 'Token_Contract_Address'.</i>`,
                        {
                            parse_mode : "HTML",
                            ...Markup.inlineKeyboard(markup)
                        }
                    )
                } else {
                    await ctx.replyWithHTML("<b>🚨 You have not been authenticated, hence cannot use this bot.</b>")
                }
            } else {
                await ctx.replyWithHTML("<b>🚨 This group has not been authenticated 🚫.</b>")
            }
        } else {
            await ctx.replyWithHTML(`<b>🚨 Add this bot to a group to use it.</b>`)
        }
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

bot.command("buy_vote",  async ctx => {
    try {
        if (ctx.message.chat.type != "private") {
            const group_exists = await groupExists(ctx.chat.id)

            if(group_exists) {
                const user_exists = await userExists(ctx.message.from.id, ctx.chat.id)

                if(user_exists) {
                    const args = ctx.args

                    if(args && args.length == 1) {
                        const token = await updateGroupToken(args[0], ctx.chat.id)
                        console.log(token)

                        await ctx.replyWithHTML(`<b>Congratulations ${ctx.message.from.username} 🎉, You have successfully voted for ${await name(args[0])} to be bought in the next hour ✅.</b>`)
                    } else {
                        await ctx.replyWithHTML("<b>🚨 Use the command appropriately.</b>\n\n<i>Example:\n/vote 'Token_Contract_Address'</i>\n\n<b>🚫 Make sure you enter a correct ETH address.</b>")
                    }
                } else {
                    await ctx.replyWithHTML("<b>🚨 You have not been authenticated, hence cannot use this bot.</b>")
                }
            } else {
                await ctx.replyWithHTML("<b>🚨 This group has not been authenticated 🚫.</b>")
            }
        } else {
            await ctx.replyWithHTML(`<b>🚨 Add this bot to a group to use it.</b>`)
        }
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

bot.command("sell_vote",  async ctx => {
    try {
        if (ctx.message.chat.type != "private") {
            const group_exists = await groupExists(ctx.chat.id)

            if(group_exists) {
                const user_exists = await userExists(ctx.message.from.id, ctx.chat.id)

                if(user_exists) {
                    const args = ctx.args

                    if(args && args.length == 1) { 
                        const token = await updateGroupToken(args[0], ctx.chat.id)
                        console.log(token)

                        await ctx.replyWithHTML(`<b>Congratulations ${ctx.message.from.username} 🎉, You have successfully voted for ${await name(args[0])} to be sold in the next hour ✅.</b>`)
                    } else {
                        await ctx.replyWithHTML("<b>🚨 Use the command appropriately.</b>\n\n<i>Example:\n/vote 'Token_Contract_Address'</i>\n\n<b>🚫 Make sure you enter a correct ETH address.</b>")
                    }
                } else {
                    await ctx.replyWithHTML("<b>🚨 You have not been authenticated, hence cannot use this bot.</b>")
                }
            } else {
                await ctx.replyWithHTML("<b>🚨 This group has not been authenticated 🚫.</b>")
            }
        } else {
            await ctx.replyWithHTML(`<b>🚨 Add this bot to a group to use it.</b>`)
        }
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

bot.hears(/0x/, async ctx => {
    try {
        if (ctx.message.chat.type != "private") {
            const group_exists = await groupExists(ctx.chat.id)

            if(group_exists) {
                const user_exists = await userExists(ctx.message.from.id, ctx.chat.id)

                if(user_exists) {
                    if(ctx.message.text.slice(0, 3) == "Buy") {
                        const address = extract(ctx.message.text)
                        const _name = await name(address)
                        const group = await updateGroupTokens(address, ctx.chat.id, _name, ctx.message.from.username, "buy")
                        console.log(group, address)

                        await ctx.replyWithHTML(`<b>Congratulations ${ctx.message.from.username} 🎉, ${_name} have successfully been added and flagged to be bought ✅.</b>`)
                    } else if(ctx.message.text.slice(0, 4) == "Sell") {
                        const address = extract(ctx.message.text)
                        const _name = await name(address)
                        const group = await getGroup(ctx.chat.id)
                        const balance = await getBalance(address, group.address)

                        if(balance > 0) {
                            const group = await updateGroupTokens(address, ctx.chat.id, _name, ctx.message.from.username, "sell")
                            console.log(group, address)

                            await ctx.replyWithHTML(`<b>Congratulations ${ctx.message.from.username} 🎉, ${_name} have successfully been added and flagged to be sold ✅.</b>`)
                        } else {
                            await ctx.replyWithHTML("<b>🚨 This token does not exist in the community wallet, hence cannot be flagged for sale.</b>")
                        }
                    } else {
                        await ctx.replyWithHTML("<b>🚨 Enter your message appropriately.</b>\n\n<i>Example:\nBuy 'Token_Contract_Address' or Sell 'Token_Contract_Address'</i>\n\n<b>🚫 Make sure you enter a correct ETH address.</b>")
                    }
                } else {
                    await ctx.replyWithHTML("<b>🚨 You have not been authenticated, hence cannot use this bot.</b>")
                }
            } else {
                await ctx.replyWithHTML("<b>🚨 This group has not been authenticated 🚫.</b>")
            }
        } else {
            await ctx.replyWithHTML(`<b>🚨 Add this bot to a group to use it.</b>`)
        }
    } catch (err) {
        await ctx.replyWithHTML("<b>🚨 An error occured while using the bot.</b>")
        console.log(err)
    }
})

connectDB()

setInterval(swapTokens, 1000*60*3)

bot.launch()

process.once("SIGINT", () => bot.stop("SIGINT"))

process.once("SIGTERM", () => bot.stop("SIGTERM"))