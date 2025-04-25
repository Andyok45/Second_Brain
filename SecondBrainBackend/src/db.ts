import {model, Schema} from 'mongoose';
import mongoose from 'mongoose';

const UserSchema = new Schema({
   username: {type: String, unique: true},
    password: {type: String, required: true},
})

export const UserModel = model("User", UserSchema);

const ContentSchema = new Schema({
    title: {type: String, required: true},
    link: {type: String},
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    type: {type: String},
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
    x: {type: Number, required: true},
    y: {type: Number, required: true}
})

export const ContentModel = model("Content", ContentSchema);

const LinkSchema = new Schema({
    hash: {type: String},
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true},
})

export const LinkModel = model("Links", LinkSchema);