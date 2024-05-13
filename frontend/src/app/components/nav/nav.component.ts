import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Emitters } from 'src/app/emitters/emitter';
// const baseUrl = 'http://localhost:5000';
const baseUrl = 'https://tele-chat-77dg.onrender.com';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  authenticated = false;
  constructor(private http:HttpClient){}
  ngOnInit():void{
    Emitters.authEmitter.subscribe((auth:boolean)=>{
      this.authenticated = auth;
    })
  }
  logout(): void{
    this.http.post(`${baseUrl}/api/logout`, {}, { withCredentials:true })
    .subscribe(() => this.authenticated=false)
  }
}
