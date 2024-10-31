import { Component, HostListener } from '@angular/core';
import { SideNavService } from '../../../../core/services/sideNav/side-nav.service';
import { ChatService } from '../../../../core/services/chat/chat.service';
import { UserService } from '../../../../core/services/user/user.service';
import { Channel } from '../../../../core/models/channel.class';
import { collection, doc, setDoc } from 'firebase/firestore';
import { FirebaseService } from '../../../../core/services/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { ChatUser } from '../../../../core/models/user.class';

@Component({
  selector: 'app-create-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss',
})
export class CreateChannelComponent {
  constructor(
    public sideNavService: SideNavService,
    public chatService: ChatService,
    public userService: UserService,
    public fireBaseService: FirebaseService
  ) {}

  userUIDs: string[] = [];
  channelId: string = '';
  AddSpecificPeople: boolean = false;
  selectMembersFromDevspace: boolean = true;
  selectSpecificMembers: boolean = false;
  inputsAreEmpty: boolean = true;
  channelName: string = '';
  description: string = '';
  notAddedSpecificPeopleToTheChannel: boolean = false;
  addedPeopleToTheChannel: string = '';
  selectedUser: object = [];
  showedAllUsers: boolean = false;
  contactsChoosen: boolean = false;
  arrayOfChoosenContacts: ChatUser[] = [];
  showPlaceholder: boolean = true;
  filteredUsers: ChatUser[] = [];
  numberOfChoosenContacts: number = 0;

  onDiv1Click(): void {
    this.sideNavService.createChannelsDivOpened = false;
  }

  async createChannel() {
    let channelName: HTMLInputElement = document.getElementById(
      'input1'
    ) as HTMLInputElement;
    let description: HTMLInputElement = document.getElementById(
      'input2'
    ) as HTMLInputElement;

    if (this.selectMembersFromDevspace) {
      this.addAllMembersFromDevspace();
    }

    let channel = new Channel(
      this.chatService.contactIndex,
      channelName.value,
      description.value,
      this.userUIDs,
      this.userService.currentOnlineUser.name
    );

    this.channelId = doc(
      collection(this.fireBaseService.firestore, 'channels')
    ).id;

    this.sideNavService.addChannel(channel);

    await setDoc(
      doc(this.fireBaseService.firestore, 'channels', this.channelId),
      {
        name: channelName.value,
        description: description.value,
        createdBy: this.userService.currentOnlineUser.name,
        userIds: this.userUIDs,
      }
    );

    const addPeopleDiv: HTMLElement = document.getElementById(
      'addPeople'
    ) as HTMLElement;
    addPeopleDiv.style.display = 'flex';
    const createChannelDiv: HTMLElement = document.getElementById(
      'createChannel'
    ) as HTMLElement;
    createChannelDiv.style.display = 'none';

    this.onDiv1Click();
  }

  addMembersFromDevspace() {
    this.selectMembersFromDevspace = true;
    this.selectSpecificMembers = false;
    this.AddSpecificPeople = false;
    this.notAddedSpecificPeopleToTheChannel = false;
    this.closeUsersWindow();
  }

  chooseSpecificMembers() {
    this.selectSpecificMembers = true;
    this.selectMembersFromDevspace = false;
    this.AddSpecificPeople = true;
    this.notAddedSpecificPeopleToTheChannel = true;
  }

  addPeople() {
    const section1: HTMLDivElement = document.getElementById(
      'createChannel'
    ) as HTMLDivElement;
    const section2: HTMLDivElement = document.getElementById(
      'addPeople'
    ) as HTMLDivElement;

    section1.style.display = 'none';
    section2.style.display = 'flex';
  }

  checkInputs() {
    if (this.channelName === '') {
      this.inputsAreEmpty = true;
    } else {
      this.inputsAreEmpty = false;
    }
  }

  checkIfPeopleAddedToTheChannel() {
    if (this.addedPeopleToTheChannel == '') {
      this.notAddedSpecificPeopleToTheChannel = true;
    } else {
      this.notAddedSpecificPeopleToTheChannel = false;
    }
  }

  selectUser(index: number) {
    const selectedUser = this.userService.allUsers()[index];
    this.arrayOfChoosenContacts.push(selectedUser);
    this.userUIDs.push(selectedUser.userUID);
    this.contactsChoosen = true;
    this.notAddedSpecificPeopleToTheChannel = false;
    this.showedAllUsers = false;
    const name = document.getElementById('addName');
    this.showPlaceholder = false;
    this.numberOfChoosenContacts++;
  }

  showAllUsers() {
    this.showedAllUsers = true;
    this.filteredUsers = this.userService.allUsers();
  }

  closeUsersWindow(): void {
    this.showedAllUsers = false;
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  addAllMembersFromDevspace() {
    this.userUIDs = [];
    this.userService.allUsers().forEach((user) => {
      this.userUIDs.push(user.userUID);
    });
  }

  removeUserFromList(userID: object, $index: number) {
    const user = document.getElementById('user' + $index);
    user!.style.display = 'none';
  }

  searchUsers() {
    const input = (document.getElementById('addName') as HTMLInputElement).value.toLowerCase(); 
  
    const filteredUsers = this.userService.allUsers().filter((user) =>
      user.name.toLowerCase().includes(input)
    );
  
    this.filteredUsers = filteredUsers;
  }

  closeWindowWithContacts() {
    this.showedAllUsers = false;
  }
}
