// app.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { spawn } from 'child_process';
import { UploadService } from './app.service';

const exec = promisify(require('child_process').exec);

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcelFile(@UploadedFile() file, @Res() res) {
    try {
      if (!file) {
        throw new Error('No file selected');
      }

      const uploadsFolder = path.join(__dirname, 'uploads');

      // Create the 'uploads' folder if it doesn't exist
      if (!fs.existsSync(uploadsFolder)) {
        fs.mkdirSync(uploadsFolder);
      }

      // Save the uploaded file locally
      const filePath = path.join(uploadsFolder, file.originalname);
      fs.writeFileSync(filePath, file.buffer);

      console.log('File saved successfully at path:', filePath);

      // Run the Python script with the uploaded file
      const pythonScriptPath = path.join(__dirname, 'process_excel.py');
      const command = `python ${pythonScriptPath} ${filePath}`;

      console.log('Executing command:', command);

      const { stdout, stderr } = await exec(command);

      if (stderr) {
        console.error('Error executing Python script:', stderr);
        res.status(500).json({ success: false, error: 'Error executing Python script' });
        return;
      }

      console.log('Python script executed successfully:', stdout);

      // Assuming the Python script writes XML to a file, read the XML file
      const xmlFilePath = path.join(__dirname, 'output.xml');
      const xmlData = this.uploadService.readXMLFile(xmlFilePath);

      if (xmlData) {
        console.log('XML data read successfully:', xmlData);

        // Send XML content back to the Angular application
        res.set({
          'Content-Type': 'application/xml',
          'Content-Disposition': 'attachment; filename=output.xml',
        });
        res.send(xmlData);
      } else {
        console.error('Error: XML file data is null');
        res.status(500).json({ success: false, error: 'Error processing XML file' });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
