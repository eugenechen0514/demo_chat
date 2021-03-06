
/**
 * @typedef {Object} RoomMessage
 * @property {string} fromId user id
 * @property {string} toId user id
 * @property {User} [from] user
 * @property {User} [to] user
 * @property {string} content
 * @property {Date} [date]
 */

/**
 * @typedef {Object} Room
 * @property {string} id
 * @property {RoomMessage[]} messages
 * @property {User[]} [users]
 */

/**
 *
 * @type {Room[]}
 */
const rooms = [];

module.exports = {
    /**
     *
     * @param {User | string} userA
     * @param {User | string} userB
     * @return {string}
     */
    computeRoomId(userA, userB) {
        const idA = typeof userA === 'object' ? userA.id : userA;
        const idB = typeof userB === 'object' ? userB.id : userB;
        const ids = [idA, idB].sort((a, b) => a < b ? -1 : 1);
        return ids.join('-');
    },

    /**
     *
     * @param {User | string} user
     * @return {Promise<Room[]>}
     */
    async getUserRooms(user) {
        const userId = typeof user === 'object' ? user.id : user;
        return rooms.filter(room => {
            const ids = room.id.split('-');
            return ids.find(id => id === userId);
        });
    },

    /**
     *
     * @param {User} userA
     * @param {User} userB
     * @return {Promise<Room>}
     */
    async ensureRoom(userA, userB) {
        const roomId = this.computeRoomId(userA, userB);
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
            users: [userA, userB]
        };
        rooms.push(room);
        return room;
    },

    /**
     *
     * @param {User} fromUser
     * @param {User} toUser
     * @param {string} content
     * @param {Date} [date]
     */
    async pushMessage(fromUser, toUser, content, date = new Date) {
        /**
         *
         * @type {RoomMessage}
         */
        const message = {
            fromId: fromUser.id,
            toId: toUser.id,
            from: fromUser,
            to: toUser,
            content,
            date: new Date()
        };
        const room  = await this.ensureRoom(fromUser, toUser);
        room.messages.push(message);
    },

    /**
     *
     * @param {User} from
     * @param {User} to
     * @return {Promise<Room>}
     */
    async findRoom(from, to) {
        return this.ensureRoom(from, to);
    },

    /**
     *
     * @param {string} id
     * @return {Promise<Room | undefined>}
     */
    async findRoomById(id) {
        return rooms.find(room => room.id === id);
    }
}
