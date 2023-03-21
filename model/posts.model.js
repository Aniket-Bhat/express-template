const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema(
	{
		user_id: { type: String, required: true },
		title: { 
      type: String, 
      required: true,
      validate: {
        validator:()=> this.title.length > 20 && this.title.length < 200 ,
        message: 'Title must be 20-200 characters'
      },
    },
		body: { type: String, required: true },
		tags: { type: Array },
		finalAns: { type: String },
		username: { type: String },
		upvotes: { type: Array },
		downvotes: { type: Array },
		tallyVotes: { type: Number },
		lastEditedDate: { type: Date },
		answers: { type: Array },
		totalAnswers: { type: Number },
	},
	{
		timestamps: true,
	}
)

PostSchema.index(
	{ body: 'text', title: 'text' },
	{
		weights: {
			body: 5,
			title: 7,
		},
	}
)

const model = mongoose.model('Posts', PostSchema)

module.exports = model
