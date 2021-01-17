let chat = document.getElementById('chat');
let text = document.getElementById('text');
let send = document.getElementById('send');
let username = document.getElementById('username');

let socket = io.connect();

let updateChat = msg => {
    console.log(msg.username);
    let strong = document.createElement('strong');
    strong.appendChild(document.createTextNode(`${msg.username}: `));

    let val = document.createElement('span');
    val.appendChild(document.createTextNode(`${msg.value}`));

    let li = document.createElement('li');
    li.appendChild(strong);
    li.appendChild(val);

    chat.appendChild(li);

    chat.scrollTop = chat.scrollHeight;
}

send.addEventListener('click', () => {
    let msg = {
        'username': username.textContent,
        'value': text.value
    }
    console.log(msg);
    text.value = "";
    socket.emit('chat', msg);
    updateChat(msg);
});

socket.on('chat', msg => {
    updateChat(msg);
})
