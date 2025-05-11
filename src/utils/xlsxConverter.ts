import * as XLSX from 'xlsx';

/**
 * Convert XLSX file to CSV string
 * @param file The XLSX file to convert
 * @returns A promise that resolves to the CSV string
 */
export const convertXlsxToCSV = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          throw new Error('Failed to read file');
        }
        
        // Parse the Excel file
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to CSV
        const csvContent = XLSX.utils.sheet_to_csv(worksheet);
        resolve(csvContent);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    // Read the file as an array buffer
    reader.readAsArrayBuffer(file);
  });
}; 