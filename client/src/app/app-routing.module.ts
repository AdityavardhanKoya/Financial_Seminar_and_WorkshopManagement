import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';


import { AppComponent } from './app.component';
import { DashbaordComponent } from './dashbaord/dashbaord.component';

import { CreateEventComponent } from './create-event/create-event.component';
import { AddResourceComponent } from './add-resource/add-resource.component';

import { ViewEventsComponent } from './view-events/view-events.component';

import { AssignProfessionalComponent } from './assign-professional/assign-professional.component';
import { UpdateEventStatusComponent } from './update-event-status/update-event-status.component';
import { AddFeedbackComponent } from './add-feedback/add-feedback.component';


  
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },

  // Institution operations
  { path: 'create-event', component: CreateEventComponent },
  { path: 'add-resource', component: AddResourceComponent },
  { path: 'assign-professional', component: AssignProfessionalComponent },
  { path: 'update-event-status', component: UpdateEventStatusComponent },
  { path: 'add-feedback', component: AddFeedbackComponent },
  { path: 'view-events', component: ViewEventsComponent },

  // Dashboard
  { path: 'dashboard', component: DashbaordComponent },

  // Default route
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Wildcard
  { path: '**', redirectTo: 'login' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
