import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';

import { CreateEventComponent } from './create-event/create-event.component';
import { DeleteEventComponent } from './delete-event/delete-event.component';
import { AddResourceComponent } from './add-resource/add-resource.component';
import { AssignProfessionalComponent } from './assign-professional/assign-professional.component';
import { ViewEventsComponent } from './view-events/view-events.component';
import { UpdateEventStatusComponent } from './update-event-status/update-event-status.component';
import { AddFeedbackComponent } from './add-feedback/add-feedback.component';
import { ViewFeedbacksComponent } from './view-feedback/view-feedback.component';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';
import { SelectedEventGuard } from './selected-event.guard';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },

  // Shared view events (any logged in role)
  { path: 'view-events', component: ViewEventsComponent, canActivate: [AuthGuard] },

  // Institution
  { path: 'create-event', component: CreateEventComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['INSTITUTION'] } },
  { path: 'delete-event', component: DeleteEventComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['INSTITUTION'] } },
  { path: 'add-resource', component: AddResourceComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['INSTITUTION'] } },
  { path: 'assign-professional', component: AssignProfessionalComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['INSTITUTION'] } },

  // Professional
  { path: 'update-event-status', component: UpdateEventStatusComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['PROFESSIONAL'] } },
  { path: 'add-feedback', component: AddFeedbackComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['PROFESSIONAL'] } },

  // Selected-event feedbacks (Institution or Participant, must have selected event)
  { path: 'view-feedbacks', component: ViewFeedbacksComponent, canActivate: [AuthGuard, SelectedEventGuard] },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}