/**
 * @project Biofeedback & Cognitive Neuroscience Laboratory Web Platform (CUK)
 * @author Jaanvin (Lead Developer & System Architect)
 * @copyright (c) 2026 Jaanvin. All Rights Reserved.
 * @signature JAANVIN-CUK-BCNL-DEV-2026-PRIMARY-AUTHOR
 * 
 * Google Sheets CSV Fetch Utility
 * Fetches data from a published Google Sheet tab and parses it into JSON.
 */

const SHEET_ID = '1dOgmPgMHho9ifo85FPbmiWrNotLM18YnaquUo7V1-dU';

/**
 * Parse a CSV string into an array of objects using the header row as keys.
 */
function parseCSV(csvText: string): Record<string, string>[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  // Split by newlines, respecting quoted fields
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (current.trim()) lines.push(current);
      current = '';
      // Skip \r\n
      if (char === '\r' && csvText[i + 1] === '\n') i++;
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);

  if (lines.length < 2) return [];

  // Parse a single CSV line into fields
  const parseLine = (line: string): string[] => {
    const fields: string[] = [];
    let field = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (ch === ',' && !insideQuotes) {
        fields.push(field.trim());
        field = '';
      } else {
        field += ch;
      }
    }
    fields.push(field.trim());
    return fields;
  };

  const headers = parseLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());

  return lines.slice(1).map(line => {
    const values = parseLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = (values[idx] || '').replace(/^"|"$/g, '').trim();
    });
    return obj;
  });
}

const TAB_GIDS: Record<string, string> = {
  'Faculty': '1353738581',
  'Departmental Programs': '811568327',
  'Departmental Programmes': '811568327',
  'Students': '660622040',
  'Equipment': '1880157920',
  'Research': '1412980414',
  'Projects': '999842724',
  'Publications': '743123737',
  'Gallery': '1271936005'
};

/**
 * Fetch data from a specific tab in the published Google Sheet.
 * @param tabName - The name of the sheet tab (e.g., 'Faculty', 'Students')
 * @returns Parsed array of row objects
 */
export async function fetchSheetData(tabName: string): Promise<Record<string, string>[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    const response = await fetch(url);
    if (response.ok) {
      const csvText = await response.text();
      const parsed = parseCSV(csvText);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    // Continue to GID fallback
  }

  // Fallback to direct export using GID if available
  const gid = TAB_GIDS[tabName];
  if (gid) {
    try {
      const gidUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
      const gidResponse = await fetch(gidUrl);
      if (gidResponse.ok) {
        const csvText = await gidResponse.text();
        return parseCSV(csvText);
      }
    } catch (e) {
      // Return empty if both fail
    }
  }

  return [];
}

/**
 * Automatically converts Google Drive share URLs into direct raw image links.
 * Supports /file/d/ID/view, open?id=ID, and direct document downloads.
 */
export function getDirectDriveUrl(url: string): string {
  if (!url) return '';
  
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    let fileId = '';
    
    // Pattern 1: /file/d/FILE_ID/view
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      fileId = fileDMatch[1];
    } else {
      // Pattern 2: ?id=FILE_ID
      const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
      }
    }
    
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  
  return url;
}

export default fetchSheetData;
