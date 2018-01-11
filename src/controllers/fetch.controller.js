const fetch = require('isomorphic-fetch');

const AuthCtrl = require('./auth.controller');

function checkStatus(response) {
    if(response.status.code >= 200 && response.status.code < 300) {
        return response;
    } else if(response.status.code == 406) {
        //秘钥过期 重新请求秘钥  发送请求
        const action = 'TokenExpired';
        return action;
    } 
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
}

async function fetchRequest(url, options) {
    const tokenLogin = await AuthCtrl.getLocalLoginToken();
    const tokenNode = await AuthCtrl.getLocalNodeToken();
    const defaultOptions = {
        //Fetch 请求默认是不带 cookie 的，需要设置 fetch(url, {credentials: 'include'})
        credentials: 'incluede',
        headers: {
            Authorization: 'bearer ' + tokenLogin,
            'Authorization-node': 'bearer ' + tokenNode,            
        }
    };
    const newOptions = { ...defaultOptions, ...options };
    if(newOptions.method === 'POST' || newOptions.method === 'PUT') {
        newOptions.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            ...newOptions.headers,
        };
        newOptions.body = JSON.stringify(newOptions.body);
    }

    try {
        const responsePromise = await fetch(url, newOptions);
        const response = await responsePromise.json();
        const action = checkStatus(response);    
        if(action == 'TokenExpired') {
            await AuthCtrl.updateLoginToken();
            await AuthCtrl.updateNodeToken();
            return action;
        }
        return response;
    } catch (error) {
        console.log(`请求错误: ${url}`);
        return error;
    }    
}

async function request(url, options) {
    const response = await fetchRequest(url, options);
    if(response == 'TokenExpired') {
        response = await fetchRequest(url, options);
    }
    return response;
}

module.exports.request = request;