const _ = require('lodash');

const setting = require('../config/setting');
const ApiModel = require('../models/api.model');
const authDB = require('../models/auth.model');
const RequestCtrl = require('../controllers/request.controller');

//获取门户node秘钥
async function getNodeTokenFromPortal() {
    const url = ApiModel.getAPIUrl('get-node-token');
    const body = {
        host: setting.host,
        port: setting.port,
        auth: {
            nodeName: setting.app.name,
            password: setting.password,
            src: 0
        }
    }
    try {
        const result = await RequestCtrl.postByServer(url, body, RequestCtrl.PostRequestType.JSON);
        console.log(result);
    } catch (error) {
        console.log(error);
    }
}

//获取门户登录秘钥
async function getLoginTokenFromPortal() {
    const url = ApiModel.getAPIUrl('get-login-token');
    const body = {
        username: setting.user.username,
        password: setting.user.password
    }
    try {
        const result = await RequestCtrl.postByServer(url, body, RequestCtrl.PostRequestType.JSON);

        if(result.data.jwt.token == null) {
            throw "get token error";
        }
        const test = {
            user: {
                username: setting.user.username,
                password: setting.user.password,
                email: setting.user.email,
                token: result.data.jwt.token
            },
            node: {
                nodename: setting.app.name,
                password: setting.password,
                src: 0,
                token: 'String'
            }
        }
        const res = await authDB.insert(test);
    } catch (error) {
        console.log(error);
    }  
}

//更新login秘钥
async function updateLoginToken() {
    const url = ApiModel.getAPIUrl('get-login-token');
    const body = {
        username: setting.user.username,
        password: setting.user.password
    }
    try {
        const result = await RequestCtrl.postByServer(url, body, RequestCtrl.PostRequestType.JSON);

        if(result.data.jwt.token == null) {
            throw "get token error";
        }

        setting.usertoken = result.data.jwt.token;
        const strWhere = {
            'user.username': setting.user.username
        }
        const strUpdate = {
            $set: {
                'user.token': setting.usertoken
            }  
        }

        const res = await authDB.update(strWhere, strUpdate);
    } catch (error) {
        console.log(error);
    }  
}

//更新node秘钥
async function updateNodeToken() {
    const url = ApiModel.getAPIUrl('update-node-token');
    const body = {
            nodeName: setting.app.name,
            password: setting.password,
            Authorization: "bearer " + setting.usertoken
    }
    try {
        const result = await RequestCtrl.postByServer(url, body, RequestCtrl.PostRequestType.JSON);

        if(result.data.token == null) {
            throw "get token error";
        }

        setting.nodetoken = result.data.token;
        const strWhere = {
            'user.username': setting.user.username
        }
        const strUpdate = {
            $set: {
                'node.token': setting.nodetoken
            }  
        }
        const res = await authDB.update(strWhere, strUpdate);

    } catch (error) {
        console.log(error);
    }
}

//获取本地login秘钥
async function getLocalLoginToken() {
    try {
        const strWhere = {};
        const authItem = await authDB.find(strWhere);
        return authItem[0].user.token;
    } catch (error) {
        console.log('读取本地logintoken失败');
        return error;
    }
}

//获取本地node秘钥
async function getLocalNodeToken() {
    try {
        const strWhere = {};
        const authItem = await authDB.find(strWhere);
        return authItem[0].node.token;
    } catch (error) {
        console.log('读取本地nodetoken失败');
        return error;
    }
}

module.exports.getLocalLoginToken = getLocalLoginToken;
module.exports.getLocalNodeToken = getLocalNodeToken;
module.exports.updateLoginToken = updateLoginToken;
module.exports.updateNodeToken = updateNodeToken;
