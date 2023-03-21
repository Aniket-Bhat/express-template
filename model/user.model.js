const mongoose = require('mongoose')
const Schema = mongoose.Schema
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/


const UserSchema = new mongoose.Schema(
	{
		name: { type: String },
		emailID: {
			type: String,
			unique: true,
			required: true,
      validate: {
        validator: ()=> emailRegex.test(this.emailID),
        message: 'Invalid Email pattern'
      } 
		},
		username: {
			type: String,
			unique: true,
			required: true,
      validate: {
        validator: ()=> this.username.length >4 && this.username.length <16 && this.username.indexOf('-') > 0,
        message: 'Invalid username pattern'
      } 
		},
		age: { type: Number, min:14, max:99 },
		profileImage: { type: String },
		reputation: { type: String },
		about: { type: String },
		totalUpvotes: { type: Number },
		totalDownvotes: { type: Number },
		questions: { type: Array },
		answers: { type: Array },
		saved: { type: Object },
		lastLogin: { type: Number, default: Date.now() },
	},
	{
		timestamps: true,
	}
)

const model = mongoose.model('User', UserSchema)

module.exports = model
