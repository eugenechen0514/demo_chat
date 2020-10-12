/**
 * @interface Room
 * @property {string} id
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
     * @return {Room[]}
     */
    getUserRooms(user) {
        return rooms.filter(room => {
            const ids = room.id.split('-');
            return ids.find(id => id === user.id);
        });
    }
}
