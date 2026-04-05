import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { HomeComponent } from './home/home.component'; // Added Home import

import { CreateEventComponent } from './create-event/create-event.component';
import { DeleteEventComponent } from './delete-event/delete-event.component';
import { AddResourceComponent } from './add-resource/add-resource.component';
import { AssignProfessionalComponent } from './assign-professional/assign-professional.component';
import { ViewEventsComponent } from './view-events/view-events.component';
import { UpdateEventStatusComponent } from './update-event-status/update-event-status.component';
import { AddFeedbackComponent } from './add-feedback/add-feedback.component';
import { ViewFeedbacksComponent } from './view-feedback/view-feedback.component';
import { JwtInterceptor } from './jwt.interceptor';
import { ViewInstitutionComponent } from './view-institution/view-institution.component';
import { ViewProfessionalComponent } from './view-professional/view-professional.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ForgotPasswordOtpComponent } from './forgot-password-otp/forgot-password-otp.component';
import { ResetPasswordOtpComponent } from './reset-password-otp/reset-password-otp.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    RegistrationComponent,
    HomeComponent, // Added to declarations
    CreateEventComponent,
    DeleteEventComponent,
    AddResourceComponent,
    ViewInstitutionComponent,
    ViewProfessionalComponent,
    AssignProfessionalComponent,
    ViewEventsComponent,
    UpdateEventStatusComponent,
    AddFeedbackComponent,
    ViewFeedbacksComponent,
    ForgotPasswordComponent,

    ResetPasswordComponent,
    
ForgotPasswordOtpComponent,
    ResetPasswordOtpComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}