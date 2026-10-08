/**
 * Conversation Manager - Handles conversation persistence and management
 * Integrates with DatabaseManager for storage
 */

const { v4: uuidv4 } = require('uuid');

class ConversationManager {
  constructor(databaseManager) {
    this.db = databaseManager;
  }

  /**
   * Create a new conversation
   */
  createConversation(title, providerId, model, metadata = {}) {
    const id = uuidv4();
    return this.db.createConversation(id, title, providerId, model, metadata);
  }

  /**
   * Get a conversation by ID
   */
  getConversation(id) {
    return this.db.getConversation(id);
  }

  /**
   * Get all conversations
   */
  getAllConversations() {
    return this.db.getAllConversations();
  }

  /**
   * Update conversation title
   */
  updateTitle(id, title) {
    this.db.updateConversation(id, { title });
  }

  /**
   * Update conversation metadata
   */
  updateMetadata(id, metadata) {
    const conversation = this.db.getConversation(id);
    if (conversation) {
      const updatedMetadata = { ...conversation.metadata, ...metadata };
      this.db.updateConversation(id, { metadata: updatedMetadata });
    }
  }

  /**
   * Delete a conversation and all its messages
   */
  deleteConversation(id) {
    this.db.deleteMessages(id);
    this.db.deleteConversation(id);
  }

  /**
   * Add a message to a conversation
   */
  addMessage(conversationId, role, content, metadata = {}) {
    const id = uuidv4();
    return this.db.addMessage(id, conversationId, role, content, metadata);
  }

  /**
   * Get all messages for a conversation
   */
  getMessages(conversationId) {
    return this.db.getMessages(conversationId);
  }

  /**
   * Get conversation with messages
   */
  getConversationWithMessages(id) {
    const conversation = this.db.getConversation(id);
    if (!conversation) return null;

    const messages = this.db.getMessages(id);
    return {
      ...conversation,
      messages
    };
  }

  /**
   * Search conversations by title or content
   */
  searchConversations(query) {
    const conversations = this.getAllConversations();
    const lowerQuery = query.toLowerCase();

    return conversations.filter(conv => {
      // Search in title
      if (conv.title && conv.title.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in messages
      const messages = this.getMessages(conv.id);
      return messages.some(msg => 
        msg.content && msg.content.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Get recent conversations
   */
  getRecentConversations(limit = 10) {
    const conversations = this.getAllConversations();
    return conversations.slice(0, limit);
  }

  /**
   * Get conversations by provider
   */
  getConversationsByProvider(providerId) {
    const conversations = this.getAllConversations();
    return conversations.filter(conv => conv.providerId === providerId);
  }

  /**
   * Get conversation statistics
   */
  getStats() {
    const conversations = this.getAllConversations();
    let totalMessages = 0;

    for (const conv of conversations) {
      const messages = this.getMessages(conv.id);
      totalMessages += messages.length;
    }

    return {
      totalConversations: conversations.length,
      totalMessages,
      averageMessagesPerConversation: conversations.length > 0 
        ? Math.round(totalMessages / conversations.length) 
        : 0
    };
  }

  /**
   * Export conversation to JSON
   */
  exportConversation(id) {
    const conversation = this.getConversationWithMessages(id);
    if (!conversation) return null;

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      conversation
    };
  }

  /**
   * Import conversation from JSON
   */
  importConversation(data) {
    try {
      const { conversation } = data;
      
      // Create new conversation with new ID
      const newId = uuidv4();
      this.db.createConversation(
        newId,
        conversation.title,
        conversation.providerId,
        conversation.model,
        conversation.metadata
      );

      // Import messages
      for (const message of conversation.messages) {
        this.db.addMessage(
          uuidv4(),
          newId,
          message.role,
          message.content,
          message.metadata
        );
      }

      return newId;
    } catch (error) {
      console.error('Failed to import conversation:', error);
      return null;
    }
  }

  /**
   * Duplicate a conversation
   */
  duplicateConversation(id) {
    const conversation = this.getConversationWithMessages(id);
    if (!conversation) return null;

    // Create new conversation
    const newId = uuidv4();
    this.db.createConversation(
      newId,
      `${conversation.title} (Copy)`,
      conversation.providerId,
      conversation.model,
      conversation.metadata
    );

    // Copy messages
    for (const message of conversation.messages) {
      this.db.addMessage(
        uuidv4(),
        newId,
        message.role,
        message.content,
        message.metadata
      );
    }

    return newId;
  }

  /**
   * Clear all conversations
   */
  clearAll() {
    const conversations = this.getAllConversations();
    for (const conv of conversations) {
      this.deleteConversation(conv.id);
    }
  }

  /**
   * Get conversation summary (for UI display)
   */
  getConversationSummary(id) {
    const conversation = this.getConversation(id);
    if (!conversation) return null;

    const messages = this.getMessages(id);
    const firstUserMessage = messages.find(m => m.role === 'user');
    const lastMessage = messages[messages.length - 1];

    return {
      id: conversation.id,
      title: conversation.title,
      providerId: conversation.providerId,
      model: conversation.model,
      messageCount: messages.length,
      preview: firstUserMessage ? firstUserMessage.content.substring(0, 100) : '',
      lastMessageAt: lastMessage ? lastMessage.timestamp : conversation.updatedAt,
      createdAt: conversation.createdAt
    };
  }

  /**
   * Get all conversation summaries
   */
  getAllConversationSummaries() {
    const conversations = this.getAllConversations();
    return conversations.map(conv => this.getConversationSummary(conv.id));
  }
}

module.exports = { ConversationManager };
