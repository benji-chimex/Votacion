import { Schema, model } from "mongoose"

const UserSchema = new Schema({
    userId : { type : Number, required : true },
    groupId : { type : Number, required : true },
    group : String,
    username : String,
    wallet : String
})

const GroupSchema = new Schema({
    groupId : { type : Number, required : true },
    group : String,
    token : String,
    address : String,
    phrase : String,
    tokens : [
        {
            address : String,
            name : String,
            votes : { type : Number, default : 0 },
            shilledBy : String,
            flag : { type : String, enum : ["buy", "sell"] },
        }
    ]
})

export const UserModel = model("User", UserSchema)

export const GroupModel = model("Group", GroupSchema)