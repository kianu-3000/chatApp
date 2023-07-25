const userModel = require('../models/user.model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const maxTime = 3 * 24 * 60 * 60 // this equals three days

// create a user
const createUser = async (req, res) => {

	try{
		if(req.body.password == req.body.confirmPassword && req.body.username != null){

			// generate a salt 
			const salt = await bcrypt.genSalt();
			const hashPassword = await bcrypt.hash(req.body.confirmPassword, salt);

			// 
			const username = req.body.username;
			const pass = hashPassword;

			const user = await userModel.create({username: username, password: pass});
			return res.status(200).redirect('/auth/login');

		}
		else{
			return res.status(400).json({err: "password did not match"});
		}
	}
	catch{
		return res.json({err: "error in creating a user, username already exist!"});
	}

};

// find or get all users
const getUsers = async (req, res) =>{

	const users = await userModel.find({}).sort({ceratedAt: -1});
	return res.status(200).json(users);

};

// find one user
const findUser = async (req, res) =>{

	const user = await userModel.findOne({username: req.body.username});

	if(user == null){
		return res.redirect('/auth/login');
	}
	else{
		await bcrypt.compare(req.body.password, user.password, (err, result) =>{

			if(err){
				return res.json({error: 'Error in comparing passwords'})
			}

			if(result){
				// create the token when a user has logged in
				const token = createJWT(user._id);
				res.cookie('jwt', token, {httpOnly: true, maxAge: maxTime * 1000});
				return res.redirect('/home');
			}
			else{
				return res.redirect('/auth/login');
			}
		});
		
	}

}

// create a JWT token function
const createJWT = (id) =>{
	return jwt.sign({ id }, process.env.SECRET_KEY, { 
		expiresIn: maxTime
	 });
}


// Export the functions
module.exports = {
	createUser,
	getUsers,
	findUser
}