/**
 * https://github.com/webpack-contrib/worker-loader
 * 
 * To integrate with TypeScript, you will need to define a 
 * custom module for the exports of your worker
 */
declare module "worker-loader!*" {
    class WebpackWorker extends Worker {
      constructor();
    }
  
    export = WebpackWorker;
  }