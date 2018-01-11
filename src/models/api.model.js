const _ = require('lodash');

const APIS = require('../config/api.config');
const setting = require('../config/setting');

const getAPIById = (id) => {
    return _.find(APIS.data, (api) => {
        return api.id === id;
    });
};

const getAPIUrl = (id, params=undefined) => {
    let path = getAPIById(id).pathname;
    if(params !== undefined) {
        for(const key in params) {
            path = _.replace(path, ':' + key, params[key]);
        }
    }
    return `http://${setting.portal_server.host}:${setting.portal_server.port}${path}`;
};

module.exports.getAPIUrl = getAPIUrl;