// app.service.ts

  // upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './file.entity'; // Create this entity

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async saveUploadedFileToDb(buffer: Buffer, originalname: string): Promise<void> {
    try {
      const file = new FileEntity();
      file.originalname = originalname;

      await this.fileRepository.save(file);
    } catch (error) {
      console.error('Error saving uploaded file to database:', error);
      throw new BadRequestException('Error saving uploaded file to database');
    }
  }

  async getAllUploadedFiles(): Promise<FileEntity[]> {
    try {
      return await this.fileRepository.find();
    } catch (error) {
      console.error('Error retrieving uploaded files:', error);
      throw new BadRequestException('Error retrieving uploaded files');
    }
  }

  async runPythonScript(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const pythonScriptPath = path.join(__dirname, 'process_excel.py');
      const pythonProcess = spawn('python', [pythonScriptPath, filePath]);

      pythonProcess.on('exit', (code) => {
        if (code === 0) {
          console.log('Python script executed successfully');
          resolve();
        } else {
          console.error(`Python script execution failed with code ${code}`);
          reject(new BadRequestException('Python script execution failed'));
        }
      });
    });
  }

  readXMLFile(filePath: string): string {
    try {
      // Make sure the file exists before attempting to read
      if (fs.existsSync(filePath)) {
        const xmlContent = fs.readFileSync(filePath, 'utf-8');
        return xmlContent;
      } else {
        console.error('Error: XML file does not exist at path:', filePath);
        return null;
      }
    } catch (error) {
      console.error('Error reading XML file:', error);
      return null;
    }
  }
}


// upload.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors, Res, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import * as path from 'path';
import { Response } from 'express';
import { FileEntity } from './file.entity'; // Create this entity

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcelFileToDb(@UploadedFile() file, @Res() res) {
    try {
      if (!file) {
        throw new Error('No file selected');
      }

      await this.uploadService.saveUploadedFileToDb(file.buffer, file.originalname);

      // Send success response
      res.json({ success: true, message: 'File uploaded to database successfully' });
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  @Post('runPython')
  @UseInterceptors(FileInterceptor('file'))
  async runPythonScript(@UploadedFile() file, @Res() res) {
    try {
      if (!file) {
        throw new Error('No file selected');
      }

      // Save the uploaded file locally
      const filePath = path.join(__dirname, 'uploads', file.originalname);
      fs.writeFileSync(filePath, file.buffer);

      console.log('File saved successfully at path:', filePath);

      // Run the Python script with the uploaded file
      await this.uploadService.runPythonScript(filePath);

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

  @Get('files')
  async getAllUploadedFiles(): Promise<FileEntity[]> {
    return this.uploadService.getAllUploadedFiles();
  }
}



// npm install @nestjs/typeorm typeorm pg

// typeorm.config.js
module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'your_username',
  password: 'your_password',
  database: 'your_database_name',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true, // Automatically creates database tables. Set to false in production.
};


// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadModule } from './upload/upload.module'; // Import your module

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'your_username',
      password: 'your_password',
      database: 'your_database_name',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Automatically creates database tables. Set to false in production.
    }),
    UploadModule, // Add your module here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}




// file.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  originalname: string;
}


