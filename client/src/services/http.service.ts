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

  /* ================= AUTH ================= */

  login(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/user/login`, body);
  }

  registerParticipant(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/user/register`, body);
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

  /* ================= INSTITUTION ================= */

  createEvent(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/institution/event`, body, { headers: this.getAuthHeaders() });
  }

  updateEvent(eventId: number, body: any): Observable<any> {
    const instId = this.auth.getUserId();
    return this.http.put(
      `${this.baseUrl}/api/institution/event/${eventId}?institutionId=${instId}`,
      body,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteEvent(eventId: number): Observable<any> {
    const instId = this.auth.getUserId();
    return this.http.delete(
      `${this.baseUrl}/api/institution/event/${eventId}?institutionId=${instId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getInstitutionEvents(): Observable<any> {
    const instId = this.auth.getUserId();
    return this.http.get(
      `${this.baseUrl}/api/institution/events?institutionId=${instId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  addResource(eventId: number, body: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/institution/event/${eventId}/resource`,
      body,
      { headers: this.getAuthHeaders() }
    );
  }

  getProfessionals(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/institution/event/professionals`, { headers: this.getAuthHeaders() });
  }

  assignProfessional(eventId: number, profId: number) {
    return this.http.post(
      `${this.baseUrl}/api/institution/event/${eventId}/professional?userId=${profId}`,
      null,
      { headers: this.getAuthHeaders() }
    );
  }

  getInstitutionFeedbacks(eventId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/institution/event/${eventId}/feedbacks`,
      { headers: this.getAuthHeaders() }
    );
  }

  /* ================= PROFESSIONAL ================= */

  getProfessionalEvents(): Observable<any> {
    const userId = this.auth.getUserId();
    return this.http.get(
      `${this.baseUrl}/api/professional/events?userId=${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  respondToAssignment(eventId: number, status: 'ACCEPTED' | 'REJECTED'): Observable<any> {
    const userId = this.auth.getUserId();
    return this.http.put(
      `${this.baseUrl}/api/professional/event/${eventId}/assignment?userId=${userId}&status=${status}`,
      null,
      { headers: this.getAuthHeaders() }
    );
  }

  updateEventStatus(eventId: number, status: string): Observable<any> {
    const userId = this.auth.getUserId();
    return this.http.put(
      `${this.baseUrl}/api/professional/event/${eventId}/status?userId=${userId}&status=${status}`,
      null,
      { headers: this.getAuthHeaders() }
    );
  }

  addProfessionalFeedback(eventId: number, body: any): Observable<any> {
    const userId = this.auth.getUserId();
    return this.http.post(
      `${this.baseUrl}/api/professional/event/${eventId}/feedback?userId=${userId}`,
      body,
      { headers: this.getAuthHeaders() }
    );
  }

  /* ================= PARTICIPANT ================= */

  getParticipantEvents(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/participant/events`,
      { headers: this.getAuthHeaders() }
    );
  }

  enrollEvent(eventId: number) {
  return this.http.post(
    `${this.baseUrl}/api/participant/event/${eventId}/enroll`,
    null,
    { headers: this.getAuthHeaders() }
  );
}


  addParticipantFeedback(eventId: number, body: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/participant/event/${eventId}/feedback`,
      body,
      { headers: this.getAuthHeaders() }
    );
  }

  viewEventStatus(eventId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/participant/event/${eventId}/status`,
      { headers: this.getAuthHeaders() }
    );
  }
}