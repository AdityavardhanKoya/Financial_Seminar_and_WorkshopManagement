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
  showError = false;
  errorMessage: any;
  showMessage = false;
  responseMessage: any;
 
  constructor(private fb: FormBuilder, private httpService: HttpService) {
    this.itemForm = this.fb.group({
      eventId: [undefined, [Validators.required]],
      type: [undefined, [Validators.required]],
      description: [undefined, [Validators.required]],
      availabilityStatus: [undefined, [Validators.required]]
    });
    this.setUndefinedValues();
  }
 
  ngOnInit(): void {
    this.getEvent();
  }
 
  setUndefinedValues(): void {
    Object.keys(this.itemForm.controls).forEach(key => {
      this.itemForm.get(key)?.setValue(undefined, { emitEvent: false });
    });
  }
 
  getEvent(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
 
    this.httpService.getEventByInstitutionId(userId).subscribe({
      next: res => this.eventList = res
    });
  }
 
  onSubmit(): void {
    if (this.itemForm.invalid) return;
 
    this.httpService.addResource(this.itemForm.value).subscribe(() => {
      this.itemForm.reset();
      this.setUndefinedValues();
    });
  }
}