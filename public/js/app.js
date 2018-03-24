
const socket = io();

let sender = null;

const getUser = async () => {
	axios.get('/api/user').then(function (response) {
		const {user} = response.data;
		if(response.status === 200) {
			sender = {
				name: user.name,
				id: user._id
			};
		}
	}).catch(function (err) {
		console.log(err);
		throw err
	});

};

let hasRun = false;

if(!hasRun) {
	hasRun = true;
	getUser();
}


const form = document.querySelector('.send-chat-form');
const messagesDiv = document.querySelector('#root-messages');

socket.on('connect', function () {

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		const messageInput = document.querySelector('#inlineFormInput');
		if(messageInput.value.trim()) {
			socket.emit('new message', {text: messageInput.value, sender});
		}
		messageInput.value = '';
		messageInput.focus();
	});

	socket.on('update messages', function (data) {
		const newMessage = document.createElement('div');
		if(sender.id === data.sender.id) {
			newMessage.className = 'alert alert-success';
		} else {
			newMessage.className = 'alert alert-primary';
		}
		newMessage.innerHTML = data.text;
		messagesDiv.appendChild(newMessage);
	});

});