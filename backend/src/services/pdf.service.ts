import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

export const extractStatementData = async (filePath: string): Promise<string> => {
  const fileBuffer = await fs.readFile(filePath);
  const result = await pdfParse(fileBuffer);

  if (result.text && result.text.trim().length > 50) {
    return result.text;
  }

  const imageText = await Tesseract.recognize(fileBuffer, 'eng', { logger: () => null });
  return imageText.data.text || '';
};
