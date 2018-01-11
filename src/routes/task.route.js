const baseRouter = require('./base.route');
const TaskCtrl = require('../controllers/task.controller');
const postRouter = require('../middlewares/post-response.middleware');

const router = new baseRouter();

router.route('/steins')
    .get(TaskCtrl.getSteinsInfo);

module.exports = router;