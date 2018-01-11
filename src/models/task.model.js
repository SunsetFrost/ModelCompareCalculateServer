//通过portal获取的task  转换经纬度，时间等 返回模型实际运行所需的task数据   
//
const moment = require('moment');
const mongoose = require('mongoose');

const MongooseBase = require('./mongoose.model');

const task = {
    modelId : '',
    instanceIds: [],
    time : {
        start : '',
        end : '',
        totalDays : '',
    },
    spatial : {
        startRow : '',
        endRow : '',
        startCol : '',
        endCol : '',
    }
}

//数据库访问类
class TaskDB extends MongooseBase {
    constructor() {
        const collName = 'Task';
        const schema = {
            modelId: String,
            instanceIds: [String],
            time: {
                start: String,
                end: String,
                totalDays: String
            },
            spatial: {
                startRow: String,
                endRow: String,
                startCol: String,
                endCol: String
            }
        }

        super(collName, schema);
    };

    //转换时间
    getTimeFromPortalTask(portalTask) {
        // startDate = new Date(portalTask.calcuCfg.stdStr.temporal.start);
        // endDate = new Date(portalTask.calcuCfg.stdStr.temporal.end);
        const startDate = moment(portalTask.calcuCfg.stdSrc.temporal.start);
        const endDate = moment(portalTask.calcuCfg.stdSrc.temporal.end);
        const totalDays = endDate.diff(startDate, 'd');

        return [startDate.format('YYYY'), endDate.format('YYYY'), totalDays];
    }

    //转换经纬度
    getSpatialFromPortalTask(portalTask) {
        const coordinates = portalTask.calcuCfg.stdSrc.spatial.polygon.features[0].geometry.coordinates[0];

        //遍历坐标获得x,y 范围
        let lx = coordinates[0][0]; let rx = coordinates[0][0];
        let ly = coordinates[0][1]; let ry = coordinates[0][1]; 
        coordinates.forEach(coor => {
            if(coor[0] < lx) {
                lx = coor[0];
            } else if(coor[0] > rx) {
                rx = coor[0]
            }
            if(coor[1] < ly) {
                ly = coor[1];
            } else if(coor[1] > ry) {
                ry = coor[1];
            }
        });
        //根据x,y获取行列范围
        const startRow = Math.round((ry + 90)*2) ; 
        const endRow = Math.round((ly + 90)*2);
        const startCol = Math.round(lx/0.66 + 270); 
        const endCol = Math.round(rx/0.66 + 270);

        return [startRow, endRow, startCol, endCol];
    }

    //转换门户task至计算task
    convertTask(portalTask) {
        task.modelId = portalTask.msId;
        task.instanceIds = [];
        [task.time.start, task.time.end, task.time.totalDays] = this.getTimeFromPortalTask(portalTask);
        [task.spatial.startRow, task.spatial.endRow, task.spatial.startCol, task.spatial.endCol] = this.getSpatialFromPortalTask(portalTask);

        //测试需要  totaldays+1
        task.time.totalDays = (parseInt(task.time.totalDays) + 1).toString(); 
        return task;
    }
}

const taskDB = new TaskDB();
module.exports.taskDB = taskDB;