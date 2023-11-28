// file-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post('http://localhost:3000/upload/excel', formData, { responseType: 'text' });
  }
}


// file-upload.component.ts
import { Component } from '@angular/core';
import { FileUploadService } from './file-upload.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
})
export class FileUploadComponent {
  selectedFile: File | null = null;

  constructor(private fileUploadService: FileUploadService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (this.selectedFile) {
      this.fileUploadService.uploadFile(this.selectedFile)
        .subscribe(
          (xmlData: string) => {
            // Trigger download in the browser
            this.downloadFile(xmlData, 'output.xml', 'application/xml');
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

// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { FileUploadService } from './file-upload/file-upload.service';

@NgModule({
  declarations: [
    FileUploadComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [FileUploadService],
  bootstrap: [FileUploadComponent],
})
export class AppModule {}
