const express = require('express');
const path = require('path');
const http = require('http');

const setting = require('./config/setting');
const ResponseModel = require('./models/response.model');
const CalcManageCtrl = require('./controllers/steins.controller');
const router = require('./routes/index.route');
const preRouter = require('./middlewares/pre-request.middleware');
const postRouter = require('./middlewares/post-response.middleware');


let app = express();

const startServer = () => {
    app.set('port', setting.port);
    console.log(setting.port);

    preRouter(app);

    app.use('/', router);

    postRouter(app);

    const server = http.createServer(app);
    server.listen(app.get('port'));
    server.on('error', (error) => {
        const port = app.get('port');
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });
    server.on('listening', () => {
        const addr = server.address();
        const bind =
            typeof addr === 'string'
                ? 'Pipe: ' + addr
                : 'Port: ' + addr.port;   
    });
    console.log('server start');
    CalcManageCtrl.main();
}

startServer();