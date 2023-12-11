import fs from "fs";
import csv from "csv-parser";
import fastcsv from 'fast-csv';
import xlsx from  "xlsx";
import path from 'path';
import { fileURLToPath } from 'url';

function readCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      });
  });
}

function readExcelFile(filePath) {
    // console.log(filePath);
    const workbook = xlsx.readFile(filePath);
    const sheetName = 'Museum,Shop, and HVR Inventory';
    if (!workbook.SheetNames.includes(sheetName)) {
        throw new Error(`No sheet named "${sheetName}" found`);
      }
    // const sheetName = workbook.SheetNames[0]; 
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, {raw:true,defval: "" });
    //   console.log(data); // Debugging line to print the raw data
    return data;
}

function getFileType(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    if (extension === '.xlsx' || extension === '.xls') {
        return 'excel';
    } else if (extension === '.csv') {
        return 'csv';
    } else {
        throw new Error('Unsupported file type');
    }
}

function processData(data) {
    // Filter where Building is 'Museum'
    console.log(data)

    if (data.some(row => 'Building' in row)) {
        // Handle the case where 'Building' column is not found
        data = data.filter(row => row.Building === 'Museum');
        // Additional logic here...
      } 
    // Use regex to select columns of interest
    const patterns = {
        title: /\s*title\s*/i,
        // category: /category/,
        category: /\s*item[\s_\-]*type\s*/i,
        room: /\s*room\s*/i,
        location: /\s*location(?!.*type)\s*/i, // Matches 'location' but not 'location type'
        location_type: /\s*location[\s_\-]*type\s*/i, // Matches 'location type' with various separators
        asset_number: /\s*asset[\s_\-#]*\s*/i, // Matches 'asset number' with various separators
        manufacturer: /\s*manufacturer[\s_\-#]*\s*/i,
        era: /\s*era[\s_\-#]*\s*/i
    };

    const headers = Object.keys(data[0] || {}).reduce((acc, key) => {
        for (const column in patterns) {
            // console.log(key)
            if (patterns[column].test(key)) {
                acc[column] = key;  // Map normalized key to original key
                break;
            }
        }
        return acc;
    }, {});

    
    // Map data to include only selected columns
    data=data.map(row => {
        return Object.keys(headers).reduce((filteredRow, patternKey) => {
            const originalKey = headers[patternKey];
            filteredRow[patternKey] = row[originalKey];
            return filteredRow;
        }, {});
    });
    
    // console.log(data);

    // Remove duplicates (based on a unique key, e.g., asset_number)
    const uniqueData = Array.from(new Map(data.map(item => [`${item['asset_number']}_${item['title']}`, item])).values());
    return uniqueData
}

function writeDataToCSV(data) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const outputDir = path.join(__dirname,'..', '..', "processed_data");
    console.log("outputDir"+outputDir);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    const outputFilePath = path.join(outputDir, 'processed_exhibits.csv');

    const ws = fs.createWriteStream(outputFilePath);
    const csvStream = fastcsv.format({ headers: true });

    csvStream.pipe(ws);

    csvStream.on('end', () => {
        // console.log(`Data saved to ${outputFilePath}`);
    });

    csvStream.on('error', (error) => {
        console.error('CSV stream error:', error);
    });

    data.forEach(row => {
        csvStream.write(row);
    });

    csvStream.end();

    return { headers: Object.keys(data[0] || {}), filePath: outputFilePath };
}




async function helperProcessData(filePath, file_name) {
    const fileType = getFileType(file_name);
    let data;

    if (fileType === 'excel') {
        data = readExcelFile(filePath);
    } else if (fileType === 'csv') {
        data = await readCSVFile(filePath);
    }
    const processedData  = processData(data);
    const { headers, filePath: outputFilePath } = writeDataToCSV(processedData);
    // console.log(headers)
    return { headers, filePath: outputFilePath };
}

export  {helperProcessData};
