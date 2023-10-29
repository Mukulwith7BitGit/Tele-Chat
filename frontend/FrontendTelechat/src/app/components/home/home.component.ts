import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete'
import { combineLatest, map, startWith } from 'rxjs';
import { Emitters } from 'src/app/emitters/emitter';
import { MatMenuTrigger, matMenuAnimations } from '@angular/material/menu';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

 
// @ViewChild('users') usersAutocomplete:MatAutocomplete;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  // standalone: true,
  // imports: [MatButtonModule, MatMenuModule],
})

export class HomeComponent implements OnInit{

  @ViewChild(MatMenuTrigger) trigger:MatMenuTrigger;

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

  constructor(private http:HttpClient,  
    // private userService: UsersService
    ){}
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

  searchControl= new FormControl('');

  // users$=combineLatest([
  //   this.users,
  //   this.currentUser,
  //   this.searchControl.valueChanges.pipe(startWith(''))
  // ]).pipe(
  //   map(([this.users,this.currentUser,searchString]))=> this.users.filter(u=>u.displayName?.toLowerCase().includes(searchString.toLowerCase()) && u._id!==this.currUserId)
  // );

  currentDate:Date;

  ngOnInit():void{
    this.currentDate=new Date();
    this.fetchUsers();
    this.http.get('http://localhost:5000/api/user',{
      withCredentials:true
    })
    .subscribe((res:any)=>{
      this.message=`Hi ${res.name}`;
      this.currentUser=res;
      this.currUserId=res._id;
      // console.log("current user is: "+this.currentUser);
      Emitters.authEmitter.emit(true);
    },
    (err)=>{
      this.message="You are not logged in!";
      Emitters.authEmitter.emit(false);
    }
    );
    setTimeout(() => {
      this.removeCurrUser()
    }, 1000);
    // this.removeCurrUser();

  }

  // ngAfterViewInit(){
  //   console.log("hello from ngafterviewinit");
  //   // this.removeCurrUser();
  //       setTimeout(() => {
  //     this.removeCurrUser()
  //   }, 100);
  // }

  private fetchUsers(){
    this.http.get('http://localhost:5000/api/home/users').subscribe((response:any)=>{
      this.users=response;
      this.allButCurr=response;
    },
    (error)=>{
      console.error('Error fetching users:',error);
    });
  }

  private removeCurrUser(){
    console.log("curr user removed");
    const currIndex=this.allButCurr.findIndex(curr=>curr._id===this.currUserId);
    if(currIndex!==-1){
      this.allButCurr.splice(currIndex,1);
    }
    console.log(this.allButCurr);
  }

  onOptionSelection(userChat:any){
    // console.log("we will send msg to:"+userChat._id);
    this.receiver=userChat;
    this.updateChatsSent();
    this.updateChatsReceived(userChat._id);
    this.chatHistory();
  }

  updateChatsSent(){
    this.http.get(`http://localhost:5000/api/home/user/chats/sent?userId=${this.currentUser._id}`).subscribe((response:any)=>{
      this.currUserSentChats=response;
      console.log(this.currUserSentChats);
    },
    (error)=>{
      console.error('Error fetching users:',error);
    });
  }

  updateChatsReceived(rec_id:string){
    this.http.get(`http://localhost:5000/api/home/user/chats/sent?userId=${rec_id}`).subscribe((response:any)=>{
      this.currUserReceivedChats=response;
      console.log(this.currUserReceivedChats);
    },
    (error)=>{
      console.error('Error fetching users:',error);
    });
  }

  chatHistory(){
    this.completeChatHistory=[...this.currUserSentChats,...this.currUserReceivedChats];
    // console.log("complete chat"+this.completeChatHistory);
    // for(let i=0;i<this.currUserSentChats.length;i++){
    //   console.log("this array contains"+this.currUserSentChats.messages.[0].text);
    // }
    for(const chat of this.currUserSentChats){
      // this.chatHistory.push(chat);
    }
  }

  sendMessage(){
    console.log("hello sendMessage= "+ this.textMessage);
    // const selectedChatId=this.receiver._id;
    // if(this.textMessage && selectedChatId){

    // }

    const url='http://localhost:5000/api/home/user/chat';
    const dataToSend={
      receiver: this.receiver._id,
      sender: this.currentUser._id,
      text: this.textMessage,
      timestamp: new Date()
    }
    // this.userMessages.push(this.textMessage);
    // console.log(dataToSend.sender);
    this.http.post(url,dataToSend).subscribe((response:any)=>{
      //handle res here if needed
      // this.users=response;
      // this.allButCurr=response;
      console.log(response);
    },
    (error)=>{
      console.error('Error sending message:',error);
    });
    this.textMessage="";
  
    //get all chats on the chat window
    this.http.get(`http://localhost:5000/api/home/user/chats/sent?userId=${this.currentUser._id}`).subscribe((response:any)=>{
      this.currUserSentChats=response;
    },
    (error)=>{
      console.error('Error fetching users:',error);
    });
    setTimeout(() => {
      console.log(this.currUserSentChats);
    }, 1000);
  }

  onDeleteMessage(messageId:string){
    // const urlId ='http://localhost:5000/api/home/user/msg/id';
    // this.http.get(urlId).subscribe((response:any)=>{
    //   this.messageId=response;
    // },
    // (error)=>{
    //   console.error('Error fetching msg id:',error);
    // });
    this.chatDivToDeleteId=messageId;
console.log("deletion initited for id: "+messageId); 
    const url='http://localhost:5000/api/home/user/msg/delete';
    this.http.post(url,{messageId}).subscribe((response:any)=>{
      console.log(response);
      // this.chatDivToDeleteId=null;
    },
    (error)=>{
      console.error('Error deleting message:',error);
    });
  }

  openInputPopup(messageId:string):void{
    const userInput=window.prompt("Enter your text:");
    if(userInput!=null){
      this.onEditMessage(messageId,userInput);
    }
  }

  onEditMessage(messageId:string,userInput:string){
    console.log("edit msg initiated for msg id: "+ messageId);
    const url='http://localhost:5000/api/home/user/msg/edit';
    const obj={
      messageId:messageId,
      userInput:userInput
    }
    this.http.post(url,obj).subscribe((response:any)=>{
      console.log(response);
    },
    (error)=>{
      console.error('Error editing message:',error);
    });

  }

}
