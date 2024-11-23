import { Component } from '@angular/core';
import { ChatService } from '../../../core/services/chat/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseService } from '../../../core/services/firebase/firebase.service';
import { UserService } from '../../../core/services/user/user.service';
import { collectionGroup, getDocs, onSnapshot, query, QuerySnapshot, updateDoc, where } from 'firebase/firestore';

@Component({
  selector: 'app-profile-view-logged-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-view-logged-user.component.html',
  styleUrl: './profile-view-logged-user.component.scss',
})
export class ProfileViewLoggedUserComponent {
  
  inputFinished: boolean = false;
  data = {
    name: this.userService.currentOnlineUser().name,
    email: this.userService.currentOnlineUser().email
  }
  
  constructor(
    public chatService: ChatService,
    public fireBaseService: FirebaseService,
    public userService: UserService
  ) {}

  onDiv1Click(): void {
    this.chatService.profileViewLoggedUser = false;
    this.chatService.customProfile = false;
  }

  onDiv2Click(event: MouseEvent): void {
    event.stopPropagation();
  }

  customProfile(event: MouseEvent) {
    this.chatService.customProfile = true;
    this.onDiv2Click(event);
  }

  async changeAllUserNamesFromCurrentUser(oldName: string, userUID: string, newName: string): Promise<void> {
    const userNameRef = collectionGroup(this.fireBaseService.firestore, 'messages');
    const querySnapshot = await getDocs(query(userNameRef));
  
    querySnapshot.forEach(async (doc) => {
      if(doc.data()['userName'] == oldName && doc.data()['senderId'] == userUID) 
      await updateDoc(doc.ref, { userName: newName });
    });
  }

  async saveNewContactInfos(ngForm: NgForm): Promise<void> {
    this.changeAllUserNamesFromCurrentUser(this.userService.currentOnlineUser().name, this.userService.currentOnlineUser().userUID, ngForm.value.fullname);
    if (ngForm.submitted && ngForm.form.valid) {
      if (this.data.email == this.userService.currentOnlineUser().email) {
        await this.userService.updateUserDoc(this.userService.currentOnlineUser().userUID, this.data);
        this.chatService.profileViewLoggedUser = false;
      } else {
        await this.userService.updateUserEmailandName(this.userService.currentOnlineUser().userUID, this.data);
        this.inputFinished = true;
        setTimeout(() => {
          this.inputFinished = false;
          this.chatService.profileViewLoggedUser = false;
        }, 1300);
      }
    }
  }

  changeName(): void {
    console.log('hooi')
  }
}