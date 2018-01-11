const baseRouter = require('./base.route');
const TaskRouter = require('./task.route');

const router = new baseRouter();

router.use('/task', TaskRouter);

module.exports = router;