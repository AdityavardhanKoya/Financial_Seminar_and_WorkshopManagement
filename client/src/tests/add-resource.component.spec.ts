import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AddResourceComponent } from '../app/add-resource/add-resource.component';
import { AuthService } from '../services/auth.service';
import { HttpService } from '../services/http.service';

describe('AddResourceComponent', () => {
  let component: AddResourceComponent;
  let fixture: ComponentFixture<AddResourceComponent>;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;

  beforeEach(async () => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['getEventByInstitutionId', 'addResource']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, RouterTestingModule],
      declarations: [AddResourceComponent],
      providers: [
        { provide: HttpService, useValue: httpSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddResourceComponent);
    component = fixture.componentInstance;
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;

    // Mocking the HttpService methods to return observables
    httpServiceSpy.getEventByInstitutionId.and.returnValue(of([])); // Mock data for the event
    httpServiceSpy.addResource.and.returnValue(of({})); // Mock successful response for adding a resource

    fixture.detectChanges();
  });

  it('should create the form with initial empty values and required validators', () => {
    expect(component.itemForm).toBeDefined();
    expect(component.itemForm.valid).toBeFalsy();

    const formValues = component.itemForm.value;
    expect(formValues.eventId).toBeNull();
    expect(formValues.type).toBeUndefined();
    expect(formValues.description).toBeUndefined();
    expect(formValues.availabilityStatus).toBeNull();

    expect(component.itemForm.controls['eventId'].hasError('required')).toBeTruthy();
    expect(component.itemForm.controls['type'].hasError('required')).toBeTruthy();
    expect(component.itemForm.controls['description'].hasError('required')).toBeTruthy();
    expect(component.itemForm.controls['availabilityStatus'].hasError('required')).toBeTruthy();
  });

  it('should mark the form as valid when all required fields are filled', () => {
    component.itemForm.controls['eventId'].setValue(1);
    component.itemForm.controls['type'].setValue('Resource Type');
    component.itemForm.controls['description'].setValue('Resource Description');
    component.itemForm.controls['availabilityStatus'].setValue('Available');

    expect(component.itemForm.valid).toBeTruthy();
  });

  // Additional tests related to form behavior and submission can be added here
});
