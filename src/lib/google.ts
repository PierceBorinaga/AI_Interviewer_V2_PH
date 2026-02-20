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
    'https://www.googleapis.com/auth/drive.metadata'
];

// Create a new OAuth2 client
const oauth2Client = new google.auth.OAuth2(
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
        const fileMetadata = {
            name: fileName,
            parents: ['CV_AI_Interviewer'], // Note: This assumes folder ID or Alias. If strictly name is needed, we'd need to search for it first. Ideally this should be a Folder ID from env.
            // For now, I'll search for the folder first to be safe, or just upload to root if not found.
            // BETTER APPROACH: Use a specific Folder ID in env, but prompt implies name. 
            // I will implement a search or create logic for robustness.
        };

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

        // 3. Make it readable by anyone with the link (Optional, but often needed for external viewers)
        // await drive.permissions.create({
        //   fileId: res.data.id!,
        //   requestBody: {
        //     role: 'reader',
        //     type: 'anyone',
        //   },
        // });

        return res.data.webViewLink;
    } catch (error: any) {
        console.error("Drive Upload Error:", error.message);
        console.error("Error details:", JSON.stringify({
            code: error.code,
            status: error.status,
            errors: error.errors,
        }, null, 2));
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
                range: `'${sheetName}'!A1:Y1000`, // Get data from columns A-Y
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
export async function appendToSheet(values: any[], sheetName: string = 'Sheet1') {
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
 * Utility to retry a function with exponential backoff
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 500): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries === 0) throw error;

        // Retry on Rate Limits (429) or Server Errors (5xx)
        const shouldRetry = error.code === 429 || error.code === 500 || error.code === 503;
        if (!shouldRetry) throw error;

        console.log(`Retrying operation... attempts left: ${retries}`);
        await new Promise(res => setTimeout(res, delay));
        return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
    }
}
