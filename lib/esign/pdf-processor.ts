import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { ESignField, ESignFieldValue } from './field-types';

interface FieldWithValue {
  field: ESignField;
  value: string;
}

/**
 * Flatten a PDF by embedding signature and field values directly into the document
 */
export async function flattenPDFWithSignatures(
  originalPDF: File | ArrayBuffer,
  fieldsWithValues: FieldWithValue[]
): Promise<Uint8Array> {
  try {
    // Load the PDF
    const arrayBuffer =
      originalPDF instanceof File
        ? await originalPDF.arrayBuffer()
        : originalPDF;

    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    // Group fields by page
    const fieldsByPage = new Map<number, FieldWithValue[]>();
    for (const fieldWithValue of fieldsWithValues) {
      const pageNum = fieldWithValue.field.page_number;
      if (!fieldsByPage.has(pageNum)) {
        fieldsByPage.set(pageNum, []);
      }
      fieldsByPage.get(pageNum)!.push(fieldWithValue);
    }

    // Process each page
    for (const [pageNum, pageFields] of fieldsByPage.entries()) {
      const page = pages[pageNum - 1]; // Pages are 0-indexed in pdf-lib
      if (!page) continue;

      const { width, height } = page.getSize();

      for (const { field, value } of pageFields) {
        // Convert percentage positions to absolute coordinates
        const x = (field.x / 100) * width;
        const y = height - (field.y / 100) * height; // Flip Y coordinate (PDF origin is bottom-left)
        const fieldWidth = (field.width / 100) * width;
        const fieldHeight = (field.height / 100) * height;

        // Adjust y for field height (draw from bottom of field box)
        const adjustedY = y - fieldHeight;

        if (field.field_type === 'signature' || field.field_type === 'initial') {
          // Embed signature image
          await embedSignatureImage(
            pdfDoc,
            page,
            value,
            x,
            adjustedY,
            fieldWidth,
            fieldHeight
          );
        } else if (field.field_type === 'date') {
          // Draw date text
          await drawTextField(
            pdfDoc,
            page,
            value,
            x,
            adjustedY,
            fieldWidth,
            fieldHeight,
            12
          );
        } else if (field.field_type === 'text') {
          // Draw text field
          await drawTextField(
            pdfDoc,
            page,
            value,
            x,
            adjustedY,
            fieldWidth,
            fieldHeight,
            10
          );
        }
      }
    }

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error flattening PDF:', error);
    throw error;
  }
}

/**
 * Embed a signature image into the PDF
 */
async function embedSignatureImage(
  pdfDoc: PDFDocument,
  page: any,
  signatureDataUrl: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  try {
    // Extract base64 data from data URL
    const base64Data = signatureDataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), (c) =>
      c.charCodeAt(0)
    );

    // Embed the image (assuming PNG)
    const image = await pdfDoc.embedPng(imageBytes);

    // Scale image to fit within field bounds while maintaining aspect ratio
    const imageAspect = image.width / image.height;
    const fieldAspect = width / height;

    let drawWidth = width;
    let drawHeight = height;

    if (imageAspect > fieldAspect) {
      // Image is wider than field
      drawHeight = width / imageAspect;
    } else {
      // Image is taller than field
      drawWidth = height * imageAspect;
    }

    // Center the image in the field
    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2;

    // Draw the image
    page.drawImage(image, {
      x: x + offsetX,
      y: y + offsetY,
      width: drawWidth,
      height: drawHeight,
    });
  } catch (error) {
    console.error('Error embedding signature image:', error);
    throw error;
  }
}

/**
 * Draw text field on PDF
 */
async function drawTextField(
  pdfDoc: PDFDocument,
  page: any,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number = 12
): Promise<void> {
  try {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Calculate text size
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    // Center text vertically in the field
    const textY = y + (height - textHeight) / 2;

    // Draw the text
    page.drawText(text, {
      x: x + 5, // Small left padding
      y: textY,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Optionally draw a border around the text field
    // page.drawRectangle({
    //   x: x,
    //   y: y,
    //   width: width,
    //   height: height,
    //   borderColor: rgb(0.7, 0.7, 0.7),
    //   borderWidth: 1,
    // });
  } catch (error) {
    console.error('Error drawing text field:', error);
    throw error;
  }
}

/**
 * Add a watermark to indicate document is signed
 */
export async function addSignedWatermark(
  pdfBytes: Uint8Array,
  signedDate: string
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    if (!firstPage) return pdfBytes;

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = firstPage.getSize();

    const watermarkText = `Signed on ${signedDate}`;
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

    // Draw watermark at bottom right
    firstPage.drawText(watermarkText, {
      x: width - textWidth - 20,
      y: 20,
      size: fontSize,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.7,
    });

    return await pdfDoc.save();
  } catch (error) {
    console.error('Error adding watermark:', error);
    return pdfBytes;
  }
}

/**
 * Merge multiple PDFs into one
 */
export async function mergePDFs(pdfFiles: File[]): Promise<Uint8Array> {
  try {
    const mergedPdf = await PDFDocument.create();

    for (const file of pdfFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return await mergedPdf.save();
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw error;
  }
}

/**
 * Extract pages from a PDF
 */
export async function extractPDFPages(
  pdfFile: File | ArrayBuffer,
  pageNumbers: number[]
): Promise<Uint8Array> {
  try {
    const arrayBuffer =
      pdfFile instanceof File ? await pdfFile.arrayBuffer() : pdfFile;

    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    for (const pageNum of pageNumbers) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
      newPdf.addPage(copiedPage);
    }

    return await newPdf.save();
  } catch (error) {
    console.error('Error extracting PDF pages:', error);
    throw error;
  }
}

/**
 * Create a certificate of completion page
 */
export async function createCertificatePage(
  documentTitle: string,
  signers: { name: string; email: string; signedAt: string }[],
  completedAt: string
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();

    let yPosition = height - 100;

    // Title
    page.drawText('Certificate of Completion', {
      x: 50,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 60;

    // Document name
    page.drawText('Document:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
    });

    yPosition -= 25;

    page.drawText(documentTitle, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 40;

    // Completed date
    page.drawText(`Completed on: ${completedAt}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 50;

    // Signers
    page.drawText('Signers:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
    });

    yPosition -= 30;

    for (const signer of signers) {
      page.drawText(`• ${signer.name || signer.email}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: font,
      });

      yPosition -= 20;

      page.drawText(
        `  Signed: ${new Date(signer.signedAt).toLocaleString()}`,
        {
          x: 70,
          y: yPosition,
          size: 9,
          font: font,
          color: rgb(0.4, 0.4, 0.4),
        }
      );

      yPosition -= 30;

      if (yPosition < 100) break; // Avoid going off page
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error('Error creating certificate page:', error);
    throw error;
  }
}

/**
 * Download a PDF file to the user's computer
 */
export function downloadPDF(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}





