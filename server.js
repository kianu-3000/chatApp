const express = require('express');
const dotenv = require('dotenv');
const ejs = require('ejs');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const userModel = require('./models/user.model.js');


const { requireAuth, checkUser } = require('./middlewares/authMiddleware.js');
const formatMessage = require('./tools/messages.js'); // my function for creating an object chat


// configure the env files
dotenv.config();
// main app
const app = express();
const server = http.createServer(app);
const io = socketio(server); // this will let us connect to our server

// env variables
const PORT = process.env.PORT || 5000;
const IP = process.env.IP;

// middlewares
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.get('*', checkUser); // use this on every get request

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// import the routes
const auth = require('./routes/auth.js');
const home = require('./routes/home.js');
app.use('/auth', auth);
app.use('/', home);

// Run when client connects
const chatAppName = 'Chat App';
io.on('connection', socket => {
	console.log('New WebSocket Connection . . .');
	const token = socket.handshake.headers.cookie;
	const strippedToken = token.slice(4);
	console.log(strippedToken);

	// emit -> this is how we send data to the client from the server and vice versa
	// this emits to a single client
	socket.emit('message', formatMessage(chatAppName, 'Welcome to Chat App!')); 

	// Broadcast when a user connects
	// this emits to everybody but the user thats connecting
	// socket.broadcast.emit('message', 'A user has joined the chat');

	// This runs when client disconnects
	socket.on('disconnect', () =>{
		io.emit('message', formatMessage(chatAppName, 'A user has left chat!'));
	});

	// io.emit() -> emits to all the clients

	// listen for a client chat
	socket.on('chatMessage', (message)=>{
		if(strippedToken){
			jwt.verify(strippedToken, process.env.SECRET_KEY, async (err, decodedToken) => {
				if(err){
					console.log('Error: ', err);
				}
				else{
					// console.log(decodedToken);	
					const user = await userModel.findById(decodedToken.id);
					io.emit('chat', formatMessage(user.username, message));
				}
			});
		}
		
	});	
});


// connect to db which returns a promise
mongoose.connect(process.env.MONGODB_ATLAS)
	.then(()=>{

		// we put our server here so we know we are connected to the database successfully
		server.listen(PORT, IP, ()=>{
			console.log(`Connected to Mongo DB and Running on Port ${PORT} with IP ${IP}`);
		});

	})
	.catch((err) =>{
		console.log(err);
	})




