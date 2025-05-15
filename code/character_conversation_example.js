/**
 * AI Character Council - Character Conversation System Example
 * 
 * This file demonstrates the core components of the character conversation system
 * including personality modeling, memory management, and conversation processing.
 */

// Character Engine
class CharacterEngine {
  constructor(characterData) {
    this.character = characterData;
    this.memories = new MemoryManager(characterData.id);
    this.contextBuilder = new ContextBuilder();
    this.llmClient = new LLMClient();
  }
  
  async processUserInput(input, conversationId) {
    // 1. Retrieve conversation history
    const conversation = await ConversationStore.getConversation(conversationId);
    
    // 2. Retrieve relevant memories
    const relevantMemories = await this.memories.retrieveRelevantMemories(input);
    
    // 3. Build context for the LLM
    const context = this.contextBuilder.buildContext({
      character: this.character,
      conversation: conversation,
      memories: relevantMemories,
      input: input
    });
    
    // 4. Generate response from LLM
    const response = await this.llmClient.generateResponse(context);
    
    // 5. Process and extract new memories from interaction
    const newMemories = this.memories.extractMemoriesFromInteraction(input, response);
    await this.memories.storeMemories(newMemories);
    
    // 6. Save the conversation turn
    await ConversationStore.addMessage(conversationId, {
      role: 'user',
      content: input,
      timestamp: new Date()
    });
    
    await ConversationStore.addMessage(conversationId, {
      role: 'character',
      characterId: this.character.id,
      content: response,
      timestamp: new Date()
    });
    
    return response;
  }
}

// Memory Management System
class MemoryManager {
  constructor(characterId) {
    this.characterId = characterId;
    this.vectorDb = new VectorDatabase();
  }
  
  async retrieveRelevantMemories(input, limit = 10) {
    // Embed the input text
    const embedding = await this.vectorDb.embedText(input);
    
    // Search for similar memories
    const memories = await this.vectorDb.search({
      characterId: this.characterId,
      embedding: embedding,
      limit: limit
    });
    
    // Weight memories by importance and recency
    return this.weightMemories(memories);
  }
  
  weightMemories(memories) {
    return memories.map(memory => {
      // Calculate a combined score based on importance and recency
      const recencyScore = this.calculateRecencyScore(memory.timestamp);
      const importanceScore = memory.importance || 0.5;
      memory.score = (recencyScore * 0.6) + (importanceScore * 0.4);
      return memory;
    }).sort((a, b) => b.score - a.score);
  }
  
  calculateRecencyScore(timestamp) {
    const now = new Date();
    const memoryDate = new Date(timestamp);
    const ageInDays = (now - memoryDate) / (1000 * 60 * 60 * 24);
    
    // Exponential decay function
    return Math.exp(-0.1 * ageInDays);
  }
  
  extractMemoriesFromInteraction(input, response) {
    // Use a smaller LLM call to extract important memories from the interaction
    // This is a simplified representation
    const memories = [];
    
    // For example, extract key information from response
    const importantPhrases = this.extractImportantPhrases(response);
    
    importantPhrases.forEach(phrase => {
      memories.push({
        characterId: this.characterId,
        content: phrase,
        importance: this.estimateImportance(phrase),
        timestamp: new Date(),
        type: 'interaction',
        source: {
          type: 'conversation',
          input: input,
          response: response
        }
      });
    });
    
    return memories;
  }
  
  async storeMemories(memories) {
    for (const memory of memories) {
      const embedding = await this.vectorDb.embedText(memory.content);
      memory.embedding = embedding;
      await this.vectorDb.storeMemory(memory);
    }
  }
  
  extractImportantPhrases(text) {
    // Simplified example - in reality would use NLP or a small LLM call
    return text.split('.').filter(s => s.trim().length > 20);
  }
  
  estimateImportance(phrase) {
    // Simplified - would use sentiment analysis or keyword matching
    const emotionalWords = ['love', 'hate', 'fear', 'dream', 'hope', 'remember'];
    const hasEmotionalContent = emotionalWords.some(word => phrase.includes(word));
    
    return hasEmotionalContent ? 0.8 : 0.5;
  }
}

// Context Builder for LLM
class ContextBuilder {
  buildContext({ character, conversation, memories, input }) {
    // Construct a prompt that combines character personality, memories and conversation
    const recentMessages = conversation.messages.slice(-10); // Last 10 messages
    
    const contextParts = [
      this.buildCharacterSection(character),
      this.buildMemoriesSection(memories),
      this.buildConversationSection(recentMessages),
      this.buildUserInputSection(input)
    ];
    
    return contextParts.join('\n\n');
  }
  
  buildCharacterSection(character) {
    return `CHARACTER DEFINITION:
Name: ${character.name}
Personality: ${character.personalityTraits.join(', ')}
Background: ${character.background}
Voice: ${character.voice}
Values: ${character.values.join(', ')}`;
  }
  
  buildMemoriesSection(memories) {
    if (!memories.length) return 'MEMORIES: No relevant memories.';
    
    return `MEMORIES:
${memories.map(m => `- ${m.content} (Importance: ${m.importance.toFixed(1)})`).join('\n')}`;
  }
  
  buildConversationSection(messages) {
    if (!messages.length) return 'CONVERSATION: This is the start of the conversation.';
    
    return `RECENT CONVERSATION:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}`;
  }
  
  buildUserInputSection(input) {
    return `USER INPUT: ${input}

RESPONSE AS CHARACTER:`;
  }
}

// LLM Client Integration
class LLMClient {
  constructor() {
    this.apiKey = SecureStorage.getAPIKey();
    this.endpoint = ConfigManager.getLLMEndpoint();
    this.model = ConfigManager.getPreferredModel();
    this.cache = new ResponseCache();
  }
  
  async generateResponse(context) {
    // Check cache first
    const cachedResponse = this.cache.getResponse(context);
    if (cachedResponse) return cachedResponse;
    
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          prompt: context,
          max_tokens: 500,
          temperature: 0.7 // Adjustable based on character personality
        })
      });
      
      const data = await response.json();
      const generatedText = data.choices[0].text.trim();
      
      // Store in cache
      this.cache.storeResponse(context, generatedText);
      
      return generatedText;
    } catch (error) {
      console.error('Error generating response:', error);
      return 'I apologize, but I am having trouble connecting with my thoughts right now.';
    }
  }
}

// Database store for conversations
class ConversationStore {
  static async getConversation(conversationId) {
    // Database retrieval logic
    return {
      id: conversationId,
      title: 'Example Conversation',
      messages: [
        // Sample messages
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  static async addMessage(conversationId, message) {
    // Database storage logic
    console.log(`Adding message to conversation ${conversationId}:`, message);
    return true;
  }
}

// Vector database for semantic search of memories
class VectorDatabase {
  async embedText(text) {
    // Would call embedding API or local model
    return Array(384).fill(0).map(() => Math.random()); // Dummy embedding
  }
  
  async search({ characterId, embedding, limit }) {
    // Would search vector database
    return [
      {
        id: 'mem1',
        characterId: characterId,
        content: 'I deeply value honesty and integrity above all else.',
        importance: 0.9,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'mem2',
        characterId: characterId,
        content: 'I had a disagreement with the protagonist about the ethical implications of time travel.',
        importance: 0.7,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];
  }
  
  async storeMemory(memory) {
    // Would store in vector database
    console.log('Storing memory:', memory);
    return true;
  }
}

// Response caching to reduce API calls
class ResponseCache {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100;
  }
  
  getResponse(context) {
    const hash = this.hashContext(context);
    return this.cache.get(hash);
  }
  
  storeResponse(context, response) {
    const hash = this.hashContext(context);
    
    // Simple LRU cache implementation
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(hash, response);
  }
  
  hashContext(context) {
    // Simple hash function for the example
    return String(context).slice(0, 100);
  }
}

// Example usage
async function exampleConversation() {
  // Sample character data
  const characterData = {
    id: 'char123',
    name: 'Professor Elias Thornfield',
    personalityTraits: ['intellectual', 'skeptical', 'compassionate', 'detail-oriented'],
    background: 'A quantum physicist who accidentally discovered time travel but is haunted by the ethical implications.',
    voice: 'Formal, precise, with occasional philosophical tangents.',
    values: ['scientific integrity', 'ethical responsibility', 'intellectual curiosity']
  };
  
  // Initialize character engine
  const characterEngine = new CharacterEngine(characterData);
  
  // Example conversation
  const conversationId = 'conv456';
  const userInput = "Professor, I'm struggling with whether to change a past event that caused great suffering. Would you consider it moral to intervene?";
  
  const response = await characterEngine.processUserInput(userInput, conversationId);
  console.log('Professor Elias Thornfield:');
  console.log(response);
}

// In a real implementation, this would be connected to the UI
// exampleConversation().catch(console.error);

module.exports = {
  CharacterEngine,
  MemoryManager,
  ContextBuilder,
  LLMClient
};