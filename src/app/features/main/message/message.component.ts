import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Message } from '../../../core/models/message.class';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../core/services/chat/chat.service';

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
  userName: string = 'Maria Musterfrau';
  isMe: boolean = false;

  constructor(private chatService: ChatService) {}

  ngOnChanges() {
    this.isMe = this.messageData.userName == this.userName;
  }

  openThread() {
    this.chatService.changeThreadVisibility(true);
    this.chatService.changeThread(this.messageData);
  }
}