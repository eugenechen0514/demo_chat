/**
 * @typedef {Object} Channel
 * @property {string} fromId user id
 * @property {string} toId user id
 * @property {User} [from] user
 * @property {User} [to] user
 */

/**
 * @typedef {Object} ChannelMessage
 * @property {string} fromId user id
 * @property {string} toId user id
 * @property {string} [from] user
 * @property {string} [to] user
 * @property {string} content
 * @property {Date} [date]
 */

/**
 * @typedef {Object} Room
 * @property {string} id
 * @property {ChannelMessage[]} messages
 */


/**
 *
 * @type {Room[]}
 */
const channels = [];

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
     * @param {User} user
     * @return {Promise<Room[]>}
     */
    async getUserRooms(user) {
        return channels.filter(room => {
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
        const roomId = this.computeRoomId(userA, userB);
        const found = channels.find(room => room.id === roomId);
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
        channels.push(room);
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
         * @type {ChannelMessage}
         */
        const message = {
            fromId: fromUser.id,
            toId: toUser.id,
            from: fromUser,
            to: toUser,
            content,
            date: new Date()
        };

        const room  = await ensureRoom(fromUser, toUser);
        room.messages.push(message);
    }
}
