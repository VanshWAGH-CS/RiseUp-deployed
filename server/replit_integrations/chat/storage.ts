import { db } from "../../db";
import { conversations, messages } from "@shared/schema";
import { eq, desc, lt, sql } from "drizzle-orm";

export interface IChatStorage {
  getConversation(id: number): Promise<typeof conversations.$inferSelect | undefined>;
  getAllConversations(): Promise<(typeof conversations.$inferSelect)[]>;
  createConversation(title: string): Promise<typeof conversations.$inferSelect>;
  deleteConversation(id: number): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<(typeof messages.$inferSelect)[]>;
  createMessage(conversationId: number, role: string, content: string, audio?: string): Promise<typeof messages.$inferSelect>;
  cleanupOldAudio(): Promise<void>;
}

export const chatStorage: IChatStorage = {
  async getConversation(id: number) {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  },

  async getAllConversations() {
    return db.select().from(conversations).orderBy(desc(conversations.createdAt));
  },

  async createConversation(title: string) {
    const [conversation] = await db.insert(conversations).values({ title }).returning();
    return conversation;
  },

  async deleteConversation(id: number) {
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
  },

  async getMessagesByConversation(conversationId: number) {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  },

  async createMessage(conversationId: number, role: string, content: string, audio?: string) {
    const [message] = await db.insert(messages).values({ conversationId, role, content, audio }).returning();
    return message;
  },

  async cleanupOldAudio() {
    // Delete audio data for messages older than 2 days
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    await db.update(messages)
      .set({ audio: null })
      .where(lt(messages.createdAt, twoDaysAgo));

    console.log("Cleaned up audio records older than 2 days");
  },
};

