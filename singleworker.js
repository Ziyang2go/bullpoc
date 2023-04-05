const Bull = require("bull");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

(async function () {
  const myFirstQueue = new Bull("single-job", REDIS_URL);

  myFirstQueue.process(function (job, done) {
    console.log("receive job  ", job.data);
    setTimeout(() => {
      if (job.id % 2) return done(null, { file: "abc" });
      return done(new Error("worker failed"));
    }, 0);
  });
})();
