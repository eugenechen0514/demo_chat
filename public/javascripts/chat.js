
/**
 *
 * @param {ChatUser[]} users
 * @param {User} self
 */
function renderUserList(users, self) {
    const html = users
        .filter(user => user.id !== self.id)
        .map(user => `<li>${user.id} -> ${user.name} (${user.isOnline})</li>`)
        .join('');
    $('.user_list').html(html);
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

    const socket = io({
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
}
