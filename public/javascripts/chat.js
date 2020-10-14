let socket = null;

/**
 *
 * @type {Channel | null}
 */
let channel = null;

function handleError(error) {
    alert(String(error));
}

function sendMessage() {
    if(socket && channel) {
        const input = document.getElementById('message_input');

        /**
         *
         * @type {ChannelMessage}
         */
        const message = {...channel, content: input.value};
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
 * @param {User} from
 * @param {User} to
 * @param {ChannelMessage[]} messages
 */
function selectedChannel(from, to, messages) {
    channel = {fromId: from.id, toId: to.id, from, to, messages};
    const channelTitleElement = document.getElementsByClassName('channel_title').item(0);
    channelTitleElement.innerHTML = `私訊給： ${to.name}`;

    renderMessage(messages);
}

/**
 *
 * @param {Room[]} rooms
 */
function renderRooms(rooms) {
    const roomListElement = document.getElementsByClassName('room_list').item(0);
    const roomElements = rooms.map(room => {
        const a = document.createElement('a');
        a.addEventListener('click', () => {
            // socket.emit('selectChannelTopic', {fromId: self.id, toId: user.id});
        });
        a.appendChild(document.createTextNode(`${room.id} : (${room.messages.length} message)`));

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
 */
function renderMessage(messages) {
    const messageListElement = document.getElementsByClassName('message_list').item(0);
    const messageElements = messages.map(message => {
        const a = document.createElement('a');
        a.addEventListener('click', () => {
            // socket.emit('selectChannelTopic', {fromId: self.id, toId: user.id});
        });
        a.appendChild(document.createTextNode(`${message.fromId} -> ${message.toId} : ${message.content}`));

        const li = document.createElement('li');
        li.appendChild(a);
        return li;
    });
    messageListElement.innerHTML = '';
    messageListElement.append(...messageElements);

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
    socket.on('selectedChannelTopic', (channel) => {
        console.log('selectedChannelTopic', channel);
        const {from, to, messages} = channel;
        if(from && to) {
            selectedChannel(from, to, messages);
        }
    });
    socket.on('sentMessageTopic', (message) => {
        console.log('sentMessageTopic', message);
        if(channel) {
            channel.messages.push(message);
            renderMessage(channel.messages);
        }
    });
    socket.on('updateRoomsTopic', (rooms) => {
        console.log('updateRoomsTopic', rooms);
        renderRooms(rooms);
    });
}
