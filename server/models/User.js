const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TanakhRef = new Schema({
	book: String,
	startChapter: { type: String, required: true },
	startVerse: { type: String, required: true },
	endChapter: { type: String, required: true },
	endVerse: { type: String, required: true }
})

const userSchema = new Schema(
	{
		username: {
			type: String
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},
		role: {
			type: String,
			enum: ['admin', 'user'],
			default: 'user',
			required: true
		},
		dueDate: {
			type: Date,
			required: true
		},
		parashah: {
			type: TanakhRef,
			require: true
		},
		haftarah: {
			type: TanakhRef
		},
		recordBookmark: {
			type: Number,
			default: 0
		}
	},
	{
		timestamps: true
	}
)

module.exports = {
	User: mongoose.model('User', userSchema),
	TanakhRef
}
