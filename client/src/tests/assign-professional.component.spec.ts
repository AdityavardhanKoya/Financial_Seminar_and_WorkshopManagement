import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';
import { AssignProfessionalComponent } from '../app/assign-professional/assign-professional.component';
import { AuthService } from '../services/auth.service';
import { HttpService } from '../services/http.service';

describe('AssignProfessionalComponent', () => {
  let component: AssignProfessionalComponent;
  let fixture: ComponentFixture<AssignProfessionalComponent>;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;

  beforeEach(async () => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['getEventByInstitutionId', 'GetAllProfessionals', 'assignProfessionals']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, RouterTestingModule],
      declarations: [AssignProfessionalComponent],
      providers: [
        { provide: HttpService, useValue: httpSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignProfessionalComponent);
    component = fixture.componentInstance;
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;

    // Mocking the HttpService methods to return observables
    httpServiceSpy.getEventByInstitutionId.and.returnValue(of([])); // Mock data for events
    httpServiceSpy.GetAllProfessionals.and.returnValue(of([])); // Mock data for professionals
    httpServiceSpy.assignProfessionals.and.returnValue(of({})); // Mock successful response for assigning professionals

    fixture.detectChanges();
  });

  it('should create the form with initial empty values and required validators', () => {
    expect(component.itemForm).toBeDefined();
    expect(component.itemForm.valid).toBeFalsy();

    const formValues = component.itemForm.value;
    expect(formValues.eventId).toBeNull();
    expect(formValues.userId).toBeNull();

    expect(component.itemForm.controls['eventId'].hasError('required')).toBeTruthy();
    expect(component.itemForm.controls['userId'].hasError('required')).toBeTruthy();
  });

  it('should mark the form as valid when all required fields are filled', () => {
    component.itemForm.controls['eventId'].setValue(1);
    component.itemForm.controls['userId'].setValue(2);

    expect(component.itemForm.valid).toBeTruthy();
  });

  // Additional tests related to form behavior and submission can be added here
});
