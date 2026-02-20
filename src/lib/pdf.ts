import PDFParser from 'pdf2json';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    return new Promise((resolve) => {
        try {
            const pdfParser = new PDFParser(null, true); // true = enable text extraction

            pdfParser.on("pdfParser_dataError", (errData: any) => {
                console.error("PDF Parser Error:", errData.parserError);
                resolve("");
            });

            pdfParser.on("pdfParser_dataReady", () => {
                try {
                    // getRawTextContent() returns text. 
                    const text = pdfParser.getRawTextContent();
                    resolve(text);
                } catch (err) {
                    console.error("PDF Text Extraction Error (Layout):", err);
                    resolve(""); // Resolve safely on internal parsing errors
                }
            });

            // Wrap parsing trigger in try-catch as well
            try {
                pdfParser.parseBuffer(buffer);
            } catch (err) {
                console.error("PDF Parse Buffer Error:", err);
                resolve("");
            }

        } catch (err) {
            console.error("PDF Parser Initialization Error:", err);
            resolve("");
        }
    });
}
