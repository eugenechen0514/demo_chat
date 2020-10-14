let socket = null;

/**
 *
 * @type {Channel | null}
 */
let userSelectedChannel = null;

/**
 *
 * @type {Room | null}
 */
let userSelectedRoom = null;

function handleError(error) {
    alert(String(error));
}

function sendMessage() {
    if(socket && userSelectedChannel) {
        const input = document.getElementById('message_input');

        /**
         *
         * @type {ChannelMessage}
         */
        const message = {...userSelectedChannel, content: input.value};
        socket.emit('sendMessageTopic', message);
    } else {
        handleError('沒有選擇channel');
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

        const other = room.users.find(user => user.id !== self.id);
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
 * @param {ChannelMessage[]} messages
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
 * @param {User} from
 * @param {User} to
 * @param {ChannelMessage[]} messages
 * @param {User} self
 */
function selectedChannel(from, to, messages, self) {
    userSelectedChannel = {fromId: from.id, toId: to.id, from, to, messages};
    const channelTitleElement = document.getElementsByClassName('channel_title').item(0);
    channelTitleElement.innerHTML = `私訊給： ${to.name}`;

    renderMessage(messages, self);
}

/**
 *
 * @param {Room} room
 * @param {User} self
 */
function selectedRoom(room, self) {
    userSelectedRoom = room;

    const other = room.users.find(user => user.id !== self.id);
    selectedChannel(self, other, room.messages, self);
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

    socket = io({
        path: '/rooms',
        query: self
    });

    socket.on('greetings', (msg) => {
        console.log('message: ' + msg);
    });
    socket.on('updateUserList', (users) => {
        console.log('updateUserList', users);
        renderUserList(users, self);
    });
    socket.on('selectedRoomTopic', (room) => {
        console.log('selectedRoomTopic', room);
        const {id} = room;
        if(id) {
            selectedRoom(room, self);
        }
    });
    socket.on('sentMessageTopic', (message) => {
        console.log('sentMessageTopic', message);
        if(userSelectedChannel) {
            userSelectedChannel.messages.push(message);
            renderMessage(userSelectedChannel.messages, self);
        }
    });
    socket.on('updateRoomsTopic', (rooms) => {
        console.log('updateRoomsTopic', rooms);
        renderRooms(rooms, self);
    });
}
