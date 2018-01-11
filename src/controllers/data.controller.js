const util = require('util');
const fs = require('fs');
const proj4 = require('proj4');
const exec = util.promisify(require('child_process').exec);

const ApiModel = require('../models/api.model');
const RequestCtrl = require('../controllers/request.controller');

const testAttr = ['gpp', 'npp', 'nee', 'co2'];

let outputDesc = {
    instanceId: '',
    startLocation: [],
    elements: {
        entrance: '',
        entries: []
    },
    meta: {
        desc: '',
        isExample: false,
        spatial: {
            xllcorner: 0,
            yllcorner: 0,
            xsize: 0,
            ysize: 0,
            ncols: 540,
            nrows: 360,
            NODATA_value: -9999,
            unit: 'm'
        },
        temporal: {
            start: '',
            end: '',
            scale: ''
        },
        feature: ''
    },
    schema$: {
        src: 0,
        type: 'ASCII_GRID_RAW_BATCH',
        description: '',
        structure: {},
        semantic: {
            concepts: [],
            spatialRefs: [],
            units: [],
            dataTemplates: []
        }
    }
}

//创建输出数据的描述文件
async function  createOutputDescFile(instanceId, portalTask, task) {
    const dataPath = process.cwd() + '\\data';
    const configDir = dataPath + '\\' + instanceId;

    //对描述文件赋值
    outputDesc.instanceId = instanceId;
    outputDesc.startLocation = [parseInt(task.spatial.startRow), parseInt(task.spatial.startCol)];

    const entryArray = [];
    entryArray.push(task.time.start + '.txt');
    while(task.time.start != task.time.end) {
        entry = task.time.start + '.txt';
        entryArray.push(entry);
        task.time.start = toString(parseInt(task.time.start) + 1);
    }
    outputDesc.elements.entries = entryArray;

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
    const leftBottom = [lx, ly];
    const leftBottomProj = proj4('EPSG:3857', leftBottom);
    outputDesc.meta.spatial.xllcorner = leftBottomProj[0];
    outputDesc.meta.spatial.yllcorner = leftBottomProj[1];
    //test 暂时写死
    outputDesc.meta.spatial.xsize = 74212.99386218238;
    outputDesc.meta.spatial.ysize = 74212.99386218238;

    outputDesc.meta.spatial.nrows = parseInt(task.spatial.endRow) - parseInt(task.spatial.startRow) + 1;
    outputDesc.meta.spatial.ncols = parseInt(task.spatial.endCol) - parseInt(task.spatial.startCol) + 1;

    outputDesc.meta.temporal.start = task.time.start;
    outputDesc.meta.temporal.end = task.time.end;
    outputDesc.meta.temporal.scale = 'Year';
    //输出项暂时写死  之后改为可配置
    outputDesc.meta.feature = testAttr;

    const strOutputDesc = JSON.stringify(outputDesc);
    try {
        configPath = configDir + '\\output.cfg';
        await util.promisify(fs.appendFile)(configPath, strOutputDesc);    
        return configPath;
    } catch (error) {
        console.log('create desc file error' + error);
    }
}

//调用脚本处理输出数据
async function invokeScript(configPath) {
    const invokeStr = 'python data_process.py ' + configPath;
    const options = {
        cwd: process.cwd() + '\\src\\tools',
        shell: 'cmd.exe'
    }

    await exec(invokeStr, options);
}

//向门户上传数据
async function uploadData(dataPath) {
    const url = ApiModel.getAPIUrl('upload-data');
    const body = {
        userId: '5a4200750afd24482430882c',
        desc: '',
        src: '0',
        'geo-data': fs.createReadStream(dataPath)
    }
    try {
        const result = await RequestCtrl.postByServer(url, body, RequestCtrl.PostRequestType.File);
        return JSON.parse(result).data.doc._id.toString();
    } catch (error) {
        console.log(error);
    }
}

//main
async function resultDataProcess(portalTask, task, instanceId) {
    //创建输出数据的文件夹结构
    //结构 instance folder->attr folder
    // const dataPath = process.cwd() + '\\data';
    // const instancePath = dataPath + '\\' + instanceId;
    // try {
    //     await util.promisify(fs.mkdir)(instancePath);
    //     for(index in testAttr) {
    //         const attrPath = instancePath + '\\' + testAttr[index];
    //         await util.promisify(fs.mkdir)(attrPath);
    //         //创建描述文件
    //         await createOutputDescFile(attrPath, portalTask, task, instanceId, testAttr[index]);
    //         //
    //     }
    // } catch (error) {
    //     console.log('create output folder failed\n' + error);
    // }

    //创建实例文件夹
    const instanceDir = process.cwd() + '\\data\\' + instanceId;
    await util.promisify(fs.mkdir)(instanceDir);
    //创建配置文件
    const configPath = await createOutputDescFile(instanceId, portalTask, task);
    //调用脚本根据配置文件提取数据
    await invokeScript(configPath);
    
    return ;
}

module.exports.resultDataProcess = resultDataProcess;
module.exports.uploadData = uploadData;