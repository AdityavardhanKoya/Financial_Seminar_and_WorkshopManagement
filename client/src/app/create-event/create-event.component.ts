import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {

  itemForm: FormGroup; 
  formModel:any={status:null};
  showError:boolean=false;
  errorMessage:any;
  eventList:any=[];
  assignModel: any={};

  showMessage: any;
  responseMessage: any;
  updateId: any;
  constructor(public router:Router, public httpService:HttpService, private formBuilder: FormBuilder, private authService:AuthService) 
    {
      this.itemForm = this.formBuilder.group({
        title: [this.formModel.title,[ Validators.required]],      
        schedule: [this.formModel.schedule,[ Validators.required]],
        location: [this.formModel.location,[ Validators.required]],
        status: [this.formModel.status,[ Validators.required]],
        description: [this.formModel.description,[ Validators.required]],
        institutionId: [this.formModel.institutionId],
    });
  }
  ngOnInit(): void {
    this.getEvent();
  }
  getEvent() {
    this.eventList=[];
    const userIdString = localStorage.getItem('userId');
    const userId = userIdString ? parseInt(userIdString, 10) : null;
    this.itemForm.controls["institutionId"].setValue(userId)
    this.httpService.getEventByInstitutionId(userId).subscribe((data: any) => {
      this.eventList=data;
      console.log(this.eventList);
    }, error => {
      // Handle error
      this.showError = true;
      this.errorMessage = "An error occurred.. Please try again later.";
      console.error('Login error:', error);
    });;
  }
  edit(val:any)
  {
    this.itemForm.patchValue(val);
    this.updateId=val.id;
  }
 
  onSubmit()
  {
    
      if (this.itemForm.valid) {
        if(this.updateId==null)
        {
          this.showError = false;
          const userIdString = localStorage.getItem('userId');
          const userId = userIdString ? parseInt(userIdString, 10) : null;
          this.itemForm.controls["institutionId"].setValue(userId)
          this.httpService.createEvent(this.itemForm.value).subscribe((data: any) => {
            this.itemForm.reset();
            this.getEvent();
            
          }, error => {
            // Handle error
            this.showError = true;
            this.errorMessage = "An error occurred while created in. Please try again later.";
            console.error('Login error:', error);
          });;
        }
        else{
          this.showError = false;
          const userIdString = localStorage.getItem('userId');
          const userId = userIdString ? parseInt(userIdString, 10) : null;
          this.itemForm.controls["institutionId"].setValue(userId)
          this.httpService.updateEvent(this.updateId,this.itemForm.value).subscribe((data: any) => {
            this.itemForm.reset();
            this.getEvent();
            this.updateId=null;
            
          }, error => {
            // Handle error
            this.showError = true;
            this.errorMessage = "An error occurred while created in. Please try again later.";
            console.error('Login error:', error);
          });;
        }
       
      } else {
        this.itemForm.markAllAsTouched();
      }
    
   
  }

  
}
