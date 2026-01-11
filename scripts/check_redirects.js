
const fetch = require('node-fetch');

async function checkRedirect(url) {
    console.log(`Checking: ${url}`);
    try {
        const res = await fetch(url, { redirect: 'manual' });
        console.log(`Status: ${res.status}`);
        if (res.status >= 300 && res.status < 400) {
            console.log(`Redirects to: ${res.headers.get('location')}`);
            // Follow it
            const nextUrl = res.headers.get('location');
            if (nextUrl.startsWith('/')) {
                 await checkRedirect(new URL(nextUrl, url).toString());
            } else {
                 await checkRedirect(nextUrl);
            }
        } else {
            console.log("Final Destination Reached.");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

async function run() {
    // Check non-www to www
    await checkRedirect('https://ilovehaccp.com');
    console.log('---');
    // Check http to https
    await checkRedirect('http://ilovehaccp.com');
}

run();
