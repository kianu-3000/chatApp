const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model.js');

const requireAuth = (req, res, next) =>{
	const token = req.cookies.jwt;

	//check if jwt exists
	if(token){
		jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
			if(err){
				console.log('Error: ', err);
				return res.redirect('/auth/login');
			}
			else{
				// console.log(decodedToken);
				res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		        res.setHeader('Pragma', 'no-cache');
		        res.setHeader('Expires', '0');
				next();
			}
		});
	}
	else{
		return res.redirect('/auth/login');
	}
}	

// check user
const checkUser = (req, res, next) => {
	const token = req.cookies.jwt;

	if(token){
		jwt.verify(token, process.env.SECRET_KEY, async (err, decodedToken) => {
			if(err){
				console.log('Error: ', err);
				res.locals.user = null;
				next();
			}
			else{
				// console.log(decodedToken);	
				const user = await userModel.findById(decodedToken.id);
				res.locals.user = user; // this will let views engine access this data 
				next();
			}
		});
	}
	else{
		res.locals.user = null;
		next();
	}
}


module.exports = { requireAuth, checkUser };