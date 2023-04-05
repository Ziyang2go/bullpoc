const Bull = require("bull");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

(async function () {
  const singleQueue = new Bull("single-job", REDIS_URL);

  const jobs = await singleQueue.getNextJob();
  singleQueue.on("global:failed", function (jobId, result) {
    console.log("report failed", jobId, result);
  });

  singleQueue.on("global:stalled", function (job, result) {
    console.log("report stalled", job);
  });

  singleQueue.on("global:completed", async function (jobId, result) {
    console.log(`Job ${jobId} completed! Result: ${result}`);
    const numOfJobs = await singleQueue.getJobs();
    console.log(numOfJobs.length);
  });

  setInterval(() => {
    singleQueue.add(
      { orgId: "xxx", date: new Date() },
      {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }, 3000);
})();
