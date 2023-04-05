const Bull = require("bull");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

async function addBatchJob(jobId, batchJobQueue, orgId) {
  const queue2 = new Bull(jobId, REDIS_URL);

  const tasks = Array(500)
    .fill(0)
    .map((k) => ({ data: { orgId, jobId } }));

  await queue2.addBulk(tasks);

  const interval = setInterval(async () => {
    const waitingcount = await queue2.getWaitingCount();
    if (!waitingcount) {
      console.log("clean up job");
      const job = await batchJobQueue.getJob(jobId);
      await job.remove();
      await queue2.close();
      clearInterval(interval);
    }
  }, 10000);
}

(async function () {
  const batchJobQueue = new Bull("batch-queue", REDIS_URL, {
    limiter: {
      max: 5,
      duration: 5000,
      bounceBack: true,
    },
  });

  const jobId = `orgB-${new Date().toISOString()}`;
  const orgId = `orgB`;
  await addBatchJob(jobId, batchJobQueue, orgId);
  await batchJobQueue.add({ jobId, orgId: "orgB" }, { jobId });

  setTimeout(async () => {
    const jobId = `orgA-${new Date().toISOString()}`;
    const orgId = `orgA`;
    await addBatchJob(jobId, batchJobQueue, orgId);
    await batchJobQueue.add({ jobId, orgId }, { jobId });
  }, 30000);
  // await batchJobQueue.close();
})();
