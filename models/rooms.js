/**
 * @typedef {Object} RoomMessage
 * @property {string} from user id
 * @property {string} to user id
 * @property {string} content
 * @property {Date} date
 */

/**
 * @typedef {Object} Room
 * @property {string} id
 * @property {RoomMessage[]} messages
 */


/**
 *
 * @type {Room[]}
 */
const rooms = [];

module.exports = {
    /**
     *
     * @param {User} userA
     * @param {User} userB
     * @return {string}
     */
    computeRoomId(userA, userB) {
        const ids = [userA.id, userB.id].sort((a, b) => a < b ? -1 : 1);
        return ids.join('-');
    },

    /**
     *
     * @param {User} user
     * @return {Promise<Room[]>}
     */
    async getUserRooms(user) {
        return rooms.filter(room => {
            const ids = room.id.split('-');
            return ids.find(id => id === user.id);
        });
    },

    /**
     *
     * @param userA
     * @param userB
     * @return {Promise<Room>}
     */
    async ensureRoom(userA, userB) {
        const roomId = computeRoomId(userA, userB);
        const found = rooms.find(room => room.id === roomId);
        if(found) {
            return found;
        }

        /**
         *
         * @type {Room}
         */
        const room = {
            id: roomId,
            messages: [],
        };
        rooms.push(room);
        return room;
    },

    /**
     *
     * @param {User} fromUser
     * @param {User} toUser
     * @param {string} content
     */
    async sendMessage(fromUser, toUser, content) {
        /**
         *
         * @type {RoomMessage}
         */
        const message = {
            from: fromUser.id,
            to: toUser,
            content,
            date: new Date()
        };

        const room  = await ensureRoom(fromUser, toUser);
        room.messages.push(message);
    }
}
