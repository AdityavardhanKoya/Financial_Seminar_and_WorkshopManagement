import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-add-resource',
  templateUrl: './add-resource.component.html'
})
export class AddResourceComponent implements OnInit {

  itemForm: FormGroup;
  eventList: any = [];
  showError: boolean = false;
  errorMessage: any;
  showMessage: boolean = false;
  responseMessage: any;

  constructor(private fb: FormBuilder, private httpService: HttpService) {

    this.itemForm = this.fb.group({
      eventId: [undefined, Validators.required],
      type: [undefined, Validators.required],
      description: [undefined, Validators.required],
      availabilityStatus: [undefined, Validators.required]
    });
  }

  ngOnInit(): void {
    this.getEvent();
  }

  getEvent(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.showError = true;
      this.errorMessage = 'User ID missing.';
      return;
    }

    this.httpService.getEventByInstitutionId(userId).subscribe({
      next: (res) => {
        this.eventList = res;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load events.';
      }
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.showError = true;
      this.errorMessage = 'Fill all required fields.';
      return;
    }

    this.httpService.addResource(this.itemForm.value).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Resource added!';
        this.itemForm.reset();
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Add resource failed.';
      }
    });
  }
}