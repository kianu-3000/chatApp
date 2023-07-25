const socket = io();
const chatForm = document.getElementById('chat-form');
const chatBox = document.querySelector('#main-chat');

// Message from server
socket.on('chat', msg =>{
	console.log(msg);
	outputMessage(msg);

	// Scroll down to new chat
	chatBox.scrollTop = chatBox.scrollHeight;
});
socket.on('message', msg =>{
	console.log(msg);
	outputMessage(msg);

	// Scroll down to new chat
	chatBox.scrollTop = chatBox.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) =>{
	e.preventDefault();

	const message = e.target.elements.message.value;

	socket.emit('chatMessage', message);

	// clear the input
	e.target.elements.message.value = '';
	e.target.elements.message.focus();
});

// output message from DOM
function outputMessage(message){

	const div = document.createElement('section');
	div.classList.add('chat');
	div.innerHTML = `
		<section>
			<p>${message.username} <span>- ${message.time}</span></p>
			<p>${message.text}</p>
		</section>
	`;

	document.querySelector('#main-chat').appendChild(div);

}