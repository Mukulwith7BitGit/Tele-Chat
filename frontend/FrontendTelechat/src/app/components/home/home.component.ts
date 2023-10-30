import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, resolveForwardRef } from '@angular/core';
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

  currentDate:Date;

  ngOnInit():void{
    this.currentDate=new Date();
    
    this.http.get('http://localhost:5000/api/user',{
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
    // setTimeout(() => {
      
    // }, 1000);
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
    // this.http.get('http://localhost:5000/api/home/users').subscribe((response:any)=>{
    //   this.users=response;
    //   this.allButCurr=response;
    //   console.log("the user names are: "+this.users+" okay?");
    // },
    // (error)=>{
    //   console.error('Error fetching users:',error);
    // });

    this.http.get(`http://localhost:5000/api/home/users`+`/`+this.currentUser._id).subscribe((response:any)=>{
      this.allButCurr=response;
      console.log(this.allButCurr);
    },
    (error)=>{
      console.error('Error fetching users:',error);
    });
  }

  // private removeCurrUser(){
  //   console.log("curr user removed");
  //   const currIndex=this.allButCurr.findIndex(curr=>curr._id===this.currUserId);
  //   if(currIndex!==-1){
  //     this.allButCurr.splice(currIndex,1);
  //   }
  //   console.log(this.allButCurr);
  // }

  async onOptionSelection(user:any){
    console.log("we will send msg to:"+user._id);
    this.receiver=user;
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
      this.http.get(`http://localhost:5000/api/home/user/chats/sent/`+this.currentUser._id+`/`+this.receiver._id).subscribe((response:any)=>{
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
      this.http.get(`http://localhost:5000/api/home/user/chats/sent/`+this.receiver._id+`/`+this.currentUser._id).subscribe((response:any)=>{
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


    try{    
      console.log('done1');
      await this.postMessage();
      console.log('done2');
      this.onOptionSelection(this.receiver);
      
    }
    catch(error){
      console.log("sync methods: "+error);
    }
  }

  postMessage():Promise<void>{
    return new Promise((resolve,reject)=>{
      const url='http://localhost:5000/api/home/user/chat';
      const dataToSend={
        receiver: this.receiver._id,
        sender: this.currentUser._id,
        text: this.textMessage,
        timestamp: new Date()
      }
      
      this.http.post(url,dataToSend).subscribe((response:any)=>{
        console.log(response);
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
      const url='http://localhost:5000/api/home/user/msg/delete';
      this.http.post(url,{messageId}).subscribe((response:any)=>{
        console.log(response);
        // this.chatDivToDeleteId=null;
      },
      (error)=>{
        console.error('Error deleting message:',error);
      });
    }
  }

  openInputPopup(messageId:string){
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
