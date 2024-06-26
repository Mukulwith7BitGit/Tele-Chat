import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Téle-Chat';

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // to determine the current route and apply a class to <main> accordingly
        this.applyMainClass(event.url);
      }
    });
  }

  mainClass = 'form-signin';
  private applyMainClass(url: string) {
    if (url.includes('/home')) {
      this.mainClass = 'space-at-bottom';
    }
    else {
      this.mainClass = 'form-signin';
    }
  }
}

// import { Component } from '@angular/core';
// import { ChatService } from './services/chat.service';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   newMessage = '';
//   messageList: string[] = [];

//   constructor(private chatService: ChatService){

//   }

//   ngOnInit(){
//     this.chatService.getNewMessage().subscribe((message: string) => {
//       this.messageList.push(message);
//     })
//   }

//   sendMessage() {
//     this.chatService.sendMessage(this.newMessage);
//     this.newMessage = '';
//   }
// }