const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware.js');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model.js');
const router = express.Router();

router.get('/home', requireAuth , async (req, res) => {
	const users = await userModel.find({}).sort({ceratedAt: -1});

	res.render('home', {users: users});
});

module.exports = router;