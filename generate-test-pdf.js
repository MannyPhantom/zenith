// Test PDF Generator for E-Sign Module
// Run with: node generate-test-pdf.js

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createTestPDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page
  const page = pdfDoc.addPage([612, 792]); // Letter size (8.5" x 11")
  const { width, height } = page.getSize();
  
  // Embed fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Title
  page.drawText('EMPLOYMENT AGREEMENT', {
    x: 50,
    y: height - 50,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  // Date
  page.drawText('Date: January 15, 2024', {
    x: 50,
    y: height - 80,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Body text
  const bodyText = [
    'This Employment Agreement ("Agreement") is entered into between:',
    '',
    'EMPLOYER: Acme Corporation',
    'EMPLOYEE: [Employee Name]',
    '',
    'TERMS OF EMPLOYMENT:',
    '',
    '1. Position: The Employee shall serve as Senior Software Engineer.',
    '',
    '2. Start Date: The employment shall commence on February 1, 2024.',
    '',
    '3. Compensation: The Employee shall receive an annual salary of $120,000,',
    '   payable in accordance with the company\'s standard payroll practices.',
    '',
    '4. Benefits: The Employee shall be entitled to participate in all benefit',
    '   programs offered by the Employer to its employees.',
    '',
    '5. Confidentiality: The Employee agrees to maintain confidentiality of all',
    '   proprietary information and trade secrets of the Employer.',
    '',
    '',
    'SIGNATURES:',
    '',
    'By signing below, both parties agree to the terms and conditions outlined',
    'in this Employment Agreement.',
  ];
  
  let yPosition = height - 120;
  bodyText.forEach((line) => {
    page.drawText(line, {
      x: 50,
      y: yPosition,
      size: 11,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 18;
  });
  
  // Signature section for Employer
  yPosition -= 30;
  page.drawText('EMPLOYER SIGNATURE:', {
    x: 50,
    y: yPosition,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 30;
  page.drawText('Signature:', {
    x: 70,
    y: yPosition,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('_________________________________________', {
    x: 140,
    y: yPosition,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 25;
  page.drawText('Name:', {
    x: 70,
    y: yPosition,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('_________________________________________', {
    x: 140,
    y: yPosition,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 25;
  page.drawText('Date:', {
    x: 70,
    y: yPosition,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('_________________________________________', {
    x: 140,
    y: yPosition,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  
  // Signature section for Employee
  yPosition -= 40;
  page.drawText('EMPLOYEE SIGNATURE:', {
    x: 50,
    y: yPosition,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 30;
  page.drawText('Signature:', {
    x: 70,
    y: yPosition,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('_________________________________________', {
    x: 140,
    y: yPosition,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 25;
  page.drawText('Name:', {
    x: 70,
    y: yPosition,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('_________________________________________', {
    x: 140,
    y: yPosition,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 25;
  page.drawText('Date:', {
    x: 70,
    y: yPosition,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('_________________________________________', {
    x: 140,
    y: yPosition,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  
  // Footer
  page.drawText('Page 1 of 1', {
    x: width / 2 - 30,
    y: 30,
    size: 9,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  
  // Save to file
  const outputPath = path.join(__dirname, 'public', 'test_signature_document.pdf');
  
  // Create public directory if it doesn't exist
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, pdfBytes);
  
  console.log('\n✅ Test PDF created successfully!');
  console.log(`📄 Location: ${outputPath}`);
  console.log('\n🎯 This PDF contains:');
  console.log('  - Header with title and date');
  console.log('  - Employment agreement text');
  console.log('  - 2 signature sections (Employer & Employee)');
  console.log('  - Keywords: "Signature", "Date", "Name"');
  console.log('\n🚀 Upload this PDF to test the E-Sign module!');
  console.log('   It should automatically detect 6 fields:\n');
  console.log('   - 2 signature fields');
  console.log('   - 2 name fields');
  console.log('   - 2 date fields\n');
}

createTestPDF().catch(console.error);

