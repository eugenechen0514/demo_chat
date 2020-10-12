const UserModel = require('../models/users');

/**
 *
 * @type {Map<string, Socket>}
 */
const userIdToSocket = new Map();

/**
 *
 * @type {Map<Socket, string>}
 */
const socketToUserId = new Map();

/**
 *
 * @param {User} user
 * @param {Socket} socket
 */
function registerUser(user, socket) {
    const userId = user.id;
    userIdToSocket.set(userId, socket);
    socketToUserId.set(socket, userId);
}

function unregisterUser(socket) {
    const userId = socketToUserId.get(socket);
    socketToUserId.delete(socket);
    userIdToSocket.delete(userId);
}


function handleError(err) {
    console.error(err);
}

module.exports = io => {
    io.on('connect', socket => {
        const id = socket.handshake.query.id;
        const name = socket.handshake.query.name;
        registerUser({id, name}, socket);

        socket.emit('greetings', `Hey! ${id} -> ${name}`);

        // broadcast user list
        UserModel.getUsers()
            .then(users => {
                io.emit('updateUserList', users);
            })
            .catch(handleError)
    });
    io.on('disconnected', socket => {
        unregisterUser(socket);
    });
}
