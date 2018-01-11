const setting = require('../config/setting');

const ResponseModel = {
    app: setting.app,                 // app base info
    href: '',
    token: '',                                  // 身份认证
    status: {
        code: '',                            // http状态码
        desc: '',                               // 可以放出错的详细信息
    },
    data: '',
    template: '',                                  // 返回数据的结构
    username: '',
}

module.exports = ResponseModel;