import type { MessagesRepository } from "~/server/repository/messages/messages.repository";

type AddMessagePayload = {
  text: string;
};

export class MessagesService {
  constructor(private messagesRepository: MessagesRepository) {}

  getAllMessages() {
    return this.messagesRepository.getAllMessages();
  }

  addMessage(payload: AddMessagePayload) {
    return this.messagesRepository.addMessage(payload);
  }
}
