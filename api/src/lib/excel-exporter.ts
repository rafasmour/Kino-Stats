import * as xlsx from 'xlsx';
import * as fs from 'fs';
import path from 'path';

const DATA_DIR_NAME = 'data';
const rootDir = path.resolve(__dirname, '../');
const exportDir = path.join(rootDir, DATA_DIR_NAME);

export default class ExcelExporter {
  public static excelExport(sheets: string[], data: any[][]) {
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const workbook = xlsx.utils.book_new();

    sheets.forEach((sheetName, index) => {
      const sheetData = data[index];
      const worksheet = xlsx.utils.json_to_sheet(sheetData);
      xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filePath = path.join(exportDir, `export_${timestamp}.xlsx`);

    xlsx.writeFile(workbook, filePath);
    console.log(`Excel report exported to ${filePath}`);
  }
}
