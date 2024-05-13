import { HttpClient } from '@angular/common/http';
import { AfterViewChecked, Component, OnInit, ViewChild,ElementRef, resolveForwardRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete'
import { combineLatest, map, startWith } from 'rxjs';
import { Emitters } from 'src/app/emitters/emitter';
import { MatMenuTrigger, matMenuAnimations } from '@angular/material/menu';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
// import * as io from 'socket.io-client';
import { io, Socket } from 'socket.io-client';
import Swal from 'sweetalert2';
// @ViewChild('users') usersAutocomplete:MatAutocomplete;
// const baseUrl = 'http://localhost:5000';
const baseUrl = 'https://tele-chat-77dg.onrender.com';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  // standalone: true,
  // imports: [MatButtonModule, MatMenuModule],
})

export class HomeComponent implements OnInit,AfterViewChecked{
  private socket: Socket;
  // socket: SocketIOClient.Socket;
  // io('http://localhost:5000');
  @ViewChild(MatMenuTrigger) trigger:MatMenuTrigger;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  openMenu(){
    this.trigger.openMenu();
  }
  closeMenu(){
    this.trigger.closeMenu();
  }

  message: string="";
  textMessage: string="";
  showDiv: boolean=true;
  chatDivToDeleteId: string | null=null;
  optionSelected:boolean=false;
  constructor(private http:HttpClient,  
    // private socket:Socket  
    // private userService: UsersService
    ){
      this.socket = io(baseUrl);
      // this.socket.connect();

      // this.socket.fromEvent('sendMsgEvent').subscribe((message:string)=>{
      //   // this.
      // });
    }
  // messageId:String="";
  users:any[]=[]; 
  userMessages:any[]=[];
  allButCurr:any[]=[]; 
  currentUser:any={};
  receiver:any={};
  currUserId:number=-1;
  currUserSentChats:any[]=[];
  currUserReceivedChats:any[]=[];
  completeChatHistory:any[]=[];
  selectedUser:string="";
  roomNo:string="";

  searchControl= new FormControl('');
 
  currentDate:Date;

  ngOnInit():void{
    this.currentDate=new Date();

    this.http.get(baseUrl,{
      withCredentials:true
    })
    .subscribe((res:any)=>{
      // this.message=`Hi ${res.name}`;
      this.currentUser=res;
      this.currUserId=res._id;
      this.fetchUsers();
      // console.log("current user is: "+this.currentUser);
      Emitters.authEmitter.emit(true);
    },
    (err)=>{
      this.message="You are not logged in!";
      Emitters.authEmitter.emit(false);
    }
    );

    this.socket.on('sendMsgEvent',(message:string)=>{
      console.log("!!!!!!!!!!!!!!!!!!!!!!");
      this.retrieveLiveChat();
    });

  }
  ngAfterViewChecked() {        
    // this.socket.on('sendMsgEvent',(message:string)=>{
    //   console.log("event is fired: "+message);
    //   this.retrieveLiveChat();
    // });
    this.scrollToBottom();        
    
    // this.socket.fromEvent
  } 

  scrollToBottom(): void {
      try {
          this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      } catch(err) { }                 
  }
  private fetchUsers(){
    this.http.get(`${baseUrl}/api/home/users`+`/`+this.currentUser._id).subscribe((response:any)=>{
      this.allButCurr=response;
      console.log(this.allButCurr);
    },
    (error)=>{
      console.error('Error fetching users:',error);
    });
  }
async retrieveLiveChat(){
  console.log("refreshing chat")
  try{
    await this.updateChatsSent();
    await this.updateChatsReceived();
    this.chatHistory();
    
  }
  catch(error){
    console.log("sync methods: "+error);
  }
}
  async onOptionSelection(user:any){
    this.optionSelected=true;
    console.log("we will send msg to:"+user._id);
    this.receiver=user;

    let s_id=this.currentUser._id.slice(-3);
    let r_id=this.receiver._id.slice(-3);
    let combined_id= parseInt(s_id,10)+parseInt(r_id,10);
    this.roomNo=""+combined_id;
    console.log("the room no. is: "+this.roomNo);
    this.socket.emit('joinRoom',this.roomNo);
    // this.http.post('http://localhost:5000/api/joinRoom',{roomNo: this.roomNo}).subscribe((response)=>{
    //   console.log('Joined unique room successfully!');
    // },(error)=>{
    //   console.log("Error joining room:",error);
    // });

    try{
        await this.updateChatsSent();
        await this.updateChatsReceived();
        this.chatHistory();
        
    }
    catch(error){
      console.log("sync methods: "+error);
    }

  }

  updateChatsSent():Promise<void>{
    return new Promise((resolve,reject)=>{
      this.http.get(`${baseUrl}/api/home/user/chats/sent/`+this.currentUser._id+`/`+this.receiver._id).subscribe((response:any)=>{
        this.currUserSentChats=response;
        console.log("sent chats"+this.currUserSentChats+"okay?");
        resolve();
      },
      (error)=>{
        console.error('Error fetching users:',error);
        reject(error);
      });
    })

  }

  updateChatsReceived():Promise<void>{
    return new Promise((resolve,reject)=>{
      this.http.get(`${baseUrl}/api/home/user/chats/sent/`+this.receiver._id+`/`+this.currentUser._id).subscribe((response:any)=>{
        this.currUserReceivedChats=response;
        console.log("received chats"+this.currUserReceivedChats+"okay?");
        resolve();
      },
      (error)=>{
        console.error('Error fetching users:',error);
        reject(error);
      });
    });
  }

chatHistory():void {
    this.completeChatHistory=this.currUserSentChats.concat(this.currUserReceivedChats).map(doc=>doc);
    // this.completeChatHistory.forEach(item=>{
    //   console.log("all msgs are: "+item.message.text+" okay?");
    // })
    this.completeChatHistory.sort((a,b)=>{
      const time1=new Date(a.message.timestamp).getTime();
      const time2=new Date(b.message.timestamp).getTime();
      return time1-time2;
    });
    console.log("complete chats"+this.completeChatHistory);
  }
  async sendMessage(){
    console.log("hello sendMessage= "+ this.textMessage);

    // this.socket.emit('sendMsg',this.roomNo);
    this.socket.emit('sendMsg',{room: 'room-'+this.roomNo,text: this.textMessage});

    // this.socket.fromEvent('sendMsgEvent').subscribe((message:string)=>{
    //   // this.
    // });
    try{    
      console.log('done1');
      await this.postMessage();
      console.log('done2');
      this.onOptionSelection(this.receiver);
      
    }
    catch(error){
      console.log("sync methods: "+error);
    }
    // setTimeout(() => {
    //   this.socket.on('sendMsgEvent',(message:string)=>{
    //     this.retrieveLiveChat();
    //   });
      
    // }, 1000);
  }

  postMessage():Promise<void>{
    return new Promise((resolve,reject)=>{
      const url=`${baseUrl}/api/home/user/chat`;
      const dataToSend={
        receiver: this.receiver._id,
        sender: this.currentUser._id,
        text: this.textMessage,
        timestamp: new Date()
      }
      
      this.http.post(url,dataToSend).subscribe((response:any)=>{
        console.log(response);
        // this.socket.emit('broadcastMessage',this.message);
        this.textMessage="";
        resolve();
      },
      (error)=>{
        console.error('Error sending message:',error);
        reject(error);
      });
      
    });
  }


  onDeleteMessage(messageId:string,msgSenderId:string){

    this.chatDivToDeleteId=messageId;
    if(this.currentUser._id===msgSenderId){
      console.log("deletion initited for id: "+messageId); 
      const url=`${baseUrl}/api/home/user/msg/delete`;
      this.http.post(url,{messageId}).subscribe((response:any)=>{
        this.socket.emit('sendMsg',{room: 'room-'+this.roomNo,text: "deletion done live"});
        console.log(response);
        // this.chatDivToDeleteId=null;
      },
      (error)=>{
        console.error('Error deleting message:',error);
      });
    }else{
      Swal.fire("Error","You can delete only your own messages!","error");
    }
  }

  async openInputPopup(messageId:string,msgSenderId:string){
    if(this.currentUser._id===msgSenderId){
      const userInput=window.prompt("Enter your text:");
      if(userInput!=null){
        this.onEditMessage(messageId,userInput);
      }
      try{
        await this.updateChatsSent();
        await this.updateChatsReceived();
        this.chatHistory();
      }
      catch(error){
        console.log("sync methods: "+error);
      }
    }else{
      Swal.fire("Error","You can edit only your own messages!","error");
    }
  }

   onEditMessage(messageId:string,userInput:string){
    console.log("edit msg initiated for msg id: "+ messageId);
    const url=`${baseUrl}/api/home/user/msg/edit`;
    const obj={
      messageId:messageId,
      userInput:userInput
    }
    this.http.post(url,obj).subscribe((response:any)=>{
      console.log(response);
      this.socket.emit('sendMsg',{room: 'room-'+this.roomNo,text: "edit done live"});
      // try{
      //   this.updateChatsSent();
      //   this.updateChatsReceived();
      //   this.chatHistory();
      // }
      // catch(error){
      //   console.log("sync methods: "+error);
      // }

    },
    (error)=>{
      console.error('Error editing message:',error);
    });

  }

}
