const http = require('http');

function postJSON(path, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function deleteReq(path) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'DELETE'
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.end();
    });
}

function getJSON(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3000${path}`, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
    });
}

async function runTests() {
    console.log("--- TEST 1: Adding Multi-Winner Result ---");
    const multiWinnerResult = {
        eventName: "Qira'at Competition",
        category: "Super Senior",
        first: [
            { name: "Muhammad", chestNo: "101", team: "Jalali", grade: "A", points: 10 },
            { name: "Ahmad", chestNo: "102", team: "Jamali", grade: "A", points: 10 }
        ],
        second: [
            { name: "Bilal", chestNo: "103", team: "Subhani", grade: "B", points: 7 }
        ],
        third: [
            { name: "Yousef", chestNo: "104", team: "Jalali", grade: "B", points: 5 }
        ]
    };

    const addRes = await postJSON('/api/admin/scoreboard/result', multiWinnerResult);
    console.log("Add Result Response:", addRes);

    const sbData = await getJSON('/api/scoreboard');
    console.log("Total Results in Scoreboard:", sbData.scoreboard.results.length);
    const addedItem = sbData.scoreboard.results.find(r => r.eventName === "Qira'at Competition");
    console.log("Added Multi-Winner Item:", JSON.stringify(addedItem, null, 2));

    if (addedItem) {
        console.log("\n--- TEST 2: Deleting Result ---");
        const delRes = await deleteReq(`/api/admin/scoreboard/result/${addedItem.id}`);
        console.log("Delete Response:", delRes);

        const sbDataAfter = await getJSON('/api/scoreboard');
        const exists = sbDataAfter.scoreboard.results.some(r => String(r.id) === String(addedItem.id));
        console.log("Exists after deletion?", exists);
    }
}

runTests().catch(console.error);
