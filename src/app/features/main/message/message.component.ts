import { Component, computed, Input, Signal } from '@angular/core';
import { Message } from '../../../core/models/message.class';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../core/services/chat/chat.service';
import { Reaction } from '../../../core/models/reaction.class';
import { UserService } from '../../../core/services/user/user.service';
import { FormsModule } from '@angular/forms';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';
import { ReactionOptionsComponent } from './reaction-options/reaction-options.component';
import { DeletableFileComponent } from '../deletable-file/deletable-file.component';
import { LayoutService } from '../../../core/services/layout/layout.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [EmojiPickerComponent, ReactionOptionsComponent, DeletableFileComponent, CommonModule, FormsModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() messageData: Message = new Message();
  @Input() type: string = 'chat';
  isThreadMessage: boolean = false;
  @Input() isTopMessage: boolean = false;
  menuEmojis: Signal<string[]> = this.chatService.lastEmojis;
  reactionOptions: Signal<string[]> = computed(() => ['1f64c.svg', '1f642.svg', '1f680.svg', '1f913.svg', '2705.svg'].filter(emoji => !this.menuEmojis().includes(emoji)));
  replies: Signal<Message[]> = this.chatService.threadReplies;
  userName: string = this.userService.currentOnlineUser().name;
  isMe: boolean = false;
  isMoreMenuOpen: boolean = false;
  areReactionOptionsOpen: boolean = false;
  areSecondaryReactionOptionsOpen: boolean = false;
  isMessageBeingEdited: boolean = false;
  editMessageText: string = '';
  isEmojiPickerForEditingVisible: Signal<boolean> = this.chatService.openEmojiPickerForEditing;

  constructor(private chatService: ChatService, private userService: UserService, private layoutService: LayoutService) {}

  ngOnInit() {
    this.isThreadMessage = this.type === 'thread';
  }

  ngOnChanges() {
    this.isMe = this.messageData.userName == this.userName;
  }

  updateMessage() {
    if (this.isThreadMessage && !this.isTopMessage) {
      this.chatService.updateThreadReply(this.messageData.id, this.messageData.toJson());
    } else if (this.type === 'chat') {
      this.chatService.updateChatMessage(this.messageData.id, this.messageData.toJson());
    } else if (this.type === 'directMessage') {
      this.chatService.updateDirectMessage(this.messageData.id, this.messageData.toJson());
    }
  }

  openThread() {
    this.layoutService.selectThread();
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
      this.chatService.saveLastEmoji(reaction.emoji);
    }
    this.updateMessage();
  }

  addNewReaction(reactionName: string) {
    const index = this.messageData.reactions.findIndex(reaction => reaction.emoji === reactionName);
    if (index === -1) {
      const reaction = new Reaction(reactionName, [this.userName]);
      this.messageData.reactions.push(reaction);
      this.chatService.saveLastEmoji(reaction.emoji);
      this.updateMessage();
    } else {
      this.toggleReaction(this.messageData.reactions[index]);
    }
    this.areReactionOptionsOpen = false;
  }

  filterReactionUserNames(userNames: string[]) {
    return userNames.filter(el => el !== this.userName);
  }

  toggleMoreMenu() {
    this.isMoreMenuOpen = !this.isMoreMenuOpen;
    this.areReactionOptionsOpen = false;
  }

  closeMoreMenu() {
    this.isMoreMenuOpen = false;
  }

  toggleReactionOptionMenu() {
    this.areReactionOptionsOpen = !this.areReactionOptionsOpen;
    this.areSecondaryReactionOptionsOpen = false;
    this.isMoreMenuOpen = false;
  }

  toggleSecondaryReactionOptionMenu() {
    this.areSecondaryReactionOptionsOpen = !this.areSecondaryReactionOptionsOpen;
    this.areReactionOptionsOpen = false;
    this.isMoreMenuOpen = false;
  }

  editMessage() {
    this.closeMoreMenu();
    this.isMessageBeingEdited = true;
    this.editMessageText = this.messageData.content;
  }

  stopEditingMessage() {
    this.isMessageBeingEdited = false;
  }

  saveEditedMessage() {
    const obj = {
      content: this.editMessageText
    };
    if (this.type === 'chat' || (this.layoutService.layoutState().isChatOpen && this.isTopMessage)) {
      this.chatService.updateChatMessage(this.messageData.id, obj);
    } else if (this.type === 'directMessage' || (this.layoutService.layoutState().isDirectMessageOpen && this.isTopMessage)) {
      this.chatService.updateDirectMessage(this.messageData.id, obj);
    } else if (this.type === 'thread') {
      this.chatService.updateThreadReply(this.messageData.id, obj);
    }
    this.stopEditingMessage();
  }

  toggleEmojiPickerForEditing() {
    this.chatService.toggleEmojiPickerForEditingVisibility();
  }

  insertEmoji(emoji: string) {
    this.editMessageText += emoji;
  }

  isLeftMoreMenu() {
    return this.layoutService.layoutState().isSideNavOpen && this.layoutService.layoutState().isThreadOpen && this.layoutService.isTablet() ||
    this.layoutService.layoutState().isSideNavOpen && this.layoutService.layoutState().isChatOpen && this.layoutService.isTablet() ||
    this.layoutService.layoutState().isSideNavOpen && this.layoutService.layoutState().isThreadOpen && this.layoutService.layoutState().isChatOpen;
  }
}
