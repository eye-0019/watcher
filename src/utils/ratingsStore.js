const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'ratings.json');

function loadData() {
    if (!fs.existsSync(filePath)) {
        return { ugly: { counts: {}, holder: null }, hot: { counts: {}, holder: null } };
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Sets the vote count for a message in a category. A count of 0 or less clears the entry.
function setCount(category, messageId, userId, count) {
    const data = loadData();
    if (count <= 0) {
        delete data[category].counts[messageId];
    } else {
        data[category].counts[messageId] = { userId, count };
    }
    saveData(data);
    return data;
}

// Highest count in a category, ties broken by insertion order (first to reach that count wins).
function sortedCandidates(category, data) {
    const entries = Object.values(data[category].counts);
    return entries.sort((a, b) => b.count - a.count);
}

function bestCountForUser(category, data, userId) {
    const entries = Object.values(data[category].counts).filter(e => e.userId === userId);
    return entries.length ? Math.max(...entries.map(e => e.count)) : -1;
}

function pickRawLeader(category, data) {
    const candidates = sortedCandidates(category, data);
    if (!candidates.length) return null;

    const topCount = candidates[0].count;
    const holder = data[category].holder;
    const holderEntry = candidates.find(c => c.userId === holder);
    if (holderEntry && holderEntry.count === topCount) return holder; // ties keep the current holder

    return candidates[0].userId;
}

function nextCandidateExcluding(category, data, excludeUserId) {
    const candidates = sortedCandidates(category, data);
    const match = candidates.find(c => c.userId !== excludeUserId);
    return match ? match.userId : null;
}

// One person can never hold both roles. Resolves conflicts so the person already holding
// a role keeps it; a brand-new conflict goes to whichever category they scored higher in.
function resolveLeaders(data) {
    let uglyLeader = pickRawLeader('ugly', data);
    let hotLeader = pickRawLeader('hot', data);

    if (uglyLeader && uglyLeader === hotLeader) {
        const conflictUser = uglyLeader;
        const holderUgly = data.ugly.holder;
        const holderHot = data.hot.holder;

        if (holderUgly === conflictUser) {
            hotLeader = nextCandidateExcluding('hot', data, conflictUser);
        } else if (holderHot === conflictUser) {
            uglyLeader = nextCandidateExcluding('ugly', data, conflictUser);
        } else {
            const uglyCount = bestCountForUser('ugly', data, conflictUser);
            const hotCount = bestCountForUser('hot', data, conflictUser);
            if (uglyCount >= hotCount) {
                hotLeader = nextCandidateExcluding('hot', data, conflictUser);
            } else {
                uglyLeader = nextCandidateExcluding('ugly', data, conflictUser);
            }
        }
    }

    return { uglyLeader, hotLeader };
}

function setHolder(category, userId, data) {
    data[category].holder = userId;
    saveData(data);
}

module.exports = { loadData, setCount, resolveLeaders, setHolder };
