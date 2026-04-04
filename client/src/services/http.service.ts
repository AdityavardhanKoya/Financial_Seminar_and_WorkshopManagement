import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class HttpService {
  
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // Auth
  login(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/user/login`, body);
  }

  registerParticipant(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/user/register`, body);
  }

  // Institution
  createEvent(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/institution/event`, body);
  }

  updateEvent(eventId: number, body: any): Observable<any> {
    const instId = this.auth.getUserId();
    return this.http.put(`${this.baseUrl}/api/institution/event/${eventId}?institutionId=${instId}`, body);
  }

  deleteEvent(eventId: number): Observable<any> {
    const instId = this.auth.getUserId();
    return this.http.delete(`${this.baseUrl}/api/institution/event/${eventId}?institutionId=${instId}`);
  }

  getInstitutionEvents(): Observable<any> {
    const instId = this.auth.getUserId();
    return this.http.get(`${this.baseUrl}/api/institution/events?institutionId=${instId}`);
  }

  addResource(eventId: number, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/institution/event/${eventId}/resource`, body);
  }

  getProfessionals(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/institution/event/professionals`);
  }

  assignProfessional(eventId: number, profId: number) {
    // Replaced {} with null
    return this.http.post(
      `${this.baseUrl}/api/institution/event/${eventId}/professional?userId=${profId}`,
      null
    );
  }

  getInstitutionFeedbacks(eventId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/institution/event/${eventId}/feedbacks`);
  }

  // Professional
  getProfessionalEvents(): Observable<any> {
    const userId = this.auth.getUserId();
    return this.http.get(`${this.baseUrl}/api/professional/events?userId=${userId}`);
  }

  respondToAssignment(eventId: number, status: 'ACCEPTED' | 'REJECTED'): Observable<any> {
    const userId = this.auth.getUserId();
    // Use explicitly null for the body to avoid sending [object Object]
    return this.http.put(
      `${this.baseUrl}/api/professional/event/${eventId}/assignment?userId=${userId}&status=${status}`,
      null
    );
  }

  updateEventStatus(eventId: number, status: string): Observable<any> {
    const userId = this.auth.getUserId();
    // Use explicitly null for the body
    return this.http.put(
      `${this.baseUrl}/api/professional/event/${eventId}/status?userId=${userId}&status=${status}`,
      null
    );
  }

  addProfessionalFeedback(eventId: number, body: any): Observable<any> {
    const userId = this.auth.getUserId();
    return this.http.post(`${this.baseUrl}/api/professional/event/${eventId}/feedback?userId=${userId}`, body);
  }

  // Participant
  getParticipantEvents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/participant/events`);
  }

  enrollEvent(eventId: number) {
    const userId = this.auth.getUserId();
    // Use explicitly null for the body
    return this.http.post(
      `${this.baseUrl}/api/participant/event/${eventId}/enroll?userId=${userId}`,
      null,
      { headers: this.getAuthHeaders() }
    );
  }

  addParticipantFeedback(eventId: number, body: any): Observable<any> {
    const userId = this.auth.getUserId();
    return this.http.post(`${this.baseUrl}/api/participant/event/${eventId}/feedback?userId=${userId}`, body);
  }

  viewEventStatus(eventId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/participant/event/${eventId}/status`);
  }
  
  registerUser(data: any) {
    return this.http.post(`${this.baseUrl}/api/user/register`, data);
  }

  Login(data: any) {
    return this.http.post(`${this.baseUrl}/api/user/login`, data);
  }
  forgotPassword(body: any) {
  return this.http.post(`${this.baseUrl}/api/user/forgot-password`, body);
}

resetPassword(body: any) {
  return this.http.post(`${this.baseUrl}/api/user/reset-password`, body);
}
forgotPasswordOtp(body: any) {
  return this.http.post(`${this.baseUrl}/api/user/forgot-password-otp`, body);
}

resetPasswordOtp(body: any) {
  return this.http.post(`${this.baseUrl}/api/user/reset-password-otp`, body);
}
}