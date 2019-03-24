"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router = express.Router();
var setRouter = (app) => {
  /**
   * GET status
   */
  router.get('/status', function (req, res) { return res.send({ status: 200 }); });
  // router.route('/list').get(asyncListController.createList);
  // garbage collection route
  router.route('/int-gc-clean').get(function (req, res) {
    global.gc ? global.gc() : 
      console.log('Garbage collection unavailable.  Pass --expose-gc when launching node to enable forced garbage collection.');

    res.json({});
  });
  
  app.use('/clustering', router);
};
exports.setRouter = setRouter;
