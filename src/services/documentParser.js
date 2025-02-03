import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('assets/pdf.worker.min.mjs');

export async function parseDocument(file) {
  const fileType = file.type || '';
  const fileName = file.name.toLowerCase();

  // Parse based on file type
  if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
    return await parsePDF(file);
  } else if (
    fileType.includes('officedocument.wordprocessingml') ||
    fileName.endsWith('.docx')
  ) {
    return await parseDocx(file);
  } else if (
    fileType.includes('msword') ||
    fileName.endsWith('.doc')
  ) {
    throw new Error('Legacy .doc files are not supported. Please save your document as .docx and try again.');
  } else if (fileType.includes('text') || fileName.endsWith('.txt')) {
    return await parseText(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
  }
}

async function parsePDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let textContent = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      textContent += content.items.map(item => item.str).join(' ') + '\n';
    }
    
    return textContent.trim();
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}

async function parseDocx(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.error('Error parsing Word document:', error);
    throw new Error('Failed to parse DOCX file. Make sure the file is not corrupted.');
  }
}

async function parseText(file) {
  try {
    return await file.text();
  } catch (error) {
    console.error('Error parsing text file:', error);
    throw new Error('Failed to parse text file');
  }
} 