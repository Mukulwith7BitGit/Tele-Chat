// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// @Injectable({
//   providedIn: 'root'
// })
// export class ChatService {
//   private apiUrl = 'http://your-api-endpoint.com/chat';
//   constructor(private http: HttpClient) { }
//   sendMessage(sender: string, receiver: string, message: string) {
//     return this.http.post(`${this.apiUrl}/send`, { sender, receiver, message });
//   }
// }




// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { io } from "socket.io-client";


// @Injectable({
//   providedIn: 'root',
// })
// export class ChatService {

//   public message$: BehaviorSubject<string> = new BehaviorSubject('');
//   constructor() {}

//   socket = io('http://localhost:3000');

//   public sendMessage(message: any) {
//     console.log('sendMessage: ', message)
//     this.socket.emit('message', message);
//   }

//   public getNewMessage = () => {
//     this.socket.on('message', (message) =>{
//       this.message$.next(message);
//     });

//     return this.message$.asObservable();
//   };
// }

