const _ = require('lodash');

const setting = require('../config/setting');
const ApiModel = require('../models/api.model');
const taskDB = require('../models/task.model').taskDB;
const RequestCtrl = require('../controllers/fetch.controller');
const InstanceCtrl = require('../controllers/instance.controller');

//测试功能
const getSteinsInfo = (req, res, next) => {
    res.locals.succeed = true;
    const result = 'whatever parallel universe you are in, I will find and save you';
    res.locals.resData = [{
        info: result
    }];
    res.locals.template = [{
        info: 'string'
    }];
    return next();
}

//获取task
async function getTasks() {
    const url = ApiModel.getAPIUrl('get-tasks', {
        nodeName: setting.app.name
    });
    try {
        const result = await RequestCtrl.request(url, {});
        const tasks = result.data.docs;
        return tasks;
    } catch (error) {
        return error;
    }
}

//更新task状态
async function changeTaskState(instanceId, oldState, newState) {
    const url = ApiModel.getAPIUrl('update-task-state', {
        nodeName: setting.app.name,
        instanceId: instanceId
    });
    const options = {
        method: 'PUT',
        body: {
            oldState: oldState,
            newState: newState
        }
    }
    try {
        const result = await RequestCtrl.request(url, options);
    } catch (error) {
        console.log(error);
    }
}

//保存task至数据库
async function saveTaskToDB(portalTask) {
    try {
        const task = taskDB.convertTask(portalTask);
        const dbResult = await taskDB.insert(task);
        return dbResult;
    } catch (error) {
        console.log('save task error\n' + error);
        //return null;
    }
}

//添加instanceId至task
async function addInstanceIdToTask(instanceId, task) {
    try {
        const strWhere = {
            _id: task._id
        }
        const strUpdate = {
            $push: {
                instanceIds: instanceId
            }
        }
        const dbResult = await taskDB.update(strWhere, strUpdate);
        const lalla = '';
    } catch (error) {
        console.log('add instanceid to task failed \n' + error);
    }
}

//更新task数据状态
async function updateTaskDataId(taskId, dataInfos) {
    const url = ApiModel.getAPIUrl('update-task-data-id', {
        nodeName: setting.app.name,
        taskId: taskId
    })
    const options = {
        method: 'POST',
        body: {
            outputs: dataInfos
        }
    }
    try {
        const result = await RequestCtrl.request(url, options);
    } catch (error) {
        console.log(error);
    }
}

module.exports.getSteinsInfo = getSteinsInfo;
module.exports.getTasks = getTasks;
module.exports.saveTaskToDB = saveTaskToDB;
module.exports.addInstanceIdToTask = addInstanceIdToTask;
module.exports.changeTaskState = changeTaskState;
module.exports.updateTaskDataId = updateTaskDataId;