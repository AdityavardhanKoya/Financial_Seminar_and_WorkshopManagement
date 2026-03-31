import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  Login(details: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/user/login`, details);
  }

  registerUser(details: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/user/register`, details);
  }

  createEvent(details: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/institution/event`,
      details,
      { headers: this.getAuthHeaders() }
    );
  }

  updateEvent(eventId: any, details: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/institution/event/${eventId}`,
      details,
      { headers: this.getAuthHeaders() }
    );
  }

  getEventByInstitutionId(id: any): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/institution/events?institutionId=${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Fix: keep full details object including eventId in the body
  addResource(details: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/institution/event/${details.eventId}/resource`,
      details,
      { headers: this.getAuthHeaders() }
    );
  }

  GetAllProfessionals(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/institution/event/professionals`,
      { headers: this.getAuthHeaders() }
    );
  }

  assignProfessionals(eventId: any, userId: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/institution/event/${eventId}/professional?userId=${userId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  getEventByProfessional(id: any): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/professional/events?userId=${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  UpdateEventStatus(eventId: any, status: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/professional/event/${eventId}/status?status=${status}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  AddFeedback(eventId: any, userId: any, details: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/professional/event/${eventId}/feedback?userId=${userId}`,
      details,
      { headers: this.getAuthHeaders() }
    );
  }

  // Fix: test expects /api/finance/events not /api/participant/events
  GetAllevents(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/finance/events`,
      { headers: this.getAuthHeaders() }
    );
  }

  viewAllEvents(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/participant/events`,
      { headers: this.getAuthHeaders() }
    );
  }

  EnrollParticipant(eventId: any, userId: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/participant/event/${eventId}/enroll?userId=${userId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  viewEventStatus(id: any): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/participant/event/${id}/status`,
      { headers: this.getAuthHeaders() }
    );
  }

  AddFeedbackByParticipants(eventId: any, userId: any, details: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/participant/event/${eventId}/feedback?userId=${userId}`,
      details,
      { headers: this.getAuthHeaders() }
    );
  }
}