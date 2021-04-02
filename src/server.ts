import express from 'express'
import cors from 'cors'
import 'express-async-errors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

import routes from './routes'
import errorHandler from './errors/handler'
import bot from './controllers/bot'

const app = express()
dotenv.config()

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://test:${process.env.DB_PWD}@main.crou6.mongodb.net/main?retryWrites=true&w=majority`
mongoose.connect(
	uri,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true
	}
)
mongoose.connection
	.once('open', () => console.log('database connected'))
	.on('error', error => console.log('[database connection error]:', error))


app.use(routes)
bot.getUpdates()

app.use(errorHandler)

const port = process.env.PORT || 3000
app.listen(port, () => console.log('server started at port', port))