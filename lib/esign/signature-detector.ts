import * as pdfjsLib from 'pdfjs-dist';
import type { DetectedSignatureLocation } from './field-types';
import { SIGNATURE_KEYWORDS, DATE_KEYWORDS, INITIAL_KEYWORDS } from './field-types';

// Configure PDF.js worker - using local file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PageText {
  items: TextItem[];
  pageWidth: number;
  pageHeight: number;
}

/**
 * Extract text items with positions from a PDF page
 */
async function extractTextFromPage(
  page: pdfjsLib.PDFPageProxy
): Promise<PageText> {
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await page.getTextContent();

  const items: TextItem[] = textContent.items.map((item: any) => {
    const transform = item.transform;
    return {
      str: item.str,
      x: transform[4],
      y: viewport.height - transform[5], // Flip Y coordinate
      width: item.width,
      height: item.height,
    };
  });

  return {
    items,
    pageWidth: viewport.width,
    pageHeight: viewport.height,
  };
}

/**
 * Normalize text for matching (lowercase, remove punctuation)
 */
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

/**
 * Check if a text string matches any of the keywords
 */
function matchesKeywords(text: string, keywords: string[]): string | null {
  const normalized = normalizeText(text);
  for (const keyword of keywords) {
    if (normalized.includes(normalizeText(keyword))) {
      return keyword;
    }
  }
  return null;
}

/**
 * Check if text contains underscores (signature line indicator)
 */
function hasSignatureLine(text: string): boolean {
  return text.includes('___') || text.includes('_____');
}

/**
 * Detect signature locations in a single page
 */
function detectSignatureLocationsInPage(
  pageText: PageText,
  pageNumber: number
): DetectedSignatureLocation[] {
  const locations: DetectedSignatureLocation[] = [];
  const { items, pageWidth, pageHeight } = pageText;

  console.log(`[Detection] Page ${pageNumber}: Processing ${items.length} text items`);

  // Strategy: Look for labels like "Signature:", "Date:", "Name:" followed by underscores
  // The underscores might be on the same line or slightly after
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Check if this is a label (signature, date, name, etc.)
    const signatureMatch = matchesKeywords(item.str, SIGNATURE_KEYWORDS);
    const dateMatch = matchesKeywords(item.str, DATE_KEYWORDS);
    const initialMatch = matchesKeywords(item.str, INITIAL_KEYWORDS);
    const nameMatch = normalizeText(item.str).includes('name');
    
    if (!signatureMatch && !dateMatch && !initialMatch && !nameMatch) {
      continue;
    }
    
    console.log(`[Detection] Found label at (${item.x.toFixed(1)}, ${item.y.toFixed(1)}): "${item.str}"`);
    
    // Now look for the underscore line nearby
    // It should be within the next few items, on the same line or slightly after
    let foundUnderscoreLine = false;
    let underscoreItem: TextItem | null = null;
    
    for (let j = i + 1; j < Math.min(i + 10, items.length); j++) {
      const nextItem = items[j];
      
      // Check if it has underscores
      if (hasSignatureLine(nextItem.str)) {
        const yDiff = Math.abs(item.y - nextItem.y);
        const xDiff = nextItem.x - (item.x + item.width);
        
        // Should be on the same line (or close) and to the right
        if (yDiff < 20 && xDiff >= -10 && xDiff < 100) {
          console.log(`[Detection]   -> Found underscore line at (${nextItem.x.toFixed(1)}, ${nextItem.y.toFixed(1)}): "${nextItem.str.substring(0, 20)}..."`);
          foundUnderscoreLine = true;
          underscoreItem = nextItem;
          break;
        }
      }
    }
    
    // Determine field type and add location
    let keyword = '';
    let confidence = 0.7;
    
    if (signatureMatch) {
      keyword = 'signature';
      confidence = 0.95;
    } else if (dateMatch) {
      keyword = 'date';
      confidence = 0.90;
    } else if (nameMatch) {
      keyword = 'name';
      confidence = 0.85;
    } else if (initialMatch) {
      keyword = 'initial';
      confidence = 0.80;
    }
    
    // Use the underscore line position if found, otherwise position after the label
    const fieldX = underscoreItem ? underscoreItem.x : item.x + item.width + 10;
    const fieldY = underscoreItem ? underscoreItem.y : item.y;
    
    locations.push({
      page: pageNumber,
      x: (fieldX / pageWidth) * 100,
      y: (fieldY / pageHeight) * 100,
      keyword,
      confidence,
    });
    
    console.log(`[Detection]   -> Added ${keyword} field at (${fieldX.toFixed(1)}, ${fieldY.toFixed(1)}) = (${((fieldX / pageWidth) * 100).toFixed(1)}%, ${((fieldY / pageHeight) * 100).toFixed(1)}%)`);
  }

  console.log(`[Detection] Page ${pageNumber}: Found ${locations.length} fields`);
  return locations;
}

/**
 * Add default signature locations if none were detected
 */
function addDefaultLocations(
  locations: DetectedSignatureLocation[],
  pageCount: number
): DetectedSignatureLocation[] {
  if (locations.length === 0) {
    // Add default signature and date fields at bottom of last page
    const lastPage = pageCount;
    return [
      {
        page: lastPage,
        x: 10, // 10% from left
        y: 85, // 85% from top (near bottom)
        keyword: 'default',
        confidence: 0.5,
      },
      {
        page: lastPage,
        x: 60, // 60% from left
        y: 85, // Same line as signature
        keyword: 'default',
        confidence: 0.5,
      },
    ];
  }

  return locations;
}

/**
 * Remove duplicate/overlapping locations
 */
function deduplicateLocations(
  locations: DetectedSignatureLocation[]
): DetectedSignatureLocation[] {
  const threshold = 2; // 2% overlap threshold (stricter now)
  const deduplicated: DetectedSignatureLocation[] = [];

  for (const location of locations) {
    const isDuplicate = deduplicated.some(
      (existing) =>
        existing.page === location.page &&
        Math.abs(existing.x - location.x) < threshold &&
        Math.abs(existing.y - location.y) < threshold
    );

    if (!isDuplicate) {
      deduplicated.push(location);
    }
  }

  // Sort by confidence (highest first)
  return deduplicated.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Main function to detect signature locations in a PDF
 */
export async function detectSignatureLocations(
  pdfFile: File | ArrayBuffer
): Promise<DetectedSignatureLocation[]> {
  try {
    // Load PDF
    const arrayBuffer =
      pdfFile instanceof File ? await pdfFile.arrayBuffer() : pdfFile;

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const allLocations: DetectedSignatureLocation[] = [];

    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const pageText = await extractTextFromPage(page);
      const pageLocations = detectSignatureLocationsInPage(pageText, pageNum);
      allLocations.push(...pageLocations);
    }

    // Deduplicate
    let finalLocations = deduplicateLocations(allLocations);

    // Add default locations if nothing was detected
    finalLocations = addDefaultLocations(finalLocations, pdf.numPages);

    return finalLocations;
  } catch (error) {
    console.error('Error detecting signature locations:', error);
    throw error;
  }
}

/**
 * Get PDF metadata (page count, dimensions)
 */
export async function getPDFMetadata(
  pdfFile: File | ArrayBuffer
): Promise<{
  pageCount: number;
  fileSize: number;
  pages: { width: number; height: number }[];
}> {
  try {
    const arrayBuffer =
      pdfFile instanceof File ? await pdfFile.arrayBuffer() : pdfFile;

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const pages: { width: number; height: number }[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      pages.push({
        width: viewport.width,
        height: viewport.height,
      });
    }

    return {
      pageCount: pdf.numPages,
      fileSize: arrayBuffer.byteLength,
      pages,
    };
  } catch (error) {
    console.error('Error getting PDF metadata:', error);
    throw error;
  }
}

/**
 * Categorize detected locations by type (signature, date, initial, text)
 */
export function categorizeDetectedLocations(
  locations: DetectedSignatureLocation[]
): {
  signatures: DetectedSignatureLocation[];
  dates: DetectedSignatureLocation[];
  initials: DetectedSignatureLocation[];
  textFields: DetectedSignatureLocation[];
} {
  const signatures: DetectedSignatureLocation[] = [];
  const dates: DetectedSignatureLocation[] = [];
  const initials: DetectedSignatureLocation[] = [];
  const textFields: DetectedSignatureLocation[] = [];

  for (const location of locations) {
    if (!location.keyword) {
      // No keyword means it's an unmatched signature line - default to signature
      signatures.push(location);
      continue;
    }

    const normalized = normalizeText(location.keyword);

    // Check for date keywords first (most specific)
    if (DATE_KEYWORDS.some((kw) => normalized.includes(normalizeText(kw)))) {
      dates.push(location);
    } 
    // Check for initial keywords
    else if (INITIAL_KEYWORDS.some((kw) => normalized.includes(normalizeText(kw)))) {
      initials.push(location);
    } 
    // Check for name fields (text input)
    else if (normalized.includes('name')) {
      textFields.push(location);
    }
    // Check for signature keywords
    else if (SIGNATURE_KEYWORDS.some((kw) => normalized.includes(normalizeText(kw)))) {
      signatures.push(location);
    }
    // Default to signature if we can't determine
    else {
      signatures.push(location);
    }
  }

  // If we have default locations, assume first is signature, second is date
  const defaults = locations.filter((l) => l.keyword === 'default');
  if (defaults.length > 0 && signatures.length === 0 && dates.length === 0) {
    signatures.push(defaults[0]);
    if (defaults.length > 1) {
      dates.push(defaults[1]);
    }
  }

  return { signatures, dates, initials, textFields };
}

