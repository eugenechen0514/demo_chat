/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {User} ChatUser
 * @property {boolean} isOnline
 */

/**
 *
 * @type {User[]}
 */
const users = [
    {
        id: 'a',
        name: 'name-a',
    }, {
        id: 'b',
        name: 'name-b',
    },{
        id: 'c',
        name: 'name-c',
    }
];

module.exports = {
    /**
     *
     * @return {Promise<User[]>}
     */
    async getUsers() {
        return users;
    },

    /**
     *
     * @param userId
     * @return {Promise<User | undefined>}
     */
    async findUser(userId) {
        return users.find(user => user.id === userId);
    },

    /**
     *
     * @param {User} user
     * @return {Promise<User>}
     */
    async ensureRegisterUser(user) {
        const newId = user.id;
        const found = users.find(user => user.id === newId);
        if(found) {
            return found;
        }
        // register
        users.push(user);
        return user;
    }
}
