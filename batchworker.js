const Bull = require("bull");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

class Worker {
  constructor() {
    this.startIdle = new Date();
    this.jobQueue = null;
    this.batchQueue = new Bull("batch-queue", REDIS_URL);
  }

  async start() {
    const that = this;
    const checkInterval = setInterval(async () => {
      if (
        that.startIdle &&
        new Date().getTime() - that.startIdle.getTime() > 5000
      ) {
        if (that.jobQueue) await that.jobQueue.close();
        this.processJob();
        that.startIdle = new Date();
      }
    }, 10000);
  }

  async processJob() {
    const jobId = await this.pullJob();
    console.log("get jobs ", jobId);
    if (jobId) this.workOn(jobId);
  }

  async pullJob(orgId) {
    console.log("pulling jobs ");
    const jobs = await this.batchQueue.getJobs(["waiting"]);
    if (orgId) {
      const job = jobs.find((j) => j.data.orgId === orgId);
      if (job) return job.data.jobId;
    }
    if (jobs.length) return jobs[0].data.jobId;
  }

  workOn(jobId) {
    const that = this;
    console.log("start worker on   ", jobId);
    const jobQueue = new Bull(jobId, REDIS_URL);
    this.jobQueue = jobQueue;
    jobQueue.process(function (job, done) {
      that.startIdle = null;
      console.log("start process ", job.id);
      setTimeout(() => {
        console.log("done   ", job.id);
        that.startIdle = new Date();
        done(null, { result: "123" });
      }, 50);
    });
  }
}

(async function () {
  try {
    const worker = new Worker();
    await worker.start();
  } catch (e) {
    console.log("111111111111", e);
  }
})();
