import http = require('http');
import morgan = require('morgan');
import bodyParser = require('body-parser');
import express = require('express');
import cluster = require('cluster');
import { setRouter } from './src/routes';
// import https = require('https');
// import os = require('os');

process.on('unhandledRejection', (rejectionErr) => {
  // Won't execute
  console.error('unhandledRejection Err::', rejectionErr);
  // console.error('unhandledRejection Stack::', JSON.stringify(rejectionErr.stack));
});

process.on('uncaughtException', (uncaughtExc) => {
  console.error('uncaughtException Err::', uncaughtExc);
  console.error('uncaughtException Stack::', JSON.stringify(uncaughtExc.stack));
});

const app: express.Application = express();
let workers: any[] = [];

/**
 * Setup number of worker processes to share port which will be defined while setting up server
 */
const setupWorkerProcesses = () => {
  // to read number of cores on system
  let numCores = require('os').cpus().length;
  console.log('Master cluster setting up ' + numCores + ' workers');

  // iterate on number of cores need to be utilized by an application
  // current example will utilize all of them
  for(let i = 0; i < numCores; i++) {
    // creating workers and pushing reference in an array
    // these references can be used to receive messages from workers
    workers.push(cluster.fork());

    // to receive messages from worker process
    workers[i].on('message', (message:string) => {
      console.log(message);
    });
  }

  // process is clustered on a core and process id is assigned
  cluster.on('online', worker => {
    console.log('Worker ' + worker.process.pid + ' is listening');
  });

  // if any of the worker process dies then start a new one by simply forking another one
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`)
    console.log('Starting a new worker');
    cluster.fork();
    workers.push(cluster.fork());
    // to receive messages from worker process
    workers[workers.length-1].on('message', (message: string) => {
      console.log(message);
    });
  });
};

/**
 * Setup an express server and define port to listen all incoming requests for this application
 */
const setUpExpress = () => {
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
  setRouter(app);

  // start server
  const listener: any = app.listen(8000, () => {
    console.log(`Started server on => http://localhost:${listener.address().port} for Process Id ${process.pid}`);
  });

  // in case of an error
  app.on('error', (parent) => {
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
const setupServer = (isClusterRequired: any) => {
  // if it is a master process then call setting up worker process
  if(isClusterRequired && cluster.isMaster) {
    setupWorkerProcesses();
  } else {
    // to setup server configurations and share port address for incoming requests
    setUpExpress();
  }
};

setupServer(true);

export {app}