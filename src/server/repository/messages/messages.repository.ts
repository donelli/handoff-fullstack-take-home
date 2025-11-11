import type { Message as PrismaMessage } from "generated/prisma";
import type { DbClient } from "~/server/db";
import type { Message } from "~/server/models/message";

type AddMessagePayload = {
  text: string;
};

export class MessagesRepository {
  constructor(private readonly db: DbClient) {}

  async getAllMessages(): Promise<Message[]> {
    const messages = await this.db.message.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return messages.map((message) => this.toGraphQLMessage(message));
  }

  async addMessage(payload: AddMessagePayload): Promise<Message> {
    const { text } = payload;

    const newMessage = await this.db.message.create({
      data: {
        text,
      },
    });

    return this.toGraphQLMessage(newMessage);
  }

  private toGraphQLMessage(message: PrismaMessage): Message {
    return {
      ...message,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
