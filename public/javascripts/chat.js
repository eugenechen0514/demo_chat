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
         * @type {RoomMessage}
         */
        const message = {...channel, content: input.value};
        socket.emit('sendMessage', message);
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
    const liElements = users
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
    const userElement = document.getElementsByClassName('user_list').item(0);
    userElement.innerHTML = '';
    userElement.append(...liElements);
}

/**
 *
 * @param {User} from
 * @param {User} to
 */
function selectedChannel(from, to) {
    channel = {from, to};
    const channelTitleElement = document.getElementsByClassName('channel_title').item(0);
    channelTitleElement.innerHTML = `私訊給： ${to.name}`;
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
        const {from, to} = channel;
        if(from && to) {
            selectedChannel(from, to);
        }
    });
    socket.on('sentMessage', (message) => {
        console.log('sentMessage', message);
    });
}
