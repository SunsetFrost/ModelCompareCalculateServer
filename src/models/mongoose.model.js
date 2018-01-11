const mongoose = require('mongoose');
const setting = require('../config/setting');

mongoose.Promise = global.Promise;
const url = 'mongodb://' + setting.mongodb.host + ':' + setting.mongodb.port + '/' + setting.mongodb.name;

mongoose.connect(url, {
    useMongoClient: true
});

class MongooseBase {
    constructor(collName, schema) {
        this.schema = new mongoose.Schema(schema, {
            collection: collName
        });
        this.model = mongoose.model(collName, this.schema);
    }

    find(where) {
        return new Promise((resolve, reject) => {
            this.model.find(where, (err, rst) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(rst);
                }
            });
        });
    }

    remove(where) {
        return new Promise((resolve, reject) => {
            this.model.remove(where, err => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            });
        });
    }

    insert(item) {
        const model = new this.model(item);
        return new Promise((resolve, reject) => {
            model.save((err, rst) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(rst._doc);
                }
            });
        });
    }

    update(where, update) {
        return new Promise((resolve, reject) => {
            this.model.update(where, update, (err, rst) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(rst);
                }
            });
        });
    }
}

module.exports = MongooseBase;