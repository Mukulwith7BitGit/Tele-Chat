import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
// const baseUrl = 'http://localhost:5000';
const baseUrl = 'https://tele-chat-77dg.onrender.com';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{

  form: FormGroup;

  constructor(
    private formBuilder:FormBuilder,
    private http:HttpClient,
    private router:Router
  ){}

  ngOnInit():void{
    this.form = this.formBuilder.group({
      contact:"",
      password:""
    })
  }

  ValidateContact = (contact:any)=>{
    var validRegex=/^[0-9]+$/;
    if(contact.match(validRegex)){
      return true;
    }else{
      return false;
    }
  }

  submit(): void{
    let user = this.form.getRawValue(); 

    if(user.contact == "" || user.password == ""){
      Swal.fire("Error","Please enter all the fields!","error");
    }else if(!this.ValidateContact(user.contact)){
      Swal.fire("Error","Please enter only digits from [0-9] in the contact field!","error");
    }else{
      this.http.post(`${baseUrl}/api/login`, user, { withCredentials:true })
      .subscribe((res) => 
      this.router.navigate(['/home'])
      ,(err)=>{
        Swal.fire("Error", err.error.message, "error");
      })
    }
  }

}
