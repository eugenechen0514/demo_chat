const UserModel = require('../models/users');
const RoomModel = require('../models/rooms');

/**
 * Online user
 * @type {Map<string, Socket>}
 */
const userIdToSocket = new Map();

/**
 * Online user
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

function broadcastUserList(io) {
    // broadcast user list
    UserModel.getUsers()
        .then(users => {
            /**
             *
             * @type {ChatUser[]}
             */
            const chatUsers = users.map(user => ({...user, isOnline: [...userIdToSocket.keys()].includes(user.id)}))
            io.emit('updateUserList', chatUsers);
        })
        .catch(handleError)
}

/**
 *
 * @param {Socket} socket
 */
function joinRooms(socket) {
    UserModel.getUsers()
        .then(users => {
            users.forEach(user => socket.join(RoomModel.computeRoomId(socketToUserId.get(socket), user)));
        })
        .catch(handleError);
}

/**
 *
 * @param {SocketIO.Server} io
 */
function init(io) {
    io.on('connect', socket => {
        const id = socket.handshake.query.id;
        const name = socket.handshake.query.name;
        registerUser({id, name}, socket);
        broadcastUserList(io);

        joinRooms(socket);

        socket.emit('greetings', `Hey! ${id} -> ${name}`);

        socket.on('selectingRoom', ({from, to}) => {
            console.log('selectingRoom', {from, to});

            // real-time
            Promise.all([UserModel.findUser(from), UserModel.findUser(to)])
                .then(([from, to]) => {
                    socket.emit(`selectedRoom`, {from, to})
                })
                .catch(handleError);
        });

        socket.on('disconnecting', (reason) => {
            const userId = socketToUserId.get(socket);
            console.log(`${userId} exited.`, reason);
            unregisterUser(socket);
            broadcastUserList(io);
        });
    });

    setInterval(() => {
        io.sockets
    }, 2000);
}

module.exports = init
