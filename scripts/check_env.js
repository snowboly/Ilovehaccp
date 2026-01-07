
require('dotenv').config({ path: '.env.local' });
if (process.env.PEXELS_API_KEY) {
    console.log("PEXELS_API_KEY is present.");
} else {
    console.log("PEXELS_API_KEY is MISSING.");
}
