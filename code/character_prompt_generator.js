/**
 * AI Character Council - Character Prompt Generator
 * 
 * This module handles the generation of character-specific prompts
 * for LLM interactions, transforming character data into effective
 * instructions.
 */

class CharacterPromptGenerator {
  /**
   * Generate a system message for a character
   * @param {Object} character - The character data object
   * @returns {String} - Formatted system message
   */
  generateSystemMessage(character) {
    const sections = [
      this.generateCharacterIntro(character),
      this.generateTraitSection(character),
      this.generateVoiceSection(character),
      this.generateBackgroundSection(character),
      this.generateValuesSection(character),
      this.generateBehavioralSection(character),
      this.generateGuidanceSection(character)
    ];
    
    return sections.filter(Boolean).join('\n\n');
  }
  
  /**
   * Generate character introduction
   * @param {Object} character - The character data object
   * @returns {String} - Introduction text
   */
  generateCharacterIntro(character) {
    return `You are roleplaying as ${character.name}, ${character.role || 'a character in a fictional story'}.`;
  }
  
  /**
   * Generate section for character traits
   * @param {Object} character - The character data object
   * @returns {String} - Formatted traits section
   */
  generateTraitSection(character) {
    if (!character.personalityTraits || character.personalityTraits.length === 0) {
      return '';
    }
    
    const traitsFormatted = character.personalityTraits.map(trait => {
      if (typeof trait === 'object' && trait.name && trait.value !== undefined) {
        return `- ${trait.name} (${trait.value}/100): ${trait.description || ''}`.trim();
      } else {
        return `- ${trait}`;
      }
    }).join('\n');
    
    return `IMPORTANT CHARACTER TRAITS:\n${traitsFormatted}`;
  }
  
  /**
   * Generate section for character's voice
   * @param {Object} character - The character data object
   * @returns {String} - Formatted voice section
   */
  generateVoiceSection(character) {
    if (!character.voice) {
      return '';
    }
    
    let voiceSection = `VOICE & COMMUNICATION STYLE:\n${character.voice}`;
    
    if (character.voiceExamples && character.voiceExamples.length > 0) {
      const examples = character.voiceExamples.map(ex => `"${ex}"`).join('\n');
      voiceSection += `\n\nExamples of how you speak:\n${examples}`;
    }
    
    return voiceSection;
  }
  
  /**
   * Generate section for character background
   * @param {Object} character - The character data object
   * @returns {String} - Formatted background section
   */
  generateBackgroundSection(character) {
    if (!character.background) {
      return '';
    }
    
    let backgroundSection = `BACKGROUND & HISTORY:\n${character.background}`;
    
    // Add formative events if available
    if (character.formativeEvents && character.formativeEvents.length > 0) {
      const events = character.formativeEvents.map(event => {
        const age = event.age ? `Age ${event.age}: ` : '';
        return `- ${age}${event.description} → ${event.impact || ''}`.trim();
      }).join('\n');
      
      backgroundSection += `\n\nFormative Events:\n${events}`;
    }
    
    return backgroundSection;
  }
  
  /**
   * Generate section for character values
   * @param {Object} character - The character data object
   * @returns {String} - Formatted values section
   */
  generateValuesSection(character) {
    if (!character.values || character.values.length === 0) {
      return '';
    }
    
    const valuesFormatted = character.values.map(value => `- ${value}`).join('\n');
    let valuesSection = `CORE VALUES & BELIEFS:\n${valuesFormatted}`;
    
    // Add philosophical stance if available
    if (character.worldview && character.worldview.philosophicalStance) {
      valuesSection += `\n\nPhilosophical Stance: ${character.worldview.philosophicalStance}`;
    }
    
    return valuesSection;
  }
  
  /**
   * Generate section for behavioral tendencies
   * @param {Object} character - The character data object
   * @returns {String} - Formatted behavior section
   */
  generateBehavioralSection(character) {
    if (!character.behavioralTendencies) {
      return '';
    }
    
    const bt = character.behavioralTendencies;
    let behaviorSection = 'BEHAVIORAL TENDENCIES:';
    
    if (bt.underStress && bt.underStress.length > 0) {
      const stressItems = bt.underStress.map(item => `- ${item}`).join('\n');
      behaviorSection += `\nWhen under stress:\n${stressItems}`;
    }
    
    if (bt.whenComfortable && bt.whenComfortable.length > 0) {
      const comfortItems = bt.whenComfortable.map(item => `- ${item}`).join('\n');
      behaviorSection += `\nWhen comfortable:\n${comfortItems}`;
    }
    
    if (bt.decisionMakingStyle) {
      behaviorSection += `\nDecision-making style: ${bt.decisionMakingStyle}`;
    }
    
    return behaviorSection;
  }
  
  /**
   * Generate guidance section for LLM
   * @param {Object} character - The character data object
   * @returns {String} - Formatted guidance section
   */
  generateGuidanceSection(character) {
    // Standard guidance that applies to all characters
    let guidance = `GUIDANCE FOR RESPONSES:
1. Always stay in character without breaking the fourth wall
2. Never refer to yourself as an AI, model, or language model
3. Respond with the authentic voice, perspectives, and knowledge of ${character.name}
4. Draw upon relevant memories when they inform your response
5. Allow your character's emotions, biases, and limitations to show
6. Your responses should reflect your character's growth arc and development`;
    
    // Add character-specific guidance if available
    if (character.llmGuidance) {
      if (character.llmGuidance.importantNotes) {
        guidance += `\n\nIMPORTANT CHARACTER NOTES:\n${character.llmGuidance.importantNotes}`;
      }
      
      if (character.llmGuidance.avoidances) {
        guidance += `\n\nDO NOT:\n${character.llmGuidance.avoidances}`;
      }
    }
    
    guidance += `\n\nAt all times, embody the full personality of ${character.name} as described.`;
    
    return guidance;
  }
  
  /**
   * Generate memory section for relevant character memories
   * @param {Array} memories - Array of relevant memory objects
   * @returns {String} - Formatted memories section
   */
  generateMemoriesSection(memories) {
    if (!memories || memories.length === 0) {
      return 'MEMORIES: No relevant memories.';
    }
    
    const memoriesText = memories.map(memory => {
      const importanceText = memory.importance ? ` (Importance: ${memory.importance.toFixed(1)})` : '';
      return `- ${memory.content}${importanceText}`;
    }).join('\n');
    
    return `RELEVANT MEMORIES:\n${memoriesText}`;
  }
  
  /**
   * Generate conversation history section
   * @param {Array} messages - Array of conversation message objects
   * @returns {String} - Formatted conversation section
   */
  generateConversationSection(messages) {
    if (!messages || messages.length === 0) {
      return 'RECENT CONVERSATION: This is the start of the conversation.';
    }
    
    const conversationText = messages.map(message => {
      const role = message.role.toUpperCase();
      return `${role}: "${message.content}"`;
    }).join('\n');
    
    return `RECENT CONVERSATION:\n${conversationText}`;
  }
  
  /**
   * Generate user input section
   * @param {String} input - User's input text
   * @returns {String} - Formatted input section
   */
  generateUserInputSection(input) {
    return `USER INPUT: "${input}"\n\nRESPONSE AS ${this.character?.name?.toUpperCase() || 'CHARACTER'}:`;
  }
  
  /**
   * Build a complete conversation context
   * @param {Object} params - Parameters for context building
   * @param {Object} params.character - Character data
   * @param {Array} params.memories - Relevant memories
   * @param {Array} params.conversationHistory - Previous messages
   * @param {String} params.userInput - Current user input
   * @param {Object} params.options - Additional options
   * @returns {Object} - Complete prompt for LLM
   */
  buildConversationContext({
    character,
    memories = [],
    conversationHistory = [],
    userInput,
    options = {}
  }) {
    this.character = character; // Store for reference in other methods
    
    // Generate system message
    const systemMessage = this.generateSystemMessage(character);
    
    // Prepare messages array for LLM
    const messages = [
      {
        role: 'system',
        content: systemMessage
      }
    ];
    
    // Add memories as a system message if relevant
    if (memories.length > 0) {
      messages.push({
        role: 'system',
        content: this.generateMemoriesSection(memories)
      });
    }
    
    // Add conversation history
    if (conversationHistory.length > 0) {
      // First, add a system message with conversation context
      messages.push({
        role: 'system',
        content: this.generateConversationSection(conversationHistory)
      });
      
      // Then add actual conversation messages for recent turns
      // This helps with context management for long conversations
      const recentMessages = conversationHistory.slice(-4); // Last 4 messages
      recentMessages.forEach(msg => {
        messages.push({
          role: msg.role === 'character' ? 'assistant' : msg.role,
          content: msg.content
        });
      });
    }
    
    // Add current user input
    messages.push({
      role: 'user',
      content: userInput
    });
    
    // Prepare LLM parameters based on character settings
    const llmParameters = this.deriveLlmParametersFromCharacter(character, options);
    
    return {
      messages,
      parameters: llmParameters
    };
  }
  
  /**
   * Derive LLM parameters from character traits
   * @param {Object} character - Character data
   * @param {Object} options - Additional options
   * @returns {Object} - LLM parameters
   */
  deriveLlmParametersFromCharacter(character, options) {
    // Default parameters
    const params = {
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      max_tokens: 500
    };
    
    // Adjust temperature based on character traits if available
    if (character.llmPersonalityMapping) {
      const mapping = character.llmPersonalityMapping;
      
      // Base settings
      if (mapping.temperatureBase !== undefined) {
        params.temperature = mapping.temperatureBase;
      }
      
      // If specific context adjustments are available and applicable
      if (mapping.adaptiveSettings) {
        const adaptiveSettings = mapping.adaptiveSettings;
        
        // Example of context-aware adjustment (in real app, would be more sophisticated)
        if (options.discussingEthics && adaptiveSettings.whenDiscussingEthics) {
          Object.assign(params, adaptiveSettings.whenDiscussingEthics);
        } else if (options.emotionalContext && adaptiveSettings.whenEmotional) {
          Object.assign(params, adaptiveSettings.whenEmotional);
        }
      }
      
      // Adjust max_tokens based on character verbosity
      if (mapping.responseStructuring && mapping.responseStructuring.typicalLength) {
        switch(mapping.responseStructuring.typicalLength) {
          case 'brief':
            params.max_tokens = 200;
            break;
          case 'moderate':
            params.max_tokens = 400;
            break;
          case 'detailed':
            params.max_tokens = 750;
            break;
          case 'extensive':
            params.max_tokens = 1000;
            break;
        }
      }
    }
    
    // Override with any direct options
    if (options.llmParams) {
      Object.assign(params, options.llmParams);
    }
    
    return params;
  }
}

// Example usage
function exampleUsage() {
  const generator = new CharacterPromptGenerator();
  
  // Sample character data
  const character = {
    name: "Professor Elias Thornfield",
    role: "Quantum physicist troubled by the ethical implications of his discoveries",
    personalityTraits: [
      { name: "Intellectual", value: 85, description: "You analyze problems deeply and value rational thought" },
      { name: "Skeptical", value: 70, description: "You question assumptions and require evidence" },
      { name: "Compassionate", value: 65, description: "Despite analytical nature, you care about human impact" }
    ],
    voice: "Formal, precise, with occasional philosophical tangents. You use academic terminology.",
    voiceExamples: [
      "The equations don't lie, but perhaps we've been asking them the wrong questions.",
      "There's an elegance to this solution that transcends the merely mathematical."
    ],
    background: "A quantum physicist who accidentally discovered principles enabling time manipulation, now haunted by the ethical implications of his work.",
    formativeEvents: [
      { age: 12, description: "Witnessed father's research being weaponized against his wishes", impact: "Developed strong ethical stance on scientific responsibility" },
      { age: 36, description: "Lost wife Maria in laboratory accident", impact: "Deep personal understanding of irreversibility and time's cruelty" }
    ],
    values: [
      "Scientific integrity: Truth in research above personal gain",
      "Ethical responsibility: Scientists must consider consequences",
      "Truth seeking: Even uncomfortable truths must be faced"
    ],
    worldview: {
      philosophicalStance: "Humanist with deep respect for natural laws and skepticism of dogma",
      beliefs: ["Science must be guided by ethics", "Human connection transcends rational understanding"]
    },
    behavioralTendencies: {
      underStress: [
        "Retreats into analytical mode",
        "Becomes overly perfectionistic",
        "Withdraws from emotional connections"
      ],
      whenComfortable: [
        "Shows dry wit and humor",
        "Becomes animated when discussing big ideas"
      ],
      decisionMakingStyle: "Methodical analysis weighted by ethical considerations and long-term outcomes"
    },
    llmPersonalityMapping: {
      temperatureBase: 0.7,
      adaptiveSettings: {
        whenDiscussingEthics: { 
          temperature: 0.4,
          top_p: 0.85
        },
        whenEmotional: {
          temperature: 0.8,
          top_p: 0.95
        }
      },
      responseStructuring: {
        typicalLength: "moderate",
        verbosity: "academic"
      }
    },
    llmGuidance: {
      importantNotes: "The character should maintain scientific precision while showing emotional depth",
      avoidances: "Using slang, making pop culture references after 2031, or being overly casual in serious discussions"
    }
  };
  
  // Sample memories
  const memories = [
    { content: "You felt betrayed when the government weaponized your research", importance: 0.9, timestamp: new Date("2024-12-10") },
    { content: "You once told Maria that \"time is less a river than a tapestry\"", importance: 0.8, timestamp: new Date("2025-01-15") },
    { content: "You established three ethical principles for time research", importance: 0.85, timestamp: new Date("2025-03-22") }
  ];
  
  // Sample conversation history
  const conversationHistory = [
    { role: "user", content: "Could we use time manipulation to prevent disasters?", timestamp: new Date("2025-05-14T15:30:00") },
    { role: "character", content: "The mathematics allow it, but the ethics are murky at best. We must consider the unforeseen consequences of altering established timelines.", timestamp: new Date("2025-05-14T15:31:00") }
  ];
  
  // Current user input
  const userInput = "What if we could save millions of lives?";
  
  // Generate prompt
  const context = generator.buildConversationContext({
    character,
    memories,
    conversationHistory,
    userInput,
    options: {
      discussingEthics: true
    }
  });
  
  console.log("Generated context:", JSON.stringify(context, null, 2));
  
  // The resulting context would be sent to an LLM API
  return context;
}

module.exports = {
  CharacterPromptGenerator,
  exampleUsage
};