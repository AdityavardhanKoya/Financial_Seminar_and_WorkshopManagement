import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';
import { CreateEventComponent } from '../app/create-event/create-event.component';
import { AuthService } from '../services/auth.service';
import { HttpService } from '../services/http.service';

describe('CreateEventComponent', () => {
  let component: CreateEventComponent;
  let fixture: ComponentFixture<CreateEventComponent>;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;

  beforeEach(async () => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['getEventByInstitutionId', 'createEvent', 'updateEvent']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, RouterTestingModule],
      declarations: [CreateEventComponent],
      providers: [
        { provide: HttpService, useValue: httpSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEventComponent);
    component = fixture.componentInstance;
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;

    // Mocking the HttpService methods to return observables
    httpServiceSpy.getEventByInstitutionId.and.returnValue(of([])); // Return an empty array or suitable mock data
    httpServiceSpy.createEvent.and.returnValue(of({}));
    httpServiceSpy.updateEvent.and.returnValue(of({}));

    fixture.detectChanges();
  });

  it('should create the form with initial empty values and required validators', () => {
    expect(component.itemForm).toBeDefined();
    expect(component.itemForm.valid).toBeFalsy();

    const formValues = component.itemForm.value;
    expect(formValues.title).toBeUndefined();
    expect(formValues.schedule).toBeUndefined();
    expect(formValues.location).toBeUndefined();
    expect(formValues.status).toBeNull();
    expect(formValues.description).toBeUndefined();
    expect(formValues.institutionId).toBeNull();

    expect(component.itemForm.controls['title'].hasError('required')).toBeTruthy();
    expect(component.itemForm.controls['schedule'].hasError('required')).toBeTruthy();
    expect(component.itemForm.controls['location'].hasError('required')).toBeTruthy();
    expect(component.itemForm.controls['status'].hasError('required')).toBeTruthy();
    expect(component.itemForm.controls['description'].hasError('required')).toBeTruthy();
  });

  it('should mark the form as valid when all required fields are filled', () => {
    component.itemForm.controls['title'].setValue('Event Title');
    component.itemForm.controls['schedule'].setValue('2024-08-10');
    component.itemForm.controls['location'].setValue('Event Location');
    component.itemForm.controls['status'].setValue('Active');
    component.itemForm.controls['description'].setValue('Event Description');

    expect(component.itemForm.valid).toBeTruthy();
  });

  // Additional tests related to form behavior and submission can be added here
});
