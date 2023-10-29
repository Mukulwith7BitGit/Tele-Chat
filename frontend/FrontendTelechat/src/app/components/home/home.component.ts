import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { combineLatest, map, startWith } from 'rxjs';
import { Emitters } from 'src/app/emitters/emitter';
 
// @ViewChild('users') usersAutocomplete:MatAutocomplete;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{

  message: string="";
  textMessage: string="";


  constructor(private http:HttpClient,  
    // private userService: UsersService
    ){}

  users:any[]=[]; 
  userMessages:any[]=[];
  allButCurr:any[]=[]; 
  currentUser:any={};
  receiver:any={};
  currUserId:number=-1;

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
    console.log(userChat);
    this.receiver=userChat;
  }

  sendMessage(){
    console.log("hello sendMessage= "+ this.textMessage);
    const url='http://localhost:5000/api/home/user/chat';
    const dataToSend={
      sender: this.currentUser._id,
      text: this.textMessage,
      timestamp: new Date()
    }
    this.userMessages.push(this.textMessage);
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
  }

}
