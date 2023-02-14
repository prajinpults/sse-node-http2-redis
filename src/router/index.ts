import {Route} from '../core/index.js';
import {healthController} from '../controllers/healthController.js';
import {sseController} from '../controllers/sseController.js';
import {htmlController} from '../controllers/htmlController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = new Route();
router.get('/', htmlController.handler);
router.get('/health/', healthController.handler);
router.get('/sse/', authMiddleware.handler, sseController.handler);


export {router};
