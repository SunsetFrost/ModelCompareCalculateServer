const fs = require('fs');
const request = require('request');
const requestPromise = require('request-promise');

const setting = require('../config/setting')

const getByServer = (url, headers, form = '', isFullResponse = true)=> {
    const options = {
        url: url,
        method: 'GET',
        qs: form,
        headers: headers,
        resolveWithFullResponse: isFullResponse === true
    };
    return requestPromise(options);
};

const postByServer = (url, body, type) => {
    const options = {
        uri: url,
        method: 'POST'
    };
    if (type === PostRequestType.JSON) {
        // 后台信息都会存在req.body中
        options.body = body;
        // must add this line
        // encode the body to stringified json
        options.json = true;
        // Is set automatically
        options.headers = {
            'content-type': 'application/json',
            Authorization: 'bearer ' + setting.usertoken,
            'Authorization-node': 'bearer ' + setting.nodetoken
        };
    } else if (type === PostRequestType.Form) {
        // 后台会全部放在req.body中。
        // 所以如果有文件的话，不能放在form中，headers不能为urlencoded
        options.form = body;
        // Is set automatically
        options.headers = {
            'content-type': 'application/x-www-form-urlencoded'
        };
    } else if (type === PostRequestType.File) {
        // 后台不在req.body, req.params, req.query中。
        // 所以如果在req.query中取值，要把那部分单独拿出来，插入到url中
        options.formData = body;
        // Is set automatically
        options.headers = {
            'content-type': 'multipart/form-data',
            Authorization: 'bearer ' + setting.usertoken,
            'Authorization-node': 'bearer ' + setting.nodetoken
        };
    }
    return requestPromise(options);
};

const putByServer = (url, headers, body) => {
    const options = {
        url: url,
        method: 'PUT',
        headers: headers,
        body: body,
        json: true,
    }
    return requestPromise(options);
};

// 通过管道请求转发 TODO fix hot
const getByPipe = (req, url) => {
    return new Promise((resolve, reject) => {
        req.pipe(
            request.get(url, (err, response, body) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve({
                        response: response,
                        body: body
                    });
                }
            })
        );
    });
};

const postByPipe = (req, url) => {
    return new Promise((resolve, reject) => {
        req.pipe(
            request
                .post(url)
                .then(response => {
                    return resolve(response);
                })
                .catch(error => {
                    return reject(error);
                })
        );
    });
};

const PostRequestType = {
    // JSON REST API
    JSON: 1,
    // POST like a form
    Form: 2,
    // contains file
    File: 3
}

module.exports.getByServer = getByServer;
module.exports.postByServer = postByServer;
module.exports.putByServer = putByServer;
module.exports.PostRequestType = PostRequestType;