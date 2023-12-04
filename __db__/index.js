import { connect } from "mongoose"
import { GroupModel, UserModel } from "./models/index.js"
import { config } from "dotenv"

config()

const URI = process.env.MONGO_URI

export const connectDB = async () => {
    try {
        await connect(`${URI}`)
        console.log("Connection to the Database was successful.")
    } catch(err) {
        console.log(err)
    }
}

export const getUser = async (userId, groupId) => {
    try {
        const user = await UserModel.findOne({ userId, groupId })

        return user
    } catch (err) {
        console.log(err)
    }
}

export const getGroup = async (groupId) => {
    try {
        const group = await GroupModel.findOne({ groupId })

        return group
    } catch (err) {
        console.log(err)
    }
}

export const getGroups = async () => {
    try {
        const group = await GroupModel.find()
        return group
    } catch (err) {
        console.log(err)
    }
}

export const addUser = async (userId, groupId, group, username, wallet) => {
    try {
        const user = new UserModel({
            userId,
            groupId,
            group,
            username,
            wallet
        })

        const data = await user.save()

        return data
    } catch (err) {
        console.log(err)
    }
}

export const addGroup = async (groupId, group, token, wallet) => {
    try {
        const _group = new GroupModel({
            groupId,
            group,
            token,
            wallet,
            tokens : []
        })

        const data = await _group.save()

        return data
    } catch (err) {
        console.log(err)
    }
}

export const updateUserWallet = async (userId, groupId, wallet) => {
    try {
        const user = await UserModel.findOneAndUpdate({ userId, groupId }, {  $set : { wallet } })

        return user
    } catch (err) {
        console.log(err)
    }
}

export const updateGroupTokens = async (address, groupId, name, username, flag) => {
    try {
        const token = {
            address,
            name,
            shilledBy : username,
            flag
        }
        const group = await GroupModel.findOneAndUpdate(
            { groupId },
            { $push : { tokens : [token] } }
        )

        return group
    } catch (err) {
        console.log(err)
    }
}

export const updateGroupToken = async (address, groupId) => {
    try {
        const group = await GroupModel.findOneAndUpdate(
            { groupId, tokens : { $elemMatch : { address } } },
            { $inc : { "tokens.$.votes" : 1 } }
        )

        return group
    } catch (err) {
        console.log(err)
    }
}

export const deleteUser = async (userId, groupId) => {
    try {
        const user = await UserModel.deleteOne({ userId, groupId })

        return user
    } catch (err) {
        console.log(err)
    }
}

export const deleteGroup = async (groupId) => {
    try {
        const group = await GroupModel.deleteOne({ groupId })

        return group
    } catch (err) {
        console.log(err)
    }
}