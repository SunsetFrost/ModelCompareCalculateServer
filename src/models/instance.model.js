const mongoose = require('mongoose');

const MongooseBase = require('./mongoose.model');

// 实例状态
// INIT = 0,
// PAUSE,
// START_PENDING,
// START_FAILED,
// RUNNING,
// RUN_FAILED,
// RUN_SUCCEED
//DATA_PROCESSING
//FINISH

class InstanceDB extends MongooseBase {
    constructor() {
        const collName = 'Instance';
        const schema = {
            taskId: String,
            startTime: String,
            endTime: String,
            state: String
        }

        super(collName, schema);
    }
}

const instanceDB = new InstanceDB();
module.exports.instanceDB = instanceDB;