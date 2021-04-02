import mongoose from 'mongoose'

export type UserType = mongoose.Document & 
{
	id: number
	processedMessages: number[]
	stage: number
	products: string[]
	startedAt: string // Date
}

const UserSchema = new mongoose.Schema(
	{
		id: {type: Number, required: true},
		processedMessages: [{type: Number, required: true}],
		stage: {type: Number, required: true},
		products: [{type: String, required: true}],
		startedAt: {type: Date, default: Date.now(), expires: 24 * 3600}
	})

export default mongoose.model<UserType>('User', UserSchema)