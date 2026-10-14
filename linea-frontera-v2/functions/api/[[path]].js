import '../_lib/routes.js';
import '../_lib/web.js';
import '../_lib/admin.js';
import '../_lib/admin-web.js';
import { dispatch } from '../_lib/router.js';

export const onRequest = (context) => dispatch(context);
