import axios from 'axios'

const token = process.env.TELEGRAM_TOKEN

const api = axios.create(
	{
		baseURL: `https://api.telegram.org/bot${token}/`,
	})

export default api