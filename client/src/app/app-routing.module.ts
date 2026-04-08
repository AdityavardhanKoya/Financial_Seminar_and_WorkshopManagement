import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component'; // Added Home import
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { CreateEventComponent } from './create-event/create-event.component';
import { DeleteEventComponent } from './delete-event/delete-event.component';

import { AssignProfessionalComponent } from './assign-professional/assign-professional.component';
import { ViewEventsComponent } from './view-events/view-events.component';
import { UpdateEventStatusComponent } from './update-event-status/update-event-status.component';
import { AddFeedbackComponent } from './add-feedback/add-feedback.component';
import { ViewFeedbacksComponent } from './view-feedback/view-feedback.component';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';
import { SelectedEventGuard } from './selected-event.guard';
import { ViewInstitutionComponent } from './view-institution/view-institution.component';
import { ViewProfessionalComponent } from './view-professional/view-professional.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

import { ForgotPasswordOtpComponent } from './forgot-password-otp/forgot-password-otp.component';
import { ResetPasswordOtpComponent } from './reset-password-otp/reset-password-otp.component';

const routes: Routes = [
  // Landing Page
  { path: '', component: HomeComponent }, 
  { path: 'home', component: HomeComponent },

  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },

  // Portal Routes (Require Authentication)
  {
    path: 'view-events',
    component: ViewEventsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['PARTICIPANT'] }
  },
 {
    path: 'view-events',
    component: ViewInstitutionComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['PARTICIPANT'] }
  },
  // Institution
  { path: 'create-event', component: CreateEventComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['INSTITUTION'] } },
  { path: 'delete-event', component: DeleteEventComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['INSTITUTION'] } },

  { path: 'assign-professional', component: AssignProfessionalComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['INSTITUTION'] } },

  // Professional
  { path: 'update-event-status', component: UpdateEventStatusComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['PROFESSIONAL'] } },
  { path: 'add-feedback', component: AddFeedbackComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['PROFESSIONAL'] } },
  {
    path: 'view-professional',
    component: ViewProfessionalComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['PROFESSIONAL'] }
  },
  // Selected-event feedbacks
  // INSTITUTION ONLY — View feedbacks from PROFESSIONAL + PARTICIPANT
  {
    path: 'view-feedbacks',
    component: ViewFeedbacksComponent,
    canActivate: [AuthGuard, RoleGuard, SelectedEventGuard],
    data: { roles: ['INSTITUTION'] }
  },
    {
    path: 'view-institution',
    component: ViewInstitutionComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['INSTITUTION'] }
  },
  { path: 'forgot-password', component: ForgotPasswordOtpComponent },
{ path: 'reset-password', component: ResetPasswordOtpComponent },

{ path: 'reset-password', component: ResetPasswordComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}