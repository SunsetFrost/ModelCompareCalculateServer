const util = require('util');
const sleep = require('sleep');

const TaskCtrl = require('./task.controller');
const AuthCtrl = require('./auth.controller');
const InstanceCtrl = require('./instance.controller');
const DataCtrl = require('./data.controller');

//event 暂时写死
let dataInfos = [
    { eventName: 'co2', dataId: ''}, 
    { eventName: 'gpp', dataId: ''}, 
    { eventName: 'nee', dataId: ''}, 
    { eventName: 'npp', dataId: ''}
];

async function main() {
    const isRunning = true;
    while(isRunning == true) {
        try {
            //获取task  取一个task启动运行
            const taskArray = await TaskCtrl.getTasks();
            if(taskArray.length !== 0) {
                //暂时  服务器只允许一个task实例运行，该实例运行结束才可开启下一个实例
                await startTask(taskArray[0]);
            }    
        } catch (error) {
            console.log(error);
        }

        sleep.sleep(10);
    }
}

async function startTask(portalTask) {
    //处理并存储task至数据库
    const task = await TaskCtrl.saveTaskToDB(portalTask);
    //创建实例
    const instanceId = await InstanceCtrl.createInstance(task._id.toString());
    //向任务添加实例id
    await TaskCtrl.addInstanceIdToTask(instanceId, task);
    //改变实例运行状态为启动中
    await InstanceCtrl.changeState(instanceId, 'START_PENDING');
    //更改门户任务状态为启动中
    await TaskCtrl.changeTaskState(portalTask._id.toString(), 0, 2);
    //生成配置文件
    await InstanceCtrl.generateConfigFile(instanceId, task);
    //改变实例运行状态为运行中
    await InstanceCtrl.changeState(instanceId, 'RUNNING');
    //更改门户运行状态为运行中
    await TaskCtrl.changeTaskState(portalTask._id.toString(), 2, 4);
    //启动模型 调用模型之前写为await同步方式，因此该方法会等待到模型运行结束， 删除await后ok
    await InstanceCtrl.invokeScript();

    //向数据库轮询模型运行状态
    let isFinished = false;
    while(isFinished == false) {
        const result = await InstanceCtrl.getInstanceById(instanceId);
        if(result[0].state == 'RUN_SUCCEED') {
            isFinished = true;
        } else {
            console.log('轮询模型运行状态中~~~');
        } 
        sleep.sleep(3);
    }
    //改变实例运行状态为数据处理中
    await InstanceCtrl.changeState(instanceId, 'DATA_PROCESSING');
    //处理结果数据
    await DataCtrl.resultDataProcess(portalTask, task, instanceId);
    //上传task数据  更新门户task data状态
    for(index in dataInfos) {
        dataPath = process.cwd() + '\\data\\' + instanceId + '\\' + dataInfos[index].eventName + '.zip';
        const dataId = await DataCtrl.uploadData(dataPath);
        dataInfos[index].dataId = dataId;
    }
    await TaskCtrl.updateTaskDataId(portalTask._id, dataInfos);

    //更改门户运行状态为已完成
    await TaskCtrl.changeTaskState(portalTask._id.toString(), 4, 6);
}


module.exports.main = main;