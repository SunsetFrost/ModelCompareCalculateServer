const MongooseBase = require('./mongoose.model');
const mongoose = require('mongoose');

class AuthDB extends MongooseBase {
    constructor() {
        const collName = 'Auth';
        const schema = {
            user: {
                username: String,
                password: String,
                email: String,
                token: String
            },
            node: {
                nodename: String,
                password: String,
                src: Number,
                token: String
            }
        }
        
        super(collName, schema);
    }
}

const authDB = new AuthDB();
module.exports = authDB;