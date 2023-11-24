// file-upload.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post('http://localhost:3000/upload/excel', formData, { responseType: 'text' })
        .subscribe(
          (xmlData: string) => {
            // Trigger download in the browser
            const blob = new Blob([xmlData], { type: 'application/xml' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'output.xml';
            link.click();
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
}
