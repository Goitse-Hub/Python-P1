// app.controller.ts - First
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

@Controller('upload')
export class UploadController {
  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcelFile(@UploadedFile() file) {
    try {
      // Save the uploaded file locally (you may want to add error handling here)
      const filePath = path.join(__dirname, 'uploads', file.originalname);
      fs.writeFileSync(filePath, file.buffer);

      // Run the Python script with the uploaded file
      const pythonScriptPath = path.join(__dirname, 'process_excel.py');
      const pythonProcess = spawn('python', [pythonScriptPath, filePath]);

      pythonProcess.on('exit', (code) => {
        if (code === 0) {
          // Assuming the Python script writes XML to a file, read the XML file
          const xmlFilePath = path.join(__dirname, 'output.xml');
          const xmlData = this.readXMLFile(xmlFilePath);
          return { success: true, data: xmlData };
        } else {
          console.error(`Python script execution failed with code ${code}`);
          return { success: false, error: 'Python script execution failed' };
        }
      });
    } catch (error) {
      console.error('Error processing file:', error);
      return { success: false, error: 'Error processing file' };
    }
  }

  // Function to read XML file
  readXMLFile(filePath: string): string {
    try {
      const xmlContent = fs.readFileSync(filePath, 'utf-8');
      return xmlContent;
    } catch (error) {
      console.error('Error reading XML file:', error);
      return null;
    }
  }
}
