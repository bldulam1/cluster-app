"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var morgan = require("morgan");
var bodyParser = require("body-parser");
var express = require("express");
var cluster = require("cluster");
// import https = require('https');
// import os = require('os');
process.on('unhandledRejection', function (rejectionErr) {
    // Won't execute
    console.error('unhandledRejection Err::', rejectionErr);
    // console.error('unhandledRejection Stack::', JSON.stringify(rejectionErr.stack));
});
process.on('uncaughtException', function (uncaughtExc) {
    console.error('uncaughtException Err::', uncaughtExc);
    console.error('uncaughtException Stack::', JSON.stringify(uncaughtExc.stack));
});
var app = express();
exports.app = app;
var workers = [];
/**
 * Setup number of worker processes to share port which will be defined while setting up server
 */
var setupWorkerProcesses = function () {
    // to read number of cores on system
    var numCores = require('os').cpus().length;
    console.log('Master cluster setting up ' + numCores + ' workers');
    // iterate on number of cores need to be utilized by an application
    // current example will utilize all of them
    for (var i = 0; i < numCores; i++) {
        // creating workers and pushing reference in an array
        // these references can be used to receive messages from workers
        workers.push(cluster.fork());
        // to receive messages from worker process
        workers[i].on('message', function (message) {
            console.log(message);
        });
    }
    // process is clustered on a core and process id is assigned
    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is listening');
    });
    // if any of the worker process dies then start a new one by simply forking another one
    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
        workers.push(cluster.fork());
        // to receive messages from worker process
        workers[workers.length - 1].on('message', function (message) {
            console.log(message);
        });
    });
};
/**
 * Setup an express server and define port to listen all incoming requests for this application
 */
var setUpExpress = function () {
    // create server
    // app.server = http.createServer(app);
    // logger
    app.use(morgan('tiny'));
    // parse application/json
    app.use(bodyParser.json({
        limit: '2000kb',
    }));
    app.disable('x-powered-by');
    // routes
    // setRouter(app);
    // start server
    app.listen('8000', function () {
        console.log("Started server on => http://localhost:3000 for Process Id " + process.pid);
    });
    // in case of an error
    app.on('error', function (parent) {
        console.error('app error', parent.stack);
        console.error('on url', parent.routes);
        console.error('with headers', parent.head);
    });
};
/**
 * Setup server either with clustering or without it
 * @param isClusterRequired
 * @constructor
 */
var setupServer = function (isClusterRequired) {
    // if it is a master process then call setting up worker process
    if (isClusterRequired && cluster.isMaster) {
        setupWorkerProcesses();
    }
    else {
        // to setup server configurations and share port address for incoming requests
        setUpExpress();
    }
};
setupServer(true);
