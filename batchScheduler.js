const Bull = require("bull");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

(async function () {
  const batchJobQueue = new Bull("batch-queue", REDIS_URL, {
    limiter: {
      max: 5,
      duration: 5000,
      bounceBack: true,
    },
  });

  const jobId = "222";

  const queue2 = new Bull(jobId, REDIS_URL);

  const tasks = Array(500)
    .fill(0)
    .map((k) => ({ date: { orgId: "xxx" } }));

  console.log(tasks);
  await queue2.addBulk(tasks);

  await queue2.close();

  await batchJobQueue.add({ jobId });
  await batchJobQueue.close();
})();
