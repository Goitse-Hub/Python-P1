// file-upload.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { UploadService } from 'src/app/Services/upload.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  selectedFile: File | null = null;
  @Output() fileUploaded: EventEmitter<any> = new EventEmitter<any>();

  constructor(private uploadService: UploadService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (this.selectedFile) {
      this.uploadService.uploadFile(this.selectedFile)
        .subscribe(
          (xmlData: string) => {
            // Trigger download in the browser
            this.downloadFile(xmlData, 'output.xml', 'application/xml');

            // Emit the event to notify that a file has been uploaded
            const fileInfo = {
              name: this.selectedFile?.name,
              dateUploaded: new Date().toLocaleString(),
              status: 'completed' // Change this based on your logic
            };
            this.fileUploaded.emit(fileInfo);
          },
          error => {
            console.error(error);
            // Handle error
          }
        );
    } else {
      console.error('No file selected');
    }
  }

  private downloadFile(data: string, filename: string, contentType: string) {
    const blob = new Blob([data], { type: contentType });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
}



// fetch-files.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-fetch-files',
  templateUrl: './fetch-files.component.html',
  styleUrls: ['./fetch-files.component.css']
})
export class FetchFilesComponent {
  uploadedFiles: any[] = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');

  reloadFiles(fileInfo: any) {
    console.log('File Uploaded Event Triggered:', fileInfo);

    // Update the list of uploaded files in localStorage
    this.uploadedFiles.push(fileInfo);
    localStorage.setItem('uploadedFiles', JSON.stringify(this.uploadedFiles));
  }
}

