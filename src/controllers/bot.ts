import Update from '../models/Update'
import api from '../services/api'
import users from './users'

const bot =
{
	getUpdates: () =>
	{
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
						bot.checkStage(update)
					}
				})
				.catch(error =>
				{
					console.error('[error]', error.response.data)
				})
		}, 5*1000)
	},

	checkStage: async (update: Update) =>
	{
		const user = update.message.from
		const messageId = update.message.message_id
		const text = update.message.text.trim()

		const hasMessageBeenProcessed = await users.hasMessageBeenProcessed(user, messageId)
		if (hasMessageBeenProcessed)
			return
		else
			await users.addProcessedMessage(user, messageId)

		const userStage = await users.getStage(user)

		if (userStage < 0) // welcome
		{
			users.start(update)

			const params =
				{
					chat_id: update.message.chat.id,
					text:
					'🎉 Olá! Tudo bem? 🎉\n' +
					'Eu sou um bot, e estou aqui para te ajudar a realizar seu pedido.\n\n' +
					'Vamos lá... diga-me os produtos que você gostaria de comprar (separe por vírgula).'
				}

			api.post('sendMessage', params)
		}
		else if (userStage === 0) // get first products
		{
			users.nextStage(user)

			const products = update.message.text
				.split(',').map(product => product.trim())
			users.addProducts(user, products)

			const params =
				{
					chat_id: update.message.chat.id,
					text:
					'Já salvei os produtos que você me informou!\n' +
					'Se você quiser adicionar mais produtos, basta usar o mesmo formato de antes (separando por vírgula).\n' +
					'Caso queira finalizar o pedido, basta digitar /finalizar.'
				}
			api.post('sendMessage', params)
		}
		else if (userStage === 1) // more products or finish
		{
			if (text === '/finalizar')
			{
				const products = await users.getProducts(user)
				const productsDisplay = products.map((product, index) => (
					`${index}) ${product}\n`
				)).join('')

				users.remove(user)

				const params =
				{
					chat_id: update.message.chat.id,
					text:
					'Pedido finalizado!!!\n' +
					'Você pediu os seguintes produtos:\n\n' +
					productsDisplay
				}
				api.post('sendMessage', params)
			}
			else
			{
				const products = update.message.text
					.split(',').map(product => product.trim())
				users.addProducts(user, products)

				const params =
				{
					chat_id: update.message.chat.id,
					text:
					'Já salvei os produtos que você me informou!\n' +
					'Se você quiser adicionar mais produtos, basta usar o mesmo formato de antes (separando por vírgula).\n' +
					'Caso queira finalizar o pedido, basta digitar /finalizar.'
				}
				api.post('sendMessage', params)
			}
		}
		else
		{
			users.remove(user)
		}
	}
}

export default bot