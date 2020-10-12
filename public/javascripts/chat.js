/**
 *
 * @param {string} userId
 * @param {string} userName
 */
function connectRooms(userId, userName) {
    const socket = io({
        path: '/rooms',
        query: {
            id: userId,
            name: userName
        }
    });
    socket.on('greetings', (msg) => {
        console.log('message: ' + msg);
    });
}
