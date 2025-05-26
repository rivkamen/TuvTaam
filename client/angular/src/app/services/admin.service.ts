// import { inject, Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable } from 'rxjs';

// import { environment } from '../environments/environment';
// import { Admin } from '../models/admin.model';
// @Injectable({ providedIn: 'root' })
// export class AdminService {
//     constructor(private http: HttpClient) { }
//     #http = inject(HttpClient);
//     apiServerAddress = environment.apiUrl;

//     GetAdminByMailAndPassword(email: string, password: string): Observable<Admin> {
//         const url = this.apiServerAddress + '/api/admin/getAdminByMailAndPassword';
//         const body = {
//             email,
//             password
//         };
//         return this.#http.post<Admin>(url, body);
//     }
//     GetAdminInfo(): Observable<Admin> {
//         const url = this.apiServerAddress + '/api/admin/getAdminInfo';
//         return this.#http.get<Admin>(url);
//     }

// }