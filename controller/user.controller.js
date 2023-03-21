const User = require('../models/user.model')
const OTPToken = require('../models/otp.model')
const { promiseMe } = require('../utils/helper')
const Email = require('../utils/email')
const { createJWT } = require('../middleware/auth')
const { v4 } = require('uuid')
const  generateUploadURL =require('../s3.js')
const jwt = require("jsonwebtoken");


// const bcrypt = require('bcrypt')

module.exports = {
	login: async function (req, res) {
    req.body = {
      token: 'sakfdajf',
      email : 'aniket.bhat@pridevel.com'
    }
    const [token, error] = await promiseMe(
			OTPToken.findOne({
				token: req.body.token,
				email: req.body.emailID,
			}).exec()
		)
		if (!token || error)
			return res.status(500).json({ success: false, msg: 'OTP error' })

		let [user, error2] = await promiseMe(
			User.findOneAndUpdate(
				{ emailID: token.email },
				{ emailID: token.email, lastLogin: Date.now() },
				{ upsert: true, new: true }
			).exec()
		)
		if (error2)
			return res.status(500).json({ success: false, msg: 'Error in login in' })
		if (!user)
			return res.status(404).json({ success: false, msg: 'User not found' })
		const _id = user._id
		const uuid = v4()
		const [accessToken, accessCookieParams, accessRedisKey, accessRedisParams] =
			createJWT({ _id, uuid }, 'user', 'access')
		const [
			refreshToken,
			refreshCookieParams,
			refreshRedisKey,
			refreshRedisParams,
		] = createJWT({ _id, uuid }, 'user', 'refresh')
		if (!accessToken || !refreshToken)
			return res.status(500).json({ success: false, msg: 'Error Creating JWT' })

		try {
			await req.redis.set(accessRedisKey, accessToken, accessRedisParams)
			await req.redis.set(refreshRedisKey, refreshToken, refreshRedisParams)
		} catch (err) {
			return res
				.status(500)
				.json({ success: false, message: 'Error saving to Redis' })
		}
		return res
			.status(200)
			.cookie('Access-Token', accessToken, accessCookieParams)
			.cookie('Refresh-Token', refreshToken, refreshCookieParams)
			.json({ success: true })
	},

	isLogin: async function (req, res) {
		const { user } = res.locals
		// console.log(user, 'isLogin user')
		// chain operator
    if (!user?._id)
			return res.status(400).json({ success: false, msg: 'Bad Request' })
		return res
			.status(200)
			.json({ success: true, msg: 'User session is valid', userId: user._id })
	},

	edit: async function (req, res) {
		const { name, age, emailID, walletAddress, about, profileImage } = req.body
		const { _id } = res.locals.user
		const [user, error] = await promiseMe(User.findById(_id).exec())
		if (error)
			return res
				.status(500)
				.json({ success: false, msg: 'User not found', error: error })
		if (!user._id)
			return res.status(404).json({
				success: false,
				msg: 'User not found',
				error: 'User Not Found',
			})

		user.name = name ?? user.name
		user.age = age ?? user.age
		user.emailID = emailID ?? user.emailID
		user.walletAddress = walletAddress ?? user.walletAddress
		user.about = about ?? user.about
		user.profileImage = profileImage ?? user.profileImage
    const err = user.validateSync();
    if(err) return res.status(400).json({success:false, msg:'Failed data validation', error:err })

		user.save((err) => {
			if (err)
				return res
					.status(500)
					.json({ success: false, msg: 'Failed to update', error: err })
			return res.status(200).json({ success: true, msg: 'User Updated' })
		})
	},

	getByUsername: async function (req, res) {
		// check for valid entries
		let { username } = req.param
		if (!username)
			return res.status(400).json({ success: false, msg: 'Bad Request!' })
		//Using custom wrapper for try catch
		let [userData, error] = await promiseMe(User.findOne({ username }).exec())
		if (error)
			return res.status(500).json({ success: false, msg: 'Error getting user' })
		if (!userData)
			return res.status(400).json({ success: false, msg: 'User not found' })
		// extracting fields we don't want to send to the front end
		const { _id, emailID,...rest } = userData
		return res.status(200).json({
			success: true,
			msg: 'User Found!',
			data: rest,
		})
	},

  getByJWT: async function (req, res) {
		// check for valid entries
		let { _id } = res.locals.user
    // console.log(res.locals.user, 'locals')
    if (!_id) return res.status(400).json({ success: false, msg: 'Bad Request!' })
		//Using custom wrapper for try catch
    let [userData, error] = await promiseMe(User.findById(_id).exec())
    // console.log(userData, 'userData')
		if (error)
			return res.status(500).json({ success: false, msg: 'Error getting user', error:error })
		if (!userData)
			return res.status(404).json({ success: false, msg: 'User not found' })
		// extracting fields we don't want to send to the front end
    return res.status(200).json({
			success: true,
			msg: 'User Found!',
			data: userData,
		})
	},

	logout: async function (req, res) {
		const accessRedisKey = res.locals.user.uuid
		const arr = accessRedisKey.split('-')
		arr[1] = 'refresh'
		// console.log(arr);
		const refreshRedisKey = arr.join('-')	
    await promiseMe(req.redis.del(accessRedisKey))
    await promiseMe(req.redis.del(refreshRedisKey))
    return res
    .status(200)
    .cookie('Access-Token', '', {
      maxAge: 1,
      httpOnly: true,
      secure: true,
      path: '/api',
    })
    .cookie('Refresh-Token', '', {
      maxAge: 1,
      httpOnly: true,
      secure: true,
      path: '/api/user/refresh',
    })
    .json({ success: true, msg: 'Logged out' })

	},
}
