import { Component, Input, Signal } from '@angular/core';
import { Message } from '../../../core/models/message.class';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../core/services/chat/chat.service';
import { Reaction } from '../../../core/models/reaction.class';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() messageData: Message = new Message();
  @Input() isThreadMessage: boolean = false;
  menuEmojis: Signal<string[]> = this.chatService.lastEmojis; 
  userName: string = 'Maria Musterfrau';
  isMe: boolean = false;
  isMoreMenuOpen: boolean = false;

  constructor(private chatService: ChatService) {}

  ngOnChanges() {
    this.isMe = this.messageData.userName == this.userName;
  }

  openThread() {
    this.chatService.changeThreadVisibility(true);
    this.chatService.changeThread(this.messageData);
  }

  didIReact(reaction: Reaction) {
    return reaction.userNames.find(userName => userName === this.userName) !== undefined;
  }

  removeReaction(reaction: Reaction) {
    const i = reaction.userNames.findIndex(el => el === this.userName);
    if (i !== -1) {
      reaction.userNames.splice(i, 1);
      if (reaction.userNames.length === 0) {
        const index = this.messageData.reactions.findIndex(r => r == reaction);
        this.messageData.reactions.splice(index, 1);
      }
    }
  }

  toggleReaction(reaction: Reaction) {
    if (reaction.userNames.includes(this.userName)) {
      this.removeReaction(reaction);
    } else {
      reaction.userNames.push(this.userName);
    }
  }

  addNewReaction(reactionName: string) {
    const index = this.messageData.reactions.findIndex(reaction => reaction.emoji === reactionName);
    if (index === -1) {
      this.messageData.reactions.push(new Reaction(reactionName, [this.userName]));
    } else {
      this.toggleReaction(this.messageData.reactions[index]);
    }
  }

  filterReactionUserNames(userNames: string[]) {
    return userNames.filter(el => el !== this.userName);
  }

  toggleMoreMenu() {
    this.isMoreMenuOpen = !this.isMoreMenuOpen;
  }
}
