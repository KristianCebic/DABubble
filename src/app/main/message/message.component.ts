import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Message } from '../../models/message.class';
import { CommonModule } from '@angular/common';
import { ChatService } from '../services/chat.service';

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
  postedAtAsTimeString: string = '';
  lastReplyAtAsTimeString: string = '';
  isMe: boolean = false;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.isMe = this.messageData.userName == this.userName;
    this.postedAtAsTimeString = new Date(+this.messageData.lastReplyAt).toLocaleTimeString().slice(0, -3);
    this.lastReplyAtAsTimeString = new Date(+this.messageData.lastReplyAt).toLocaleTimeString().slice(0, -3);
  }

  openThread() {
    this.chatService.changeThreadVisibility(true);
  }
}
