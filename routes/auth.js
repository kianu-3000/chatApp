const express = require('express');
const { createUser, getUsers, findUser } = require('../controllers/userControllers.js');
const router = express.Router();

router.get('/login', (req, res) => {
	res.render('login');
});

// POST request login
router.post('/login', findUser);

router.get('/logout', (req, res) => {
	res.cookie('jwt', '', {maxAge: 1});
	res.redirect('/auth/login');
});

router.post('/registration', createUser);
router.get('/getUsers', getUsers);

module.exports = router;