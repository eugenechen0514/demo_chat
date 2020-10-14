/**
 *
 * @type {Socket | null}
 */
let socket = null;

/**
 *
 * @type {Room | null}
 */
let userSelectedRoom = null;


const debug = console.log;


function handleError(error) {
    alert(String(error));
}

/**
 *
 * @param {User} self
 */
function sendMessage(self) {
    if(socket && userSelectedRoom) {
        const input = document.getElementById('message_input');
        const other = getOther(userSelectedRoom, self);
        /**
         *
         * @type {RoomMessage}
         */
        const message = {
            fromId: self.id,
            toId: other.id,
            content: input.value
        };
        socket.emit('sendMessageTopic', message);

        input.value = '';
    } else {
        handleError('沒有選擇對象');
    }
}

/**
 *
 * @param {ChatUser[]} users
 * @param {User} self
 */
function renderUserList(users, self) {
    const userElements = users
        .filter(user => user.id !== self.id)
        .map(user => {
            const a = document.createElement('a');
            a.addEventListener('click', () => {
                socket.emit('selectChannelTopic', {fromId: self.id, toId: user.id});
            });
            a.appendChild(document.createTextNode(`${user.name} (${user.isOnline ? 'online' : 'offline'})`));

            const li = document.createElement('li');
            li.appendChild(a);
            return li;
        })
    const userListElement = document.getElementsByClassName('user_list').item(0);
    userListElement.innerHTML = '';
    userListElement.append(...userElements);
}

/**
 *
 * @param {Room} room
 * @param {User} self
 * @return {User}
 */
function getOther(room, self) {
    return room.users.find(user => user.id !== self.id);
}

/**
 *
 * @param {Room[]} rooms
 * @param {User} self
 */
function renderRooms(rooms, self) {
    const roomListElement = document.getElementsByClassName('room_list').item(0);
    const roomElements = rooms.map(room => {
        const a = document.createElement('a');
        a.addEventListener('click', () => {
            socket.emit('selectRoomTopic', room);
        });

        const other = getOther(room, self);
        a.appendChild(document.createTextNode(`${other.name} : (${room.messages.length} message, id: ${room.id})`));
        if(room.messages.length > 0) {
            const lastMessage = room.messages[room.messages.length -1];
            const date = new Date(lastMessage.date);
            a.appendChild(document.createElement('br'));
            a.appendChild(document.createTextNode(`${lastMessage.content} at ${date.toLocaleString()}`));
        }

        const li = document.createElement('li');
        li.appendChild(a);
        return li;
    });
    roomListElement.innerHTML = '';
    roomListElement.append(...roomElements);
}

/**
 *
 * @param {RoomMessage[]} messages
 * @param {User} self
 */
function renderMessage(messages, self) {
    const messageListElement = document.getElementsByClassName('message_list').item(0);
    const messageElements = messages.map(message => {
        const a = document.createElement('a');
        a.addEventListener('click', () => {
        });
        const fromText = self.id === message.fromId ? '' : `from ${message.from.name}`;
        a.appendChild(document.createTextNode(`${message.content} ${fromText} (${message.fromId} -> ${message.toId})`));

        const li = document.createElement('li');
        li.appendChild(a);
        return li;
    });
    messageListElement.innerHTML = '';
    messageListElement.append(...messageElements);
}

/**
 *
 * @param {Room} room
 * @param {User} self
 */
function selectedRoom(room, self) {
    userSelectedRoom = room;

    const other = room.users.find(user => user.id !== self.id);

    const roomTitleElement = document.getElementsByClassName('room_title').item(0);
    roomTitleElement.innerHTML = `私訊給： ${other.name}`;

    renderMessage(room.messages, self);
}

function initMessageDom(self) {
    const input = document.getElementById('message_button');
    input.addEventListener('click', (event) => {
        sendMessage(self);
    });
    document.getElementById('message_input')
        .addEventListener('keyup',  (event) => {
            if (event.keyCode === 13) {
                event.preventDefault();
                input.click();
            }
        });
}

/**
 *
 * @param {string} userId
 * @param {string} userName
 */
function connectRooms(userId, userName) {
    /**
     * @type {User}
     */
    const self = {
        id: userId,
        name: userName,
    }

    initMessageDom(self);

    socket = io({
        path: '/rooms',
        query: self
    });

    socket.on('greetings', (msg) => {
        debug('message: ' + msg);
    });
    socket.on('updateUserList', (users) => {
        debug('updateUserList', users);
        renderUserList(users, self);
    });
    socket.on('selectedRoomTopic', (room) => {
        debug('selectedRoomTopic', room);
        const {id} = room;
        if(id) {
            selectedRoom(room, self);
        }
    });
    socket.on('sentMessageTopic', (message) => {
        debug('sentMessageTopic', message);
        if(userSelectedRoom) {
            userSelectedRoom.messages.push(message);
            renderMessage(userSelectedRoom.messages, self);
        }
    });
    socket.on('updateRoomsTopic', (rooms) => {
        debug('updateRoomsTopic', rooms);
        renderRooms(rooms, self);
    });
}
