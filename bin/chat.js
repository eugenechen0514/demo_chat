const Queue = require('better-queue');

const UserModel = require('../models/users');
const ChannelModel = require('../models/channels');

const debug = console.log;

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
            users.forEach(user => {
                const clientUserId = socketToUserId.get(socket);
                if(clientUserId !== user.id) {
                    socket.join(ChannelModel.computeRoomId(clientUserId, user));
                }
            });
        })
        .catch(handleError);
}

/**
 *
 * @param {SocketIO.Server} io
 */
function init(io) {
    /**
     *
     * @param {function()} emitFun
     * @param cb
     */
    function handleEmit(emitFun, cb) {
        emitFun();
        cb(null, emitFun);
    }

    const emitQueue = new Queue(handleEmit);

    async function emitRoomList(userId, emitQueue) {
        const toSocket = userIdToSocket.get(userId);
        if (toSocket) {
            const rooms = await ChannelModel.getUserRooms(userId);
            emitQueue.push(() => {
                toSocket.emit('updateRoomsTopic', rooms);
            });
        }
    }

    io.on('reconnect', socket => {
        const id = socket.handshake.query.id;
        const name = socket.handshake.query.name;
        registerUser({id, name}, socket);
        broadcastUserList(io);
    });

    io.on('connect', socket => {
        const id = socket.handshake.query.id;
        const name = socket.handshake.query.name;
        registerUser({id, name}, socket);
        broadcastUserList(io);

        joinRooms(socket);

        socket.emit('greetings', `Hey! ${id} -> ${name}`);

        emitRoomList(id, emitQueue)
            .catch(handleError);

        socket.on('disconnecting', (reason) => {
            const userId = socketToUserId.get(socket);
            debug(`${userId} exited.`, reason);
            unregisterUser(socket);
            broadcastUserList(io);
        });

        socket.on('selectChannelTopic', (channel) => {
            debug('selectChannelTopic', channel);
            const {fromId, toId} = channel;

            (async () => {
                const [from, to] = await Promise.all([UserModel.findUser(fromId), UserModel.findUser(toId)]);
                const room = await ChannelModel.findRoom(from, to);

                await emitRoomList(fromId, emitQueue);
                socket.emit(`selectedRoomTopic`, room);
            })()
                .catch(handleError);
        });
        socket.on('selectRoomTopic', (room) => {
            debug('selectRoomTopic', room);
            const {id} = room;

            (async () => {
                const room = await ChannelModel.findRoomById(id);
                socket.emit(`selectedRoomTopic`, room);
            })()
                .catch(handleError);
        });

        socket.on('sendMessageTopic', (message) => {
            debug(message);
            const {fromId, toId, content, date = new Date()} = message;
            (async () => {
                // to db
                const [from, to] = await Promise.all([UserModel.findUser(fromId), UserModel.findUser(toId)]);
                await ChannelModel.pushMessage(from, to, content, date);

                // update rooms for online fromUser and toUser
                await emitRoomList(fromId, emitQueue);
                await emitRoomList(toId, emitQueue);

                // send msg to room
                emitQueue.push(() => {
                    io.to(ChannelModel.computeRoomId(from, to)).emit('sentMessageTopic', {fromId, toId, from, to, content, date});
                });
            })()
                .catch(handleError);
        });
    });

    // Debug: rooms
    setInterval(() => {
        let msg = '----- rooms ----\n';
        for(let [userId, socket] of userIdToSocket) {
            msg += `${userId} : ${Object.keys(socket.rooms)}\n`
        }
        msg += '\n';
        debug(msg);
    }, 2000);
}

module.exports = init
