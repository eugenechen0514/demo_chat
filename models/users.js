/**
 * @interface User
 * @property {string} id
 * @property {string} name
 */

/**
 *
 * @type {User[]}
 */
const users = [];

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
     * @param {User} user
     * @return {Promise<User>}
     */
    async ensureRegisterUser(user) {
        const newId = user.id;
        const found = users.find(user => user.id === newId);
        if(found) {
            return found;
        }
        users.push(user);
        return user;
    }
}
