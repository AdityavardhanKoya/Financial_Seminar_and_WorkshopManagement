import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
 
@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html'
})
export class CreateEventComponent implements OnInit {
 
  itemForm: FormGroup;
  eventList: any = [];
  updateId: any;
 
  showError: boolean = false;
  errorMessage: string = '';
 
  showMessage: boolean = false;
  responseMessage: string = '';
 
  constructor(
    private fb: FormBuilder,
    private httpService: HttpService
  ) {
    this.itemForm = this.fb.group({
      institutionId: { value: undefined, disabled: false },
      title: { value: undefined, disabled: false },
      description: { value: undefined, disabled: false },
      schedule: { value: undefined, disabled: false },
      location: { value: undefined, disabled: false },
      status: { value: undefined, disabled: false }
    });
 
    this.itemForm.get('title')?.addValidators(Validators.required);
    this.itemForm.get('description')?.addValidators(Validators.required);
    this.itemForm.get('schedule')?.addValidators(Validators.required);
    this.itemForm.get('location')?.addValidators(Validators.required);
    this.itemForm.get('status')?.addValidators(Validators.required);
 
    this.itemForm.updateValueAndValidity();
  }
 
  ngOnInit(): void {
    this.getEvent();
  }
 
  getEvent(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
 
    this.httpService.getEventByInstitutionId(userId).subscribe({
      next: res => this.eventList = res
    });
  }
 
  edit(val: any): void {
    this.updateId = val.id;
    this.itemForm.patchValue(val);
  }
 
  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.showError = true;
      this.errorMessage = 'Please fill all required fields';
      this.showMessage = false;
      return;
    }
 
    if (this.updateId) {
      this.httpService.updateEvent(this.updateId, this.itemForm.value).subscribe({
        next: () => {
          this.responseMessage = 'Event updated successfully';
          this.showMessage = true;
          this.showError = false;
          this.itemForm.reset();
          this.updateId = null;
          this.getEvent();
        }
      });
    } else {
      this.httpService.createEvent(this.itemForm.value).subscribe({
        next: () => {
          this.responseMessage = 'Event created successfully';
          this.showMessage = true;
          this.showError = false;
          this.itemForm.reset();
          this.getEvent();
        }
      });
    }
  }
}