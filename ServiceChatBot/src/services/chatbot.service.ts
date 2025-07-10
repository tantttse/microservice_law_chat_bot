import { ChatRequestDto, ChatResponseDto } from "../common/dtos/chatbot.dto";
import { ConversationRepository } from "../repository/conversation.repository";
import { MessageRepository } from "../repository/messages.repository";
import { GeminiService } from "./gemini.service";
import { plainToClass } from "class-transformer";
import { APIError } from "../common/errors/app-errors";

// In-memory storage for guest conversations (temporary)
interface GuestConversation {
  id: string;
  messages: Array<{
    question: string;
    answer: string;
    timestamp: Date;
  }>;
  createdAt: Date;
}

export class ChatbotService {
  private conversationRepository: ConversationRepository;
  private messageRepository: MessageRepository;
  private geminiService: GeminiService;
  private guestConversations: Map<string, GuestConversation> = new Map();

  constructor() {
    this.conversationRepository = new ConversationRepository();
    this.messageRepository = new MessageRepository();
    this.geminiService = new GeminiService();

    // Clean up guest conversations older than 1 hour periodically
    setInterval(() => this.cleanupGuestConversations(), 60 * 60 * 1000); // 1 hour
  }

  async chat(
    userId: number | null,
    dto: ChatRequestDto,
    guestId?: string
  ): Promise<ChatResponseDto> {
    try {
      // Determine if this is a guest user
      const isGuest = !userId || dto.isGuest;

      if (isGuest) {
        return this.handleGuestChat(dto, guestId);
      } else {
        return this.handleAuthenticatedChat(userId!, dto);
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      console.error("Chatbot Service Error:", error);
      throw new APIError(
        "CHAT_SERVICE_ERROR",
        500,
        "Failed to process chat request"
      );
    }
  }

  private async handleGuestChat(
    dto: ChatRequestDto,
    guestId?: string
  ): Promise<ChatResponseDto> {
    // Generate guest ID if not provided
    const currentGuestId = guestId || this.generateGuestId();

    // Get existing guest conversation history for context
    const existingConversation = this.guestConversations.get(currentGuestId);
    const conversationHistory = existingConversation
      ? existingConversation.messages.map((msg) => ({
          question: msg.question,
          answer: msg.answer,
        }))
      : [];

    // Get AI response with conversation context
    const aiResponse = await this.geminiService.generateTrafficLawResponse(
      dto.message,
      conversationHistory
    );

    // Update guest conversation history
    const existingMessages = existingConversation?.messages || [];
    const newMessage = {
      question: dto.message,
      answer: aiResponse,
      timestamp: new Date(),
    };
    const updatedMessages = [...existingMessages, newMessage];

    const guestConversation: GuestConversation = {
      id: currentGuestId,
      messages: updatedMessages,
      createdAt: existingConversation?.createdAt || new Date(),
    };

    // Store updated guest conversation in memory
    this.guestConversations.set(currentGuestId, guestConversation);

    return plainToClass(
      ChatResponseDto,
      {
        response: aiResponse,
        conversationId: null, // No persistent conversation ID for guests
        messageId: null, // No persistent message ID for guests
        timestamp: new Date(),
        isGuest: true,
      },
      { excludeExtraneousValues: true }
    );
  }

  private async handleAuthenticatedChat(
    userId: number,
    dto: ChatRequestDto
  ): Promise<ChatResponseDto> {
    let conversationId = dto.conversationId;
    let isNewConversation = false;

    // If no conversation ID provided, create a new conversation
    if (!conversationId) {
      const conversation = await this.conversationRepository.create({
        userId,
        title: this.generateConversationTitle(dto.message),
      });
      conversationId = conversation.id;
      isNewConversation = true;
    } else {
      // Verify conversation exists and belongs to user
      const conversation = await this.conversationRepository.findById(
        conversationId
      );
      if (!conversation) {
        throw new APIError(
          "CONVERSATION_NOT_FOUND",
          404,
          "Conversation not found"
        );
      }
      if (conversation.userId !== userId) {
        throw new APIError(
          "UNAUTHORIZED_CONVERSATION",
          403,
          "You do not have access to this conversation"
        );
      }
    }

    // Get conversation history for context (last 10 messages)
    const conversationHistory = await this.getConversationHistory(
      conversationId,
      10
    );

    // Get AI response with conversation context
    const aiResponse = await this.geminiService.generateTrafficLawResponse(
      dto.message,
      conversationHistory
    );

    // Save the message to database
    const message = await this.messageRepository.create({
      conversationId,
      question: dto.message,
      answer: aiResponse,
      createdBy: `user_${userId}`,
    });

    return plainToClass(
      ChatResponseDto,
      {
        response: aiResponse,
        conversationId,
        messageId: message.id,
        timestamp: new Date(),
        isGuest: false,
        isNewConversation,
      },
      { excludeExtraneousValues: true }
    );
  }

  async getGuestChatHistory(guestId: string): Promise<any> {
    const guestConversation = this.guestConversations.get(guestId);

    if (!guestConversation) {
      return {
        data: [],
        meta: {
          total: 0,
          isGuest: true,
        },
      };
    }

    return {
      data: guestConversation.messages.map((msg, index) => ({
        id: `guest_${index}`,
        question: msg.question,
        answer: msg.answer,
        createdAt: msg.timestamp,
      })),
      meta: {
        total: guestConversation.messages.length,
        isGuest: true,
        conversationId: guestId,
      },
    };
  }

  async getChatHistory(
    userId: number,
    conversationId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    try {
      // Verify conversation belongs to user
      const conversation = await this.conversationRepository.findById(
        conversationId
      );
      if (!conversation) {
        throw new APIError(
          "CONVERSATION_NOT_FOUND",
          404,
          "Conversation not found"
        );
      }
      if (conversation.userId !== userId) {
        throw new APIError(
          "UNAUTHORIZED_CONVERSATION",
          403,
          "You do not have access to this conversation"
        );
      }

      // Get messages for the conversation
      const { data: messages, total } = await this.messageRepository.findAll({
        page,
        limit,
        sortBy: "createdAt",
        sortOrder: "asc",
        filters: { conversationId },
      });

      const lastPage = Math.ceil(total / limit);

      return {
        data: messages.map((msg) => ({
          id: msg.id,
          question: msg.question,
          answer: msg.answer,
          createdAt: msg.createdAt,
        })),
        meta: {
          total,
          page,
          lastPage,
          hasNextPage: page < lastPage,
          hasPreviousPage: page > 1,
        },
        conversation: {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        "GET_CHAT_HISTORY_ERROR",
        500,
        "Failed to get chat history"
      );
    }
  }

  async getUserConversations(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    try {
      const { data: conversations, total } =
        await this.conversationRepository.findAll({
          page,
          limit,
          sortBy: "updatedAt",
          sortOrder: "desc",
          filters: { userId },
        });

      const lastPage = Math.ceil(total / limit);

      return {
        data: conversations.map((conv) => ({
          id: conv.id,
          title: conv.title,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        })),
        meta: {
          total,
          page,
          lastPage,
          hasNextPage: page < lastPage,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      throw new APIError(
        "GET_USER_CONVERSATIONS_ERROR",
        500,
        "Failed to get user conversations"
      );
    }
  }

  async chatStream(
    userId: number | null,
    dto: ChatRequestDto,
    guestId: string | undefined,
    onToken: (token: string, isComplete: boolean, metadata?: any) => void
  ): Promise<void> {
    try {
      // Determine if this is a guest user
      const isGuest = !userId || dto.isGuest;

      if (isGuest) {
        await this.handleGuestChatStream(dto, guestId, onToken);
      } else {
        await this.handleAuthenticatedChatStream(userId!, dto, onToken);
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      console.error("Chatbot Service Stream Error:", error);
      throw new APIError(
        "CHAT_STREAM_SERVICE_ERROR",
        500,
        "Failed to process streaming chat request"
      );
    }
  }

  private async handleGuestChatStream(
    dto: ChatRequestDto,
    guestId: string | undefined,
    onToken: (token: string, isComplete: boolean, metadata?: any) => void
  ): Promise<void> {
    // Generate guest ID if not provided
    const currentGuestId = guestId || this.generateGuestId();

    // Get existing guest conversation history for context
    const existingConversation = this.guestConversations.get(currentGuestId);
    const conversationHistory = existingConversation
      ? existingConversation.messages.map((msg) => ({
          question: msg.question,
          answer: msg.answer,
        }))
      : [];

    let fullResponse = "";

    // Get AI response with streaming and conversation context
    await this.geminiService.generateTrafficLawResponseStream(
      dto.message,
      (token: string) => {
        fullResponse += token;
        onToken(token, false);
      },
      conversationHistory
    );

    // Update guest conversation history
    const existingMessages = existingConversation?.messages || [];
    const newMessage = {
      question: dto.message,
      answer: fullResponse.trim(),
      timestamp: new Date(),
    };
    const updatedMessages = [...existingMessages, newMessage];

    const guestConversation: GuestConversation = {
      id: currentGuestId,
      messages: updatedMessages,
      createdAt: existingConversation?.createdAt || new Date(),
    };

    // Store updated guest conversation in memory
    this.guestConversations.set(currentGuestId, guestConversation);

    // Send completion signal
    onToken("", true, {
      conversationId: null,
      messageId: null,
      isGuest: true,
      guestSessionId: currentGuestId,
    });
  }

  private async handleAuthenticatedChatStream(
    userId: number,
    dto: ChatRequestDto,
    onToken: (token: string, isComplete: boolean, metadata?: any) => void
  ): Promise<void> {
    let conversationId = dto.conversationId;
    let isNewConversation = false;

    // If no conversation ID provided, create a new conversation
    if (!conversationId) {
      const conversation = await this.conversationRepository.create({
        userId,
        title: this.generateConversationTitle(dto.message),
      });
      conversationId = conversation.id;
      isNewConversation = true;
    } else {
      // Verify conversation exists and belongs to user
      const conversation = await this.conversationRepository.findById(
        conversationId
      );
      if (!conversation) {
        throw new APIError(
          "CONVERSATION_NOT_FOUND",
          404,
          "Conversation not found"
        );
      }
      if (conversation.userId !== userId) {
        throw new APIError(
          "UNAUTHORIZED_CONVERSATION",
          403,
          "You do not have access to this conversation"
        );
      }
    }

    // Get conversation history for context (last 10 messages)
    const conversationHistory = await this.getConversationHistory(
      conversationId,
      10
    );

    let fullResponse = "";

    // Get AI response with streaming and conversation context
    await this.geminiService.generateTrafficLawResponseStream(
      dto.message,
      (token: string) => {
        fullResponse += token;
        onToken(token, false);
      },
      conversationHistory
    );

    // Save the message to database
    const message = await this.messageRepository.create({
      conversationId,
      question: dto.message,
      answer: fullResponse.trim(),
      createdBy: `user_${userId}`,
    });

    // Send completion signal
    onToken("", true, {
      conversationId,
      messageId: message.id,
      isGuest: false,
      isNewConversation,
    });
  }

  private generateGuestId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupGuestConversations(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    for (const [guestId, conversation] of this.guestConversations.entries()) {
      if (conversation.createdAt < oneHourAgo) {
        this.guestConversations.delete(guestId);
      }
    }
  }

  private generateConversationTitle(message: string): string {
    // Generate a title from the first message (limit to 50 characters)
    const title =
      message.length > 50 ? message.substring(0, 47) + "..." : message;
    return title;
  }

  private async getConversationHistory(
    conversationId: number,
    limit: number = 10
  ): Promise<Array<{ question: string; answer: string }>> {
    try {
      const { data: messages } = await this.messageRepository.findAll({
        page: 1,
        limit,
        sortBy: "createdAt",
        sortOrder: "asc",
        filters: { conversationId },
      });

      return messages.map((msg) => ({
        question: msg.question,
        answer: msg.answer,
      }));
    } catch (error) {
      console.error("Error fetching conversation history:", error);
      return [];
    }
  }
}
