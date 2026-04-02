import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-resource',
  templateUrl: './add-resource.component.html',
  styleUrls: ['./add-resource.component.scss']
})
export class AddResourceComponent implements OnInit {

  itemForm: FormGroup; 
  formModel:any={status:null};
  showError:boolean=false;
  errorMessage:any;
 
  assignModel: any={};

  showMessage: any;
  responseMessage: any;
  eventList: any=[];
  constructor(public router:Router, public httpService:HttpService, private formBuilder: FormBuilder, private authService:AuthService) 
    {
      this.itemForm = this.formBuilder.group({
        eventId: [this.formModel.eventId,[ Validators.required]],
        type: [this.formModel.type,[ Validators.required]],
        description: [this.formModel.description,[ Validators.required]],
        availabilityStatus: [this.formModel.availabilityStatus,[ Validators.required]]
       
    });

   
  }
  ngOnInit(): void {
    this.getEvent();
    this.formModel.availabilityStatus=null;
  }

  getEvent() {
    this.eventList=[];
    const userIdString = localStorage.getItem('userId');
    const userId = userIdString ? parseInt(userIdString, 10) : null;

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
  onSubmit()
  {
      debugger;
      if (this.itemForm.valid) {
        this.showError = false;
        this.httpService.addResource(this.itemForm.value).subscribe((data: any) => {
          this.itemForm.reset();
          this.responseMessage="Saved Successfully";
        }, error => {
          // Handle error
          this.showError = true;
          this.errorMessage = "An error occurred while logging in. Please try again later.";
          console.error('Login error:', error);
        });;
      } else {
        this.itemForm.markAllAsTouched();
      }
    }
    
  

 
}
