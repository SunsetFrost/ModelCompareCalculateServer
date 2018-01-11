const os = require('os');
const fs = require('fs');
const path = require('path');

const setting = {
    app: {
        name: 'SteinsServer',
        version: 'v0.1'
    },
    auth: true,
    port: '9273',
    password: 'lol',
    // session_secret: 'ashdfjhaxaskjfxfjksdjhflak',
    usertoken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ6YnciLCJleHAiOjE1MTU3MjgwOTY5OTF9.w8kJfT5sYXLheA_692NO3wyuUJTf-4h_jy-_PuFsAlc',
    nodetoken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MTU3MjgwOTY5OTN9.RGBNyB8y3lbxwHPlQx5QwJpDM2Le0fHDPyRxNN7I2uI',
    platform: () => {
        let platform = 1;
        if(os.type() == 'Linux') {
            platform = 2;
        }
        return platform;
    },
    mongodb: {
        name: 'SteinsServer',
        host: '127.0.0.1',
        port: '27017'
    },
    portal_server: {
        //host: '172.21.213.146',
        host: '127.0.0.1',
        port: '9999'
    },
    user: {
        username: 'zbw',
        password: 'lol',
        email: '710851944@qq.com',
    },
};

module.exports = setting;