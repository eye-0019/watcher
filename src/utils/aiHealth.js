// ============================================================
// Watcher AI Health Tracker
// Tracks uptime, response speed, and status
// ============================================================


const startTime = Date.now();



let status = "online";

let currentModel = "unknown";

let lastResponseTime = null;

let totalRequests = 0;

let failedRequests = 0;

let lastSuccess = null;



function setOnline(model) {

    status = "online";

    currentModel = model;

}



function setOffline() {

    status = "offline";

}



function recordSuccess(
    responseTime,
    model
) {

    status = "online";

    currentModel = model;

    lastResponseTime = responseTime;

    lastSuccess = new Date();

    totalRequests++;

}



function recordFailure() {

    failedRequests++;

    totalRequests++;

}



function getHealth() {

    const uptime =
        Date.now() - startTime;


    return {

        status,

        currentModel,

        lastResponseTime,

        lastSuccess,

        totalRequests,

        failedRequests,

        uptime:

            Math.floor(
                uptime / 1000
            )

    };

}



module.exports = {

    setOnline,

    setOffline,

    recordSuccess,

    recordFailure,

    getHealth

};
