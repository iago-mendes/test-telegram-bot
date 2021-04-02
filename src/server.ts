import express from 'express'
import cors from 'cors'
import 'express-async-errors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

import routes from './routes'
import errorHandler from './errors/handler'
import api from './services/api'

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

let offset: number | undefined = undefined

setInterval(() =>
{
	const data = offset
		? {offset}
		: {}

	api.post('getUpdates', data)
		.then(res =>
		{
			const update = res.data.result[0]
			if (update)
			{
				offset = update.update_id + 1

				const params =
				{
					chat_id: update.message.chat.id,
					text:
					'🎉 Olá! Eu sou um bot! 🎉\n' +
					'Você me mandou a seguinte mensagem:\n\n' +
					update.message.text
				}

				api.post('sendMessage', params)
			}
		})
		.catch(error =>
		{
			console.error('[error]', error.response.data)
		})
}, 2*1000)

app.use(errorHandler)

const port = process.env.PORT || 3000
app.listen(port, () => console.log('server started at port', port))