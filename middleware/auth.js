const jwt = require("jsonwebtoken");

const { validate } = require('uuid')

module.exports = {
	verifyAccess: async (req, res, next) => {
		const token = req.cookies['Access-Token']
		if (!token)
			return res.status(418).json({ success: false, msg: 'Missing Auth token' })

		jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
			if (err) {
				console.log(token, 'token')
				console.log(err, 'error')
				console.log('Access Token expired')
				return res.status(418).json({ success: false, msg: 'Token expired' })
			}
			// console.log(req)
			res.locals.user = user
			res.locals.loginIP = req.header('X-Forwarded-For')
			next()
		})
	},

  // Haven't figured out a way to make use of jwts with localhost. Use this for that. 
  fakeAuth: async function (req, res, next) {
    res.locals.user = {_id: "INSERT YOUR LOCAL USER _id HERE", uuid: 'user-access-57e64f8c-260c-46b3-9131-fdc931eaae96' }
    next()
  },
	/*
  @params: 
    data<Object>: The information you want to encode in the JWT
    userType<String>: The type of user this JWT is for. (manager, user, investor) [case-sensitive]
    tokenType<String>: The type of token this JWT is. (access, refresh) [case-sensitive]
  
  */
	createJWT: (data, userType, tokenType) => {
		let uuid, token, cookieParams, redisParams
		switch (tokenType) {
			case 'access':
				uuid = validate(data.uuid)
					? `${userType}-${tokenType}-${data.uuid}`
					: data.uuid
				token = jwt.sign({ ...data, uuid }, process.env.TOKEN_SECRET, {
					expiresIn: '1h',
				})
				cookieParams = {
					// maxAge: 20 * 1000,
					maxAge: 60 * 60 * 1000,
					httpOnly: true,
					secure: true,
					path: '/api',
				}
				redisParams = {
					// EX: 20
					EX: 60 * 60,
				}
				return [token, cookieParams, uuid, redisParams]
			case 'refresh':
				uuid = validate(data.uuid)
					? `${userType}-${tokenType}-${data.uuid}`
					: data.uuid
				token = jwt.sign({ ...data, uuid }, process.env.REFRESH_TOKEN_SECRET, {
					expiresIn: '30d',
				})
				cookieParams = {
					maxAge: 30 * 24 * 60 * 60 * 1000,
					httpOnly: true,
					secure: true,
					path: '/api/user/refresh',
				}
				redisParams = {
					EX: 30 * 24 * 60 * 60,
				}
				return [token, cookieParams, uuid, redisParams]
			default:
				return []
		}
	},
}