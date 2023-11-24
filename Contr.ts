// app.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

@Controller('upload')
export class UploadController {
  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcelFile(@UploadedFile() file, @Res() res) {
    try {
      const uploadsFolder = path.join(__dirname, 'uploads');

      // Create the 'uploads' folder if it doesn't exist
      if (!fs.existsSync(uploadsFolder)) {
        fs.mkdirSync(uploadsFolder);
      }

      // Save the uploaded file locally
      const filePath = path.join(uploadsFolder, file.originalname);
      fs.writeFileSync(filePath, file.buffer);

      // Run the Python script with the uploaded file
      const pythonScriptPath = path.join(__dirname, 'process_excel.py');
      const pythonProcess = spawn('python', [pythonScriptPath, filePath]);

      pythonProcess.on('exit', (code) => {
        if (code === 0) {
          // Assuming the Python script writes XML to a file, read the XML file
          const xmlFilePath = path.join(__dirname, 'output.xml');
          const xmlData = this.readXMLFile(xmlFilePath);

          // Send XML content back to the Angular application
          res.set({
            'Content-Type': 'application/xml',
            'Content-Disposition': 'attachment; filename=output.xml',
          });
          res.send(xmlData);
        } else {
          console.error(`Python script execution failed with code ${code}`);
          res.status(500).json({ success: false, error: 'Python script execution failed' });
        }
      });
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ success: false, error: 'Error processing file' });
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
