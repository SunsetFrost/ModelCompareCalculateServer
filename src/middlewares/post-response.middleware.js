const ResponseModel = require('../models/response.model');

function postMid(app) {
    // unify response
    app.use((req, res, next) => {
        // console.log(res.locals);
        if (res.locals.succeed === true) {
            const resData = ResponseModel;
            resData.href = req.originalUrl;
            resData.token = res.locals.token;
            resData.username = res.locals.username;
            resData.status = {
                code: '200',
                desc: 'succeed'
            };
            resData.data = res.locals.resData;
            resData.template = res.locals.template;
            return res.json(resData);
        } else {
            return next();
        }
    });
}

module.exports = postMid;