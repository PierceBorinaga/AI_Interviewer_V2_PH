import { google, Auth } from 'googleapis';
import { Readable } from 'stream';

// Initialize OAuth2 client with required scopes
console.log('🔧 Initializing Google OAuth...');
console.log('Client ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('Client Secret exists:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('Refresh Token exists:', !!process.env.GOOGLE_REFRESH_TOKEN);

const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.metadata',
    'https://www.googleapis.com/auth/gmail.send'
];

// Create a new OAuth2 client
export const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

// Set the refresh token and scopes
oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    scope: SCOPES.join(' ')
});

// Create a wrapper to handle token refresh
autoRefreshAuth(oauth2Client);

console.log('✅ OAuth client initialized with scopes:', SCOPES);

// Function to automatically refresh the access token when it expires
function autoRefreshAuth(oauth2Client: Auth.OAuth2Client) {
    // Set up the refresh timeout
    const refreshAccessToken = async () => {
        try {
            const { credentials } = await oauth2Client.refreshAccessToken();
            oauth2Client.setCredentials(credentials);

            // Schedule the next refresh before the token expires (with a 5-minute buffer)
            const expiresIn = (credentials.expiry_date || 0) - Date.now() - 300000;
            if (expiresIn > 0) {
                setTimeout(refreshAccessToken, expiresIn);
            }
        } catch (error) {
            console.error('Error refreshing access token:', error);
            // Retry after 1 minute on error
            setTimeout(refreshAccessToken, 60000);
        }
    };

    // Initial refresh
    refreshAccessToken();
}

// Initialize the clients with our OAuth2 client
const drive = google.drive({ version: 'v3', auth: oauth2Client });
const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

/**
 * Uploads a file to Google Drive
 * @param fileBuffer The file content as a buffer
 * @param fileName The name of the file
 * @param mimeType The mime type of the file
 * @returns The webViewLink of the uploaded file
 */
export async function uploadToDrive(fileBuffer: Buffer, fileName: string, mimeType: string) {
    try {
        // 1. Find or Create Folder
        let folderId = '';
        const folderRes = await drive.files.list({
            q: "mimeType='application/vnd.google-apps.folder' and name='CV_AI_Interviewer' and trashed=false",
            fields: 'files(id)',
        });

        if (folderRes.data.files && folderRes.data.files.length > 0) {
            folderId = folderRes.data.files[0].id!;
        } else {
            // Create folder if it doesn't exist
            const folder = await drive.files.create({
                requestBody: {
                    name: 'CV_AI_Interviewer',
                    mimeType: 'application/vnd.google-apps.folder',
                },
                fields: 'id',
            });
            folderId = folder.data.id!;
        }

        // 2. Upload File
        const media = {
            mimeType: mimeType,
            body: Readable.from(fileBuffer),
        };

        const res = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [folderId],
            },
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        return res.data.webViewLink;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Drive Upload Error:", error.message);
        }
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw error;
    }
}

/**
 * Checks if an email already exists in the Google Sheet
 * @param email The email to check
 * @param sheetName The name of the sheet to check in
 * @returns boolean indicating if email exists
 */
export async function checkEmailExists(email: string, sheetName: string = 'Sheet1'): Promise<boolean> {
    try {
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

        if (!spreadsheetId) {
            throw new Error('GOOGLE_SPREADSHEET_ID is not set in environment variables');
        }

        // Get all data from the sheet
        const response = await withRetry(async () => {
            return sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `'${sheetName}'!A1:AZ1000`, // Get data from columns A-AZ (supporting 52 columns)
            });
        });

        const rows = response.data.values || [];

        // Check if email exists in column C (index 2)
        const emailExists = rows.some(row => row[2] && row[2].toLowerCase() === email.toLowerCase());

        return emailExists;
    } catch (error) {
        console.error("Email Check Error:", error);
        throw error;
    }
}

/**
 * Appends data to a Google Sheet with Retry Logic
 * @param values Array of values for the row
 * @param sheetName The name of the sheet to append to
 */
export async function appendToSheet(values: (string | number | boolean | null)[], sheetName: string = 'Sheet1') {
    try {
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

        if (!spreadsheetId) {
            throw new Error('GOOGLE_SPREADSHEET_ID is not set in environment variables');
        }

        console.log("=== GOOGLE SHEETS DEBUG ===");
        console.log("Spreadsheet ID:", spreadsheetId);
        console.log("Values length:", values.length);
        console.log("Values array:", values);
        console.log("Phone value (index 19):", values[19]);
        console.log("Position value (index 20):", values[20]);

        // Append Data with Retry
        await withRetry(async () => {
            return sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `'${sheetName}'!A1:Y1`, // Append to columns A-Y
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS', // Atomic insertion
                requestBody: {
                    values: [values],
                },
            });
        });

        console.log('Appended to Sheets successfully');
    } catch (error) {
        console.error('Google Sheets Append Error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
    }
}

/**
 * Appends token data to the "Interview Tokens" sheet
 * @param values [Token, Email, Category, Status, Timestamp]
 */
export async function appendToTokenSheet(values: (string | number | boolean | null)[]) {
    try {
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
        const sheetName = 'Interview Tokens';

        if (!spreadsheetId) {
            throw new Error('GOOGLE_SPREADSHEET_ID is not set');
        }

        await withRetry(async () => {
            return sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `'${sheetName}'!A1:E1`,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                requestBody: {
                    values: [values],
                },
            });
        });

        console.log('Appended to Token Sheet successfully');
    } catch (error) {
        console.error('Token Sheet Append Error:', error);
        throw error;
    }
}

/**
 * Verifies if a token exists and returns its details
 * @param token The token string to check
 * @returns Object with email, category, status, or null if not found
 */
export async function verifyToken(token: string) {
    try {
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
        const sheetName = 'Interview Tokens';

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `'${sheetName}'!A2:E`, // Check all rows, skipping header
        });

        const rows = response.data.values;
        if (!rows) return null;

        const row = rows.find(r => r[0] === token);
        if (!row) return null;

        return {
            token: row[0],
            email: row[1],
            category: row[2],
            status: row[3],
            timestamp: row[4],
        };
    } catch (error) {
        console.error('Token Verification Error:', error);
        return null;
    }
}

/**
 * Utility to retry a function with exponential backoff
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 500): Promise<T> {
    try {
        return await fn();
    } catch (error: unknown) {
        if (retries === 0) throw error;

        // Retry on Rate Limits (429) or Server Errors (5xx)
        const errorCode = (error as { code?: number }).code;
        const shouldRetry = errorCode === 429 || errorCode === 500 || errorCode === 503;
        if (!shouldRetry) throw error;

        console.log(`Retrying operation... attempts left: ${retries}`);
        await new Promise(res => setTimeout(res, delay));
        return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
    }
}

/**
 * Fetches the headers (first row) of a sheet
 */
export async function getSheetHeaders(sheetName: string = 'Sheet1'): Promise<string[]> {
    try {
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `'${sheetName}'!1:1`,
        });
        return response.data.values?.[0] || [];
    } catch (error) {
        console.error("Error fetching sheet headers:", error);
        return [];
    }
}

/**
 * Updates a row in the sheet based on the email (Column C)
 */
export async function updateRowByEmail(email: string, data: Record<string, string>, sheetName: string = 'Sheet1') {
    try {
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

        // 1. Get all data to find the row
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `'${sheetName}'!A:AZ`, // Expanded range to AZ (52 columns)
        });

        const rows = response.data.values || [];
        const headers = rows[0] || [];

        // Normalize headers for robust matching: trim and lowercase
        const normalizedHeaders = headers.map(h => (h || "").toString().trim().toLowerCase());

        console.log("Sheet Headers (Raw):", headers);
        if (rows.length > 1) {
            console.log("First Data Row Sample (Row 2):", rows[1]);
        }

        // Email is usually in Column C (index 2)
        const rowIndex = rows.findIndex(row => row[2] && row[2].toString().trim().toLowerCase() === email.toLowerCase().trim());

        if (rowIndex === -1) {
            console.warn(`Could not find row for email: ${email}. Looked in Column C (Index 2).`);
            return;
        }

        // 2. Prepare updates
        const updates = [];
        for (const [header, value] of Object.entries(data)) {
            // Only update if value is not empty to avoid accidental overwrites
            if (!value) continue;

            // Robust matching: trim and lowercase both target and source
            const targetHeaderNormalized = header.trim().toLowerCase();
            const colIndex = normalizedHeaders.indexOf(targetHeaderNormalized);

            if (colIndex !== -1) {
                console.log(`Matching header "${header}" to column ${indexToColumnLetter(colIndex)} (Index ${colIndex})`);
                updates.push({
                    range: `'${sheetName}'!${indexToColumnLetter(colIndex)}${rowIndex + 1}`,
                    values: [[value]],
                });
            } else {
                console.warn(`Could not find column for header: "${header}" (Normalized: "${targetHeaderNormalized}") in sheet: ${sheetName}`);
            }
        }

        // 3. Apply updates
        if (updates.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId,
                requestBody: {
                    valueInputOption: 'USER_ENTERED',
                    data: updates,
                },
            });
        }

        console.log(`Successfully updated row ${rowIndex + 1} for ${email}`);
    } catch (error) {
        console.error("Error updating row by email:", error);
        throw error;
    }
}

/**
 * Updates the status of a token in the "Interview Tokens" sheet
 */
export async function updateTokenStatus(token: string, newStatus: string) {
    try {
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
        const sheetName = 'Interview Tokens';

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `'${sheetName}'!A:E`,
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === token);

        if (rowIndex === -1) return;

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'${sheetName}'!D${rowIndex + 1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[newStatus]],
            },
        });
    } catch (error) {
        console.error("Error updating token status:", error);
    }
}

/**
 * Checks the interview status of a candidate by their email in a specific sheet
 */
export async function getInterviewStatusByEmail(email: string, sheetName: string): Promise<string | null> {
    try {
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `'${sheetName}'!A:AZ`,
        });

        const rows = response.data.values || [];
        const headers = rows[0] || [];
        const emailColIndex = 2; // Column C

        // Normalize headers for searching
        const normalizedHeaders = headers.map(h => (h || "").toString().trim().toLowerCase());
        const statusColIndex = normalizedHeaders.indexOf("interview_status");

        if (statusColIndex === -1) {
            console.warn(`"Interview_Status" column not found in ${sheetName}. Headers found:`, headers);
            return null;
        }

        const row = rows.find(r => r[emailColIndex] && r[emailColIndex].toString().trim().toLowerCase() === email.toLowerCase().trim());
        return row ? row[statusColIndex] : null;
    } catch (error) {
        console.error("Error getting interview status:", error);
        return null;
    }
}

/**
 * Converts a 0-indexed column number to Google Sheets column letter (e.g., 0 -> A, 25 -> Z, 26 -> AA)
 */
function indexToColumnLetter(index: number): string {
    let letter = '';
    while (index >= 0) {
        letter = String.fromCharCode((index % 26) + 65) + letter;
        index = Math.floor(index / 26) - 1;
    }
    return letter;
}
