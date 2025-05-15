/**
 * AI Character Council - Memory Extraction Service
 * 
 * This module handles extracting meaningful memories from character conversations
 * and interactions, using a combination of LLM-based extraction and rule-based heuristics.
 */

class MemoryExtractionService {
  /**
   * Create a new MemoryExtractionService
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.llmClient = options.llmClient || new LLMClient();
    this.memoryStorage = options.memoryStorage || null;
    this.useLLMExtraction = options.useLLMExtraction !== false;
    this.fallbackToRules = options.fallbackToRules !== false;
    this.emotionalWords = options.emotionalWords || [
      'love', 'hate', 'fear', 'hope', 'dream', 'believe', 'trust',
      'angry', 'sad', 'happy', 'excited', 'worried', 'proud', 'guilty',
      'ashamed', 'jealous', 'content', 'devastated', 'thrilled'
    ];
    this.identityPhrases = options.identityPhrases || [
      'i am', 'i believe', 'i think', 'i feel', 'i know',
      'i always', 'i never', 'i want', 'i need', 'my purpose'
    ];
    this.minImportanceThreshold = options.minImportanceThreshold || 0.4;
    this.defaultImportance = options.defaultImportance || 0.5;
  }
  
  /**
   * Extract memories from a conversation
   * @param {Object} params Extraction parameters
   * @returns {Promise<Array>} Extracted memories
   */
  async extractMemoriesFromConversation(params) {
    const {
      conversation,
      characterId,
      maxMemories = 5,
      minImportance = this.minImportanceThreshold
    } = params;
    
    try {
      let extractedMemories = [];
      
      // Try LLM-based extraction first
      if (this.useLLMExtraction) {
        try {
          extractedMemories = await this.extractMemoriesWithLLM({
            conversation,
            characterId,
            maxMemories
          });
        } catch (error) {
          console.warn('LLM-based memory extraction failed, falling back to rules:', error);
          extractedMemories = [];
        }
      }
      
      // Fall back to rule-based extraction if needed
      if (this.fallbackToRules && extractedMemories.length === 0) {
        extractedMemories = this.extractMemoriesWithRules({
          conversation,
          characterId,
          maxMemories
        });
      }
      
      // Filter out low-importance memories
      const filteredMemories = extractedMemories.filter(
        memory => (memory.importance || this.defaultImportance) >= minImportance
      );
      
      // Store memories if storage service is available
      if (this.memoryStorage && filteredMemories.length > 0) {
        await this.memoryStorage.storeMemories(filteredMemories);
      }
      
      return filteredMemories;
    } catch (error) {
      console.error('Error extracting memories from conversation:', error);
      return [];
    }
  }
  
  /**
   * Extract memories using LLM
   * @param {Object} params Extraction parameters
   * @returns {Promise<Array>} Extracted memories
   * @private
   */
  async extractMemoriesWithLLM(params) {
    const { conversation, characterId, maxMemories } = params;
    
    // Format conversation for LLM prompt
    const formattedConversation = this.formatConversationForLLM(conversation);
    
    // Create prompt for memory extraction
    const prompt = `
    You are an AI specializing in understanding character psychology and memory formation.
    
    Your task is to analyze the following conversation and identify important information 
    that the character should remember. Extract information that:
    1. Represents significant new knowledge
    2. Reveals important personal details or beliefs
    3. Establishes emotional associations or reactions
    4. Creates commitments or promises
    5. Changes relationships or understanding
    
    CONVERSATION:
    ${formattedConversation}
    
    Extract ${maxMemories > 1 ? '1-' + maxMemories : '1'} memories in the following JSON format:
    [
      {
        "content": "The specific thing the character should remember",
        "importance": <float between 0.0 and 1.0 indicating memory importance>,
        "category": <"episodic", "semantic", "procedural", "emotional", or "core">,
        "metadata": {
          "emotions": ["emotion1", "emotion2"],
          "entities": [{"name": "Entity name", "relation": "relationship type"}]
        }
      }
    ]
    
    Notes:
    - Focus on extracting information from the character's perspective
    - Prioritize unique information not already known to the character
    - For importance, consider how foundational this is to the character's identity (higher) vs. incidental details (lower)
    - Include only genuine memories, not assumptions
    
    RESPOND ONLY WITH THE JSON ARRAY AND NO OTHER TEXT.
    `;
    
    try {
      // Call LLM with efficient model
      const response = await this.llmClient.generate({
        prompt,
        model: 'gpt-3.5-turbo',
        temperature: 0.2,
        max_tokens: 800
      });
      
      // Parse response
      let memories;
      try {
        // Clean up response in case there's non-JSON content
        const jsonStr = this.extractJsonFromString(response);
        memories = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Failed to parse LLM response as JSON:', parseError);
        return [];
      }
      
      // Validate and format memories
      return memories.map(memory => ({
        ...memory,
        characterId,
        timestamp: new Date()
      }));
    } catch (error) {
      console.error('Error calling LLM for memory extraction:', error);
      throw error;
    }
  }
  
  /**
   * Extract memories using rule-based heuristics
   * @param {Object} params Extraction parameters
   * @returns {Array} Extracted memories
   * @private
   */
  extractMemoriesWithRules(params) {
    const { conversation, characterId, maxMemories } = params;
    
    const extractedMemories = [];
    const characterMessages = conversation.messages.filter(m => 
      m.role === 'character' || m.role === 'assistant'
    );
    
    // Extract from character's statements
    for (const message of characterMessages) {
      const content = message.content;
      
      // Split into sentences
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        
        // Skip if too short
        if (trimmedSentence.length < 15) continue;
        
        // Calculate initial importance
        let importance = this.defaultImportance;
        let category = 'semantic'; // Default category
        const emotions = [];
        const entities = [];
        
        // Check for identity statements
        const isIdentityStatement = this.identityPhrases.some(phrase => 
          trimmedSentence.toLowerCase().includes(phrase)
        );
        
        if (isIdentityStatement) {
          importance += 0.25;
          category = 'core';
        }
        
        // Check for emotional content
        const emotionalContent = this.emotionalWords.filter(word => 
          trimmedSentence.toLowerCase().includes(word)
        );
        
        if (emotionalContent.length > 0) {
          importance += 0.15;
          category = 'emotional';
          emotions.push(...emotionalContent);
        }
        
        // Check for commitments or promises
        if (trimmedSentence.toLowerCase().includes('i will') || 
            trimmedSentence.toLowerCase().includes('i promise')) {
          importance += 0.2;
          category = 'episodic';
        }
        
        // Extract entities (simplified)
        const entityMatches = trimmedSentence.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) || [];
        const possibleEntities = entityMatches.map(name => ({ name, relation: 'mentioned' }));
        entities.push(...possibleEntities);
        
        // Only add if sufficiently important
        if (importance >= this.minImportanceThreshold) {
          extractedMemories.push({
            characterId,
            content: trimmedSentence,
            importance: Math.min(importance, 1.0),
            category,
            metadata: {
              emotions: [...new Set(emotions)],
              entities,
              source: {
                type: 'conversation',
                messageId: message.id
              }
            },
            timestamp: new Date()
          });
        }
      }
    }
    
    // Process user messages for potential episodic memories
    const userMessages = conversation.messages.filter(m => m.role === 'user');
    for (const message of userMessages) {
      const content = message.content.trim();
      
      // Skip if too short
      if (content.length < 20) continue;
      
      // Check if the message contains a question about the character's past/beliefs
      const isPersonalQuestion = 
        content.includes('you feel') || 
        content.includes('your opinion') || 
        content.includes('you think') || 
        content.includes('your experience') ||
        content.includes('you remember');
      
      if (isPersonalQuestion) {
        // Find the character's response to this question
        const responseIndex = conversation.messages.findIndex(m => m.id === message.id);
        if (responseIndex >= 0 && responseIndex < conversation.messages.length - 1) {
          const response = conversation.messages[responseIndex + 1];
          if (response.role === 'character' || response.role === 'assistant') {
            // Create an episodic memory of this exchange
            extractedMemories.push({
              characterId,
              content: `When asked "${this.truncate(content, 100)}", I responded that ${this.truncate(response.content, 150)}`,
              importance: 0.6,
              category: 'episodic',
              metadata: {
                source: {
                  type: 'conversation',
                  messageId: response.id
                }
              },
              timestamp: new Date()
            });
          }
        }
      }
    }
    
    // Sort by importance and limit
    return extractedMemories
      .sort((a, b) => b.importance - a.importance)
      .slice(0, maxMemories);
  }
  
  /**
   * Format conversation for LLM prompt
   * @param {Object} conversation Conversation object
   * @returns {String} Formatted conversation
   * @private
   */
  formatConversationForLLM(conversation) {
    if (!conversation || !conversation.messages || conversation.messages.length === 0) {
      return 'No conversation provided.';
    }
    
    return conversation.messages.map(message => {
      const role = message.role === 'assistant' ? 'CHARACTER' : message.role.toUpperCase();
      return `${role}: ${message.content}`;
    }).join('\n\n');
  }
  
  /**
   * Extract JSON from a string that might contain non-JSON text
   * @param {String} str String potentially containing JSON
   * @returns {String} Clean JSON string
   * @private
   */
  extractJsonFromString(str) {
    // Find beginning of JSON array
    const startIndex = str.indexOf('[');
    if (startIndex === -1) {
      throw new Error('No JSON array found in response');
    }
    
    // Find matching end bracket
    let openBrackets = 0;
    let endIndex = -1;
    
    for (let i = startIndex; i < str.length; i++) {
      if (str[i] === '[') {
        openBrackets++;
      } else if (str[i] === ']') {
        openBrackets--;
        if (openBrackets === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }
    
    if (endIndex === -1) {
      throw new Error('No matching closing bracket found for JSON array');
    }
    
    return str.substring(startIndex, endIndex);
  }
  
  /**
   * Truncate a string to specified length
   * @param {String} str String to truncate
   * @param {Number} length Maximum length
   * @returns {String} Truncated string
   * @private
   */
  truncate(str, length) {
    if (str.length <= length) return str;
    return str.substring(0, length - 3) + '...';
  }
  
  /**
   * Extract memories from direct author input
   * @param {Object} params Extraction parameters
   * @returns {Promise<Object>} Created memory
   */
  async createAuthorDefinedMemory(params) {
    const {
      characterId,
      content,
      category = 'author-defined',
      importance = 0.8,
      metadata = {}
    } = params;
    
    if (!characterId || !content) {
      throw new Error('Character ID and content are required');
    }
    
    try {
      // Prepare memory object
      const memory = {
        characterId,
        content,
        category,
        importance,
        metadata: {
          ...metadata,
          source: {
            type: 'author-defined',
            timestamp: new Date()
          }
        },
        timestamp: new Date()
      };
      
      // Store memory if storage service is available
      if (this.memoryStorage) {
        return await this.memoryStorage.storeMemory(memory);
      }
      
      return memory;
    } catch (error) {
      console.error('Error creating author-defined memory:', error);
      throw error;
    }
  }
  
  /**
   * Extract memories from a timeline event
   * @param {Object} params Extraction parameters
   * @returns {Promise<Array>} Extracted memories
   */
  async extractMemoriesFromEvent(params) {
    const {
      event,
      characterId,
      perspective = 'participant'
    } = params;
    
    if (!event || !characterId) {
      throw new Error('Event and character ID are required');
    }
    
    try {
      const memories = [];
      
      // Create main event memory
      let content = '';
      let importance = 0.7; // Default importance for events
      
      // Format content based on character's perspective
      if (perspective === 'participant') {
        content = `I was present at ${event.title}${event.location ? ` at ${event.location}` : ''}.${event.description ? ` ${event.description}` : ''}`;
      } else if (perspective === 'observer') {
        content = `I witnessed ${event.title}${event.location ? ` at ${event.location}` : ''}.${event.description ? ` ${event.description}` : ''}`;
      } else if (perspective === 'informed') {
        content = `I learned about ${event.title}${event.location ? ` at ${event.location}` : ''}.${event.description ? ` ${event.description}` : ''}`;
      }
      
      // Adjust importance based on event metadata
      if (event.metadata?.significance === 'pivotal') {
        importance = 0.9;
      } else if (event.metadata?.significance === 'major') {
        importance = 0.8;
      } else if (event.metadata?.significance === 'minor') {
        importance = 0.5;
      }
      
      // Create event memory
      const eventMemory = {
        characterId,
        content,
        category: 'episodic',
        importance,
        metadata: {
          source: {
            type: 'event',
            eventId: event.id
          },
          emotions: event.metadata?.emotions || [],
          entities: this.extractEntitiesFromEvent(event),
          perspective
        },
        timestamp: event.date ? new Date(event.date) : new Date()
      };
      
      memories.push(eventMemory);
      
      // If event has emotional impact, create emotional memory
      if (event.metadata?.emotions && event.metadata.emotions.length > 0) {
        const emotionalContent = this.generateEmotionalContent(event, perspective);
        if (emotionalContent) {
          memories.push({
            characterId,
            content: emotionalContent,
            category: 'emotional',
            importance: Math.min(importance + 0.1, 1.0),
            metadata: {
              source: {
                type: 'event',
                eventId: event.id
              },
              emotions: event.metadata.emotions
            },
            timestamp: event.date ? new Date(event.date) : new Date()
          });
        }
      }
      
      // If event results in new knowledge, create semantic memory
      if (event.metadata?.knowledge) {
        memories.push({
          characterId,
          content: event.metadata.knowledge,
          category: 'semantic',
          importance: 0.7,
          metadata: {
            source: {
              type: 'event',
              eventId: event.id
            }
          },
          timestamp: event.date ? new Date(event.date) : new Date()
        });
      }
      
      // Store memories if storage service is available
      if (this.memoryStorage && memories.length > 0) {
        return await this.memoryStorage.storeMemories(memories);
      }
      
      return memories;
    } catch (error) {
      console.error('Error extracting memories from event:', error);
      throw error;
    }
  }
  
  /**
   * Extract entities from an event
   * @param {Object} event Event object
   * @returns {Array} Extracted entities
   * @private
   */
  extractEntitiesFromEvent(event) {
    const entities = [];
    
    // Add characters involved
    if (event.characters && Array.isArray(event.characters)) {
      event.characters.forEach(character => {
        entities.push({
          name: character.name,
          relation: character.role || 'participant'
        });
      });
    }
    
    // Add location as entity
    if (event.location) {
      entities.push({
        name: event.location,
        relation: 'location'
      });
    }
    
    // Add custom entities from metadata
    if (event.metadata?.entities && Array.isArray(event.metadata.entities)) {
      entities.push(...event.metadata.entities);
    }
    
    return entities;
  }
  
  /**
   * Generate emotional content based on event
   * @param {Object} event Event object
   * @param {String} perspective Character's perspective
   * @returns {String} Emotional content
   * @private
   */
  generateEmotionalContent(event, perspective) {
    if (!event.metadata?.emotions || event.metadata.emotions.length === 0) {
      return null;
    }
    
    const emotions = event.metadata.emotions;
    const primaryEmotion = emotions[0];
    
    // Different templates based on emotion and perspective
    const templates = {
      joy: [
        `I felt ${primaryEmotion} during ${event.title}.`,
        `${event.title} brought me great ${primaryEmotion}.`,
        `I experienced ${primaryEmotion} when ${perspective === 'participant' ? 'participating in' : 'witnessing'} ${event.title}.`
      ],
      sadness: [
        `I felt ${primaryEmotion} during ${event.title}.`,
        `${event.title} filled me with ${primaryEmotion}.`,
        `I experienced deep ${primaryEmotion} when ${perspective === 'participant' ? 'participating in' : 'witnessing'} ${event.title}.`
      ],
      anger: [
        `I felt ${primaryEmotion} during ${event.title}.`,
        `${event.title} provoked ${primaryEmotion} in me.`,
        `I experienced intense ${primaryEmotion} when ${perspective === 'participant' ? 'participating in' : 'witnessing'} ${event.title}.`
      ],
      fear: [
        `I felt ${primaryEmotion} during ${event.title}.`,
        `${event.title} instilled ${primaryEmotion} in me.`,
        `I experienced ${primaryEmotion} when ${perspective === 'participant' ? 'participating in' : 'witnessing'} ${event.title}.`
      ],
      surprise: [
        `I was ${primaryEmotion} during ${event.title}.`,
        `${event.title} completely ${primaryEmotion}d me.`,
        `I experienced ${primaryEmotion} when ${perspective === 'participant' ? 'participating in' : 'witnessing'} ${event.title}.`
      ]
    };
    
    // Map emotion to category
    let category = 'joy';
    const emotionCategories = {
      joy: ['joy', 'happiness', 'excitement', 'delight', 'pleasure', 'contentment'],
      sadness: ['sadness', 'grief', 'sorrow', 'depression', 'melancholy', 'despair'],
      anger: ['anger', 'rage', 'frustration', 'irritation', 'annoyance', 'hatred'],
      fear: ['fear', 'anxiety', 'terror', 'dread', 'horror', 'worry', 'concern'],
      surprise: ['surprise', 'shock', 'amazement', 'astonishment', 'wonder']
    };
    
    for (const [cat, emotions] of Object.entries(emotionCategories)) {
      if (emotions.includes(primaryEmotion.toLowerCase())) {
        category = cat;
        break;
      }
    }
    
    // Get templates for the category or fall back to generic
    const emotionTemplates = templates[category] || [
      `I felt ${primaryEmotion} during ${event.title}.`,
      `${event.title} evoked ${primaryEmotion} in me.`
    ];
    
    // Randomly select a template
    const template = emotionTemplates[Math.floor(Math.random() * emotionTemplates.length)];
    
    // Add reason if available
    if (event.metadata?.emotionReason) {
      return `${template} ${event.metadata.emotionReason}`;
    }
    
    return template;
  }
}

/**
 * Mock LLM client for testing purposes
 */
class LLMClient {
  async generate(params) {
    console.log('Generating with LLM:', params.prompt.substring(0, 50) + '...');
    
    // For testing, return mock JSON response
    return `
    [
      {
        "content": "I believe scientific progress must be guided by ethical considerations",
        "importance": 0.95,
        "category": "core",
        "metadata": {
          "emotions": ["conviction", "resolve"],
          "entities": []
        }
      },
      {
        "content": "When discussing the military applications of quantum technology, I expressed strong concerns about potential misuse",
        "importance": 0.8,
        "category": "episodic",
        "metadata": {
          "emotions": ["concern", "responsibility"],
          "entities": [{"name": "Military", "relation": "subject"}]
        }
      }
    ]
    `;
  }
}

// Example usage
function demonstrateMemoryExtraction() {
  const extractionService = new MemoryExtractionService();
  
  // Sample conversation
  const conversation = {
    id: 'conv123',
    title: 'Ethics in Science',
    messages: [
      {
        id: 'msg1',
        role: 'user',
        content: 'Professor, do you believe there should be limits on scientific research?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
      },
      {
        id: 'msg2',
        role: 'character',
        content: 'Without question. I learned this lesson painfully through my work in quantum mechanics. Science without ethical boundaries is not progress—it's recklessness. My field has incredible power to reshape reality itself, which is precisely why I advocate for robust ethical frameworks that guide our inquiries. The pursuit of knowledge should never supersede our responsibility to humanity and the fabric of existence itself.',
        timestamp: new Date(Date.now() - 1000 * 60 * 4) // 4 minutes ago
      },
      {
        id: 'msg3',
        role: 'user',
        content: 'What specific limits would you propose for cutting-edge physics research?',
        timestamp: new Date(Date.now() - 1000 * 60 * 3) // 3 minutes ago
      },
      {
        id: 'msg4',
        role: 'character',
        content: 'I believe in three fundamental principles that should govern physics research at the quantum level. First, transparency—all methodologies and findings must be subject to rigorous peer review. Second, reversibility—we must maintain the capacity to undo any changes we make to physical systems. And third, consent—research that could affect sentient beings must obtain informed consent. These principles emerged from my experience with the quantum stabilizer accident that... well, that took my wife Maria. I promised myself that day that no discovery would be worth such a cost again.',
        timestamp: new Date(Date.now() - 1000 * 60 * 2) // 2 minutes ago
      }
    ]
  };
  
  // Sample event
  const event = {
    id: 'evt123',
    title: 'Quantum Stabilizer Accident',
    description: 'A catastrophic failure in the quantum stabilizer system caused a laboratory accident.',
    date: '2030-06-15',
    location: 'Cambridge Research Facility',
    metadata: {
      significance: 'pivotal',
      emotions: ['grief', 'guilt'],
      emotionReason: 'It resulted in the loss of my wife Maria and changed my perspective on scientific responsibility forever.',
      entities: [
        { name: 'Maria Thornfield', relation: 'spouse' }
      ]
    },
    characters: [
      { name: 'Professor Elias Thornfield', role: 'primary researcher' },
      { name: 'Maria Thornfield', role: 'assistant researcher' },
      { name: 'Director Wells', role: 'facility director' }
    ]
  };
  
  // Demonstrate memory extraction from conversation
  console.log("=== Memory Extraction Service Demo ===");
  console.log("\n1. Extracting memories from conversation");
  extractionService.extractMemoriesFromConversation({
    conversation,
    characterId: 'char123',
    maxMemories: 3
  }).then(memories => {
    console.log(`Extracted ${memories.length} memories from conversation:`);
    memories.forEach((memory, index) => {
      console.log(`\nMemory ${index + 1}:`);
      console.log(`Content: ${memory.content}`);
      console.log(`Category: ${memory.category}`);
      console.log(`Importance: ${memory.importance}`);
    });
    
    console.log("\n2. Extracting memories from event");
    return extractionService.extractMemoriesFromEvent({
      event,
      characterId: 'char123',
      perspective: 'participant'
    });
  }).then(memories => {
    console.log(`\nExtracted ${memories.length} memories from event:`);
    memories.forEach((memory, index) => {
      console.log(`\nMemory ${index + 1}:`);
      console.log(`Content: ${memory.content}`);
      console.log(`Category: ${memory.category}`);
      console.log(`Importance: ${memory.importance}`);
    });
    
    console.log("\n3. Creating author-defined memory");
    return extractionService.createAuthorDefinedMemory({
      characterId: 'char123',
      content: 'The equations for quantum entanglement revealed themselves to me in a dream, as if the universe itself was guiding my understanding.',
      category: 'core',
      importance: 0.9,
      metadata: {
        emotions: ['awe', 'inspiration'],
        author_notes: 'This memory defines the character\'s almost mystical connection to physics'
      }
    });
  }).then(memory => {
    console.log("\nCreated author-defined memory:");
    console.log(`Content: ${memory.content}`);
    console.log(`Category: ${memory.category}`);
    console.log(`Importance: ${memory.importance}`);
    
    console.log("\nDemo completed successfully");
  }).catch(error => {
    console.error("Error in demo:", error);
  });
  
  return "Memory Extraction Service demo running...";
}

module.exports = {
  MemoryExtractionService,
  LLMClient,
  demonstrateMemoryExtraction
};