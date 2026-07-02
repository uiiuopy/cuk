/**
 * Google Sheets CSV Fetch Utility
 * 
 * Fetches data from a published Google Sheet tab and parses it into JSON.
 * 
 * SETUP:
 * 1. Create a Google Sheet with tabs: Faculty, Students, Publications, Equipment
 * 2. File → Share → Publish to web → Entire Document → CSV → Publish
 * 3. Replace SHEET_ID below with your sheet's ID from the URL
 */

// ⚠️ REPLACE THIS with your actual Google Sheet ID
// The Sheet ID is the long string between /d/ and /edit in your Google Sheets URL
// Example URL: https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit
const SHEET_ID = '1dOgmPgMHho9ifo85FPbmiWrNotLM18YnaquUo7V1-dU';

/**
 * Parse a CSV string into an array of objects using the header row as keys.
 */
function parseCSV(csvText) {
  const lines = [];
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
  const parseLine = (line) => {
    const fields = [];
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
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = (values[idx] || '').replace(/^"|"$/g, '').trim();
    });
    return obj;
  });
}

/**
 * Fetch data from a specific tab in the published Google Sheet.
 * @param {string} tabName - The name of the sheet tab (e.g., 'Faculty', 'Students')
 * @returns {Promise<Array<Object>>} - Parsed array of row objects
 */
export async function fetchSheetData(tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet "${tabName}": ${response.status}`);
  }

  const csvText = await response.text();
  return parseCSV(csvText);
}

/**
 * Update the Sheet ID at runtime (useful for configuration).
 */
export function setSheetId(id) {
  // This is a module-level reassignment workaround
  Object.defineProperty(module, 'SHEET_ID', { value: id });
}

export default fetchSheetData;
