const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const execFile = util.promisify(require('child_process').execFile);
const moment = require('moment');
const ObjectId = require('bson-objectid');

const setting = require('../config/setting');
const instanceDB = require('../models/instance.model').instanceDB;

//生成配置文件
async function generateConfigFile(instanceId, task) {
    const fileContent = instanceId + ' ' + task.time.start + ' ' + task.time.end + ' ' + task.time.totalDays + ' ' + task.spatial.startRow + ' ' 
        + task.spatial.endRow + ' ' + task.spatial.startCol + ' ' + task.spatial.endCol;

    try {
        //删除已存在的配置文件
        configPath = process.cwd() + '\\model\\ibis\\model.conf';
        await util.promisify(fs.unlink)(configPath);  

        await util.promisify(fs.appendFile)(configPath, fileContent);
    } catch (error) {
        console.log('create config file error');
    }
}

//调用python脚本 cmd
async function invokeScriptByCmd() {
    const invokeStr = 'spark-submit --master local[1] spark.mongodb.input.uri=mongodb://' + setting.mongodb.host + '/' + setting.mongodb.name
        + '.Data?readPreference=primaryPreferred --conf spark.mongodb.output.uri=mongodb://' + setting.mongodb.host + '/' + setting.mongodb.name
        + '.Data --packages org.mongodb.spark:mongo-spark-connector_2.11:2.2.0 ./run.py';
    //设置脚本运行目录
    const pCwd = process.cwd() + '\\src\\tools';
    const options= {
        cwd: pCwd,
        maxBuffer: 1024 * 1024,
        shell: 'cmd.exe'
    }

    const startTime = moment();
    const { stdout, stderr } = await exec(invokeStr, options);
    const endTime = moment();

    console.log('time:' + endTime.diff(startTime, "s"));
    console.log('stdout:' + stdout);
    console.log('stderr:' + stderr);
}

//调用python脚本 bat
async function invokeScriptByBat() {
    const pCwd = process.cwd() + '\\src\\tools';
    const invokeFile = '\\test.bat';
    const invokePath = pCwd + invokeFile;

    const startTime = moment();
    const { stdout, stderr } = execFile(invokePath, [setting.mongodb.host, setting.mongodb.name]);
    const endTime = moment();

    //console.log('time:' + endTime.diff(startTime, "s"));
}

//创建实例
async function createInstance(taskid) {
    try {
        const instance = {
            taskId: taskid,
            startTime: moment().format(),
            endTime: '0',
            state: 'INIT'
        }
        resultIns = await instanceDB.insert(instance);
        return resultIns._id.toString();
    } catch (error) {
        console.log('create instance failed\n' + error);
    }
}

//查询实例
async function getInstanceById(instanceId) {
    try {
        const strWhere = {
            _id: ObjectId(instanceId)
        }
        result = await instanceDB.find(strWhere);
        return result;
    } catch (error) {
        console.log('find instance failed\n' + error);
    }
}

//更改实例状态
async function changeState(instanceId, state) {
    try {
        const strWhere = {
            _id: ObjectId(instanceId)
        }
        const strUpdate = {
            $set: {
                state: state
            }
        }
        const dbResult = await instanceDB.update(strWhere, strUpdate);
    } catch (error) {
        console.log('change instance state failed\n' + error);
    }
}

module.exports.invokeScript = invokeScriptByBat;
module.exports.generateConfigFile = generateConfigFile;
module.exports.createInstance = createInstance;
module.exports.getInstanceById = getInstanceById;
module.exports.changeState = changeState;