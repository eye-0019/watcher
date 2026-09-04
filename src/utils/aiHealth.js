// ============================================================
// Watcher AI Health Tracker v2
// ============================================================


const startTime = Date.now();


let status = "online";

let currentModel = "unknown";

let lastResponseTime = 0;

let totalRequests = 0;

let failedRequests = 0;

let lastError = null;



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

    lastResponseTime =
        responseTime;

    totalRequests++;

}



function recordFailure(error) {

    failedRequests++;

    totalRequests++;

    lastError =
        error?.message ||
        String(error);

}



function getHealth() {

    return {

        status,

        currentModel,

        lastResponseTime,

        totalRequests,

        failedRequests,

        lastError,

        uptime:
            Math.floor(
                (Date.now() - startTime) / 1000
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
