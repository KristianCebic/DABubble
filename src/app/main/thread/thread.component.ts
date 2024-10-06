import { Component, EventEmitter, Output } from '@angular/core';
import { Message } from '../../models/message.class';
import { MessageComponent } from '../message/message.component';
import { CommonModule } from '@angular/common';
import { ChatService } from '../services/chat.service';
import { Subscription } from 'rxjs';
import { MessageTextareaComponent } from '../message-textarea/message-textarea.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MessageComponent, MessageTextareaComponent, CommonModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {
  
  channelName: string = 'Entwicklerteam';
  
  constructor(private chatService: ChatService) { }

  message!: Message;

  messagesSubscription!: Subscription;

  ngOnInit() {
    this.messagesSubscription = this.chatService.threadMessagesListener().subscribe((message) => {
      this.message = message;
    });
  }

  ngOnDestroy() {
    this.messagesSubscription.unsubscribe();
  }

  closeThread() {
    this.chatService.changeThreadVisibility(false);
  }
}
