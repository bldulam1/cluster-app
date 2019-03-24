import express = require('express');

const router = express.Router();

const setRouter = (app: express.Application) => {
  /**
   * GET status
   */
  router.get('/status', (req, res) => res.send({status: 200}));
  // router.route('/list').get(asyncListController.createList);

  // garbage collection route
  router.route('/int-gc-clean').get((req, res) => {
    if (global.gc) {
      global.gc();
    } else {
      console.log('Garbage collection unavailable.  Pass --expose-gc when launching node to enable forced garbage collection.');
    }
    res.json({});
  });

  app.use('/clustering', router);
}

export { setRouter };