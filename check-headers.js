const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkHeaders() {
    try {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
        const sheetName = "Image & Video Data Collection / Media"; // Or another active category

        console.log(`Checking headers for sheet: ${sheetName}`);
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `'${sheetName}'!1:1`,
        });

        const headers = response.data.values?.[0] || [];
        console.log("EXACT HEADERS IN ROW 1:");
        headers.forEach((h, i) => {
            console.log(`Col ${i}: "${h}"`);
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

checkHeaders();
