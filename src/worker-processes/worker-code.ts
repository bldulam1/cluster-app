import { ChildProcess } from "child_process";

export default class AsyncListController {

  createList = async(req: any, res: any) => {
    await this.populateHugeList();
    res.json({ ProcessId: 'Worker Process Id' + process.pid });
  };

  /* populate list with million elements
   */
  populateHugeList = async() => {
    // var process: a = process;
    let lst = new Array(1e6);
      for(let k = 0; k < lst.length; k++) {
      lst[k] = k*5;
    }

    // console.log(lst);
    
    // after populating elements
    // fire a message informing master that list is created only in cluster mode
    (<any>process).send('List is created on worker process id ' + process.pid);
  };
}
