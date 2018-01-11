const APIS = {
    data: [
        {
            id: 'register-portal',
            pathname: '/auth/register',
            desc: '',
        },
        {
            id: 'get-login-token',
            pathname: '/auth/login',
            desc: '',
        },
        {
            id: 'update-login-token',
            pathname: '/auth/login',
            desc: '',
        },
        {
            id: 'get-node-token',
            pathname: '/nodes',
            desc: '',
        },
        {
            id: 'update-node-token',
            pathname: '/nodes/login',
            desc: '',
        },
        {
            id: 'get-tasks',
            pathname: '/nodes/:nodeName/tasks',
            desc: '',
        },
        {
            id: 'update-task-state',
            pathname: '/nodes/:nodeName/tasks/:instanceId/state',
            desc: '',
        },
        {
            id: 'upload-data',
            pathname: '/data',
            desc: '',
        },
        {
            id: 'update-task-data-id',
            pathname: '/nodes/:nodeName/tasks/:taskId/data',
            desc: '',
        }
    ]
}

module.exports = APIS;