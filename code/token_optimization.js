/**
 * AI Character Council - Token Optimization Strategies
 * 
 * This module provides tools and techniques for optimizing token usage
 * in LLM interactions, reducing costs while maintaining quality.
 */

class TokenOptimizer {
  constructor(options = {}) {
    this.options = {
      defaultModel: 'gpt-4',
      tokenBudget: 8192,
      reservedForResponse: 2000,
      ...options
    };
    
    // Token budgets for different components
    this.budgets = {
      systemMessage: Math.floor(this.options.tokenBudget * 0.15),
      memories: Math.floor(this.options.tokenBudget * 0.2),
      conversation: Math.floor(this.options.tokenBudget * 0.35),
      currentQuery: Math.floor(this.options.tokenBudget * 0.05),
      reserved: this.options.reservedForResponse
    };
    
    // Initialize tokenizer (in a real implementation, this would use a proper tokenizer)
    this.tokenizer = new SimpleTokenizer();
  }
  
  /**
   * Optimize a complete prompt for token efficiency
   * @param {Object} prompt - The complete prompt object
   * @returns {Object} - Optimized prompt
   */
  optimizePrompt(prompt) {
    // Clone prompt to avoid modifying original
    const optimized = JSON.parse(JSON.stringify(prompt));
    
    // Get total token count
    const totalTokens = this.estimateTotalTokens(optimized.messages);
    
    // If under budget, no optimization needed
    const availableBudget = this.options.tokenBudget - this.options.reservedForResponse;
    if (totalTokens <= availableBudget) {
      return optimized;
    }
    
    // Separate messages by role for targeted optimization
    const systemMessages = optimized.messages.filter(m => m.role === 'system');
    const userMessages = optimized.messages.filter(m => m.role === 'user');
    const assistantMessages = optimized.messages.filter(m => m.role === 'assistant');
    
    // Start with most important system message (character definition)
    const primarySystemMessage = systemMessages[0];
    const optimizedMessages = [primarySystemMessage];
    let usedTokens = this.tokenizer.countTokens(primarySystemMessage.content);
    
    // Add current user message (the query being responded to)
    const currentUserMessage = userMessages[userMessages.length - 1];
    optimizedMessages.push(currentUserMessage);
    usedTokens += this.tokenizer.countTokens(currentUserMessage.content);
    
    // Optimize memory system message if present
    const memoryMessage = systemMessages.find(m => m.content.startsWith('RELEVANT MEMORIES:'));
    if (memoryMessage) {
      const optimizedMemories = this.optimizeMemories(
        memoryMessage.content,
        this.budgets.memories
      );
      
      if (optimizedMemories) {
        optimizedMessages.push({ role: 'system', content: optimizedMemories });
        usedTokens += this.tokenizer.countTokens(optimizedMemories);
      }
    }
    
    // Budget remaining for conversation
    const conversationBudget = availableBudget - usedTokens;
    
    // Optimize conversation history
    const conversationMessages = this.optimizeConversationHistory(
      userMessages.slice(0, -1),
      assistantMessages,
      conversationBudget
    );
    
    // Add optimized conversation messages
    optimizedMessages.push(...conversationMessages);
    
    // Reorder messages for proper conversation flow
    const reordered = this.reorderMessages(optimizedMessages);
    
    // Update optimized prompt
    optimized.messages = reordered;
    
    return optimized;
  }
  
  /**
   * Optimize the memories section
   * @param {String} memoriesContent - The memories content
   * @param {Number} budget - Token budget for memories
   * @returns {String} - Optimized memories content
   */
  optimizeMemories(memoriesContent, budget) {
    if (!memoriesContent.startsWith('RELEVANT MEMORIES:')) {
      return memoriesContent;
    }
    
    // Extract individual memories
    const memoryLines = memoriesContent.split('\n').slice(1); // Skip the header
    
    // If already under budget, return as is
    if (this.tokenizer.countTokens(memoriesContent) <= budget) {
      return memoriesContent;
    }
    
    // Parse memory entries with importance values
    const memories = memoryLines.map(line => {
      const importanceMatch = line.match(/\(Importance: ([\d.]+)\)/);
      const importance = importanceMatch ? parseFloat(importanceMatch[1]) : 0.5;
      
      return {
        content: line,
        importance: importance,
        tokens: this.tokenizer.countTokens(line)
      };
    });
    
    // Sort by importance (descending)
    memories.sort((a, b) => b.importance - a.importance);
    
    // Take memories until we hit token budget
    const optimizedMemories = [];
    let usedTokens = this.tokenizer.countTokens('RELEVANT MEMORIES:');
    
    for (const memory of memories) {
      if (usedTokens + memory.tokens <= budget) {
        optimizedMemories.push(memory.content);
        usedTokens += memory.tokens;
      } else {
        // If we can't fit more complete memories, try to use a summary for the rest
        const remainingMemories = memories.filter(m => !optimizedMemories.includes(m.content));
        if (remainingMemories.length > 0) {
          const summary = `- Plus ${remainingMemories.length} more less important memories`;
          const summaryTokens = this.tokenizer.countTokens(summary);
          
          if (usedTokens + summaryTokens <= budget) {
            optimizedMemories.push(summary);
          }
        }
        break;
      }
    }
    
    return `RELEVANT MEMORIES:\n${optimizedMemories.join('\n')}`;
  }
  
  /**
   * Optimize conversation history to fit within token budget
   * @param {Array} userMessages - User message objects
   * @param {Array} assistantMessages - Assistant message objects
   * @param {Number} budget - Token budget for conversation
   * @returns {Array} - Optimized conversation message objects
   */
  optimizeConversationHistory(userMessages, assistantMessages, budget) {
    // If we have no messages, return empty array
    if (userMessages.length === 0 && assistantMessages.length === 0) {
      return [];
    }
    
    // Arrange messages in chronological order by interleaving
    // Assuming assistant messages follow user messages
    const conversationPairs = [];
    const maxPairs = Math.min(userMessages.length, assistantMessages.length);
    
    for (let i = 0; i < maxPairs; i++) {
      conversationPairs.push({
        user: userMessages[userMessages.length - maxPairs + i],
        assistant: assistantMessages[assistantMessages.length - maxPairs + i],
        index: i
      });
    }
    
    // Sort by recency (most recent first)
    conversationPairs.sort((a, b) => b.index - a.index);
    
    // Calculate tokens for each pair
    conversationPairs.forEach(pair => {
      pair.userTokens = this.tokenizer.countTokens(pair.user.content);
      pair.assistantTokens = this.tokenizer.countTokens(pair.assistant.content);
      pair.totalTokens = pair.userTokens + pair.assistantTokens;
    });
    
    // Include messages until we hit the budget
    const optimizedMessages = [];
    let usedTokens = 0;
    
    for (const pair of conversationPairs) {
      if (usedTokens + pair.totalTokens <= budget) {
        optimizedMessages.push(pair.user);
        optimizedMessages.push(pair.assistant);
        usedTokens += pair.totalTokens;
      } else {
        // If we can't fit the whole pair, try to at least include a summary
        break;
      }
    }
    
    // If we have pairs that didn't fit, add a summary
    const excludedPairs = conversationPairs.filter(pair => 
      !optimizedMessages.includes(pair.user) && !optimizedMessages.includes(pair.assistant)
    );
    
    if (excludedPairs.length > 0) {
      const summary = {
        role: 'system',
        content: `Note: ${excludedPairs.length} earlier conversation turns omitted for brevity.`
      };
      
      const summaryTokens = this.tokenizer.countTokens(summary.content);
      
      if (usedTokens + summaryTokens <= budget) {
        optimizedMessages.unshift(summary); // Add at beginning
      }
    }
    
    return optimizedMessages;
  }
  
  /**
   * Estimate total tokens in messages
   * @param {Array} messages - Array of message objects
   * @returns {Number} - Estimated token count
   */
  estimateTotalTokens(messages) {
    let total = 0;
    
    for (const message of messages) {
      total += this.tokenizer.countTokens(message.content);
      // Add overhead for message formatting (approximation)
      total += 4; // ~4 tokens per message object overhead
    }
    
    return total;
  }
  
  /**
   * Reorder messages to ensure proper sequence
   * @param {Array} messages - Array of message objects
   * @returns {Array} - Properly ordered messages
   */
  reorderMessages(messages) {
    // Extract message types
    const systemMessages = messages.filter(m => m.role === 'system');
    const characterSystem = systemMessages.find(m => m.content.includes('You are roleplaying as'));
    const otherSystem = systemMessages.filter(m => m !== characterSystem);
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    // Start with primary character system message
    const ordered = characterSystem ? [characterSystem] : [];
    
    // Add other system messages
    ordered.push(...otherSystem);
    
    // Add conversation messages in proper sequence
    // Sort by assumed timestamp/sequence
    conversationMessages.sort((a, b) => {
      // If it's the final user query, it should go last
      if (a.role === 'user' && !messages.some(m => m.role === 'assistant' && messages.indexOf(m) > messages.indexOf(a))) {
        return 1;
      }
      if (b.role === 'user' && !messages.some(m => m.role === 'assistant' && messages.indexOf(m) > messages.indexOf(b))) {
        return -1;
      }
      return 0;
    });
    
    ordered.push(...conversationMessages);
    
    return ordered;
  }
  
  /**
   * Generate an optimized character system message
   * @param {Object} character - Character data
   * @returns {String} - Optimized system message
   */
  generateOptimizedSystemMessage(character) {
    // Focus on most essential character elements
    const coreTraits = (character.personalityTraits || []).slice(0, 3);
    const coreValues = (character.values || []).slice(0, 3);
    
    // Construct compact system message
    return `You are ${character.name}, ${character.role || ''}. 
TRAITS: ${coreTraits.map(t => typeof t === 'object' ? t.name : t).join(', ')}
VOICE: ${character.voice || ''}
${character.background ? `BACKGROUND: ${character.background.split('.')[0]}.` : ''}
${coreValues.length ? `VALUES: ${coreValues.join(', ')}` : ''}
Always stay in character. Never mention being an AI. Use authentic voice and perspective.`;
  }
  
  /**
   * Compress conversation history by removing redundant information
   * @param {Array} messages - Conversation messages
   * @returns {Array} - Compressed messages
   */
  compressConversationHistory(messages) {
    if (messages.length <= 4) return messages; // Don't compress short conversations
    
    const compressed = [...messages];
    
    // Find and compress repetitive exchanges
    for (let i = 0; i < compressed.length - 4; i++) {
      const current = compressed[i];
      const next = compressed[i + 2];
      
      // If messages are similar, replace with summary
      if (current && next && current.role === next.role && this.isSimilarContent(current.content, next.content)) {
        // Replace repetitive messages with summary
        compressed.splice(i, 4, {
          role: 'system',
          content: `[Several exchanges about ${this.getSummaryTopic(current.content)}]`
        });
        
        // Adjust index since we removed elements
        i--;
      }
    }
    
    return compressed;
  }
  
  /**
   * Check if two content strings are similar
   * @param {String} content1 - First content string
   * @param {String} content2 - Second content string
   * @returns {Boolean} - Whether contents are similar
   */
  isSimilarContent(content1, content2) {
    // Simple similarity check based on common words
    // In a real implementation, would use more sophisticated text similarity
    const words1 = new Set(content1.toLowerCase().split(/\W+/).filter(Boolean));
    const words2 = new Set(content2.toLowerCase().split(/\W+/).filter(Boolean));
    
    // Count common words
    let commonWords = 0;
    for (const word of words1) {
      if (words2.has(word)) commonWords++;
    }
    
    // Calculate Jaccard similarity
    const totalUniqueWords = new Set([...words1, ...words2]).size;
    const similarity = commonWords / totalUniqueWords;
    
    return similarity > 0.5; // Threshold for similarity
  }
  
  /**
   * Get a summary topic from content
   * @param {String} content - Content to summarize
   * @returns {String} - Summary topic
   */
  getSummaryTopic(content) {
    // Extract main topic from content
    // In a real implementation, would use keyword extraction or summarization
    const words = content.toLowerCase().split(/\W+/).filter(Boolean);
    const wordCounts = {};
    
    // Count word frequencies
    for (const word of words) {
      if (word.length < 3) continue; // Skip short words
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
    
    // Get top words
    const topWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(entry => entry[0]);
    
    return topWords.join(' and ') || 'the same topic';
  }
}

/**
 * Simple token counter for demonstration
 * In a real implementation, would use a proper tokenizer (e.g., GPT tokenizer)
 */
class SimpleTokenizer {
  constructor() {
    // For demonstration purposes - real implementation would use actual tokenizer
  }
  
  /**
   * Count tokens in text (simplified approximation)
   * @param {String} text - Text to count tokens in
   * @returns {Number} - Approximate token count
   */
  countTokens(text) {
    if (!text) return 0;
    
    // Rough approximation: 4 characters per token
    // Real tokenizer would be much more accurate
    return Math.ceil(text.length / 4);
  }
}

// Example memory optimization strategies
class MemoryOptimizationStrategies {
  /**
   * Prioritize memories by importance and recency
   * @param {Array} memories - Array of memory objects
   * @param {Number} limit - Maximum number of memories to return
   * @returns {Array} - Prioritized memories
   */
  static prioritizeMemories(memories, limit = 10) {
    if (!memories || memories.length === 0) return [];
    
    // Calculate a combined score based on importance and recency
    const scoredMemories = memories.map(memory => {
      const recencyScore = this.calculateRecencyScore(memory.timestamp);
      const importanceScore = memory.importance || 0.5;
      
      return {
        ...memory,
        score: (recencyScore * 0.4) + (importanceScore * 0.6)
      };
    });
    
    // Sort by score (descending) and return top items
    return scoredMemories
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  /**
   * Calculate recency score based on timestamp
   * @param {Date} timestamp - Memory timestamp
   * @returns {Number} - Recency score (0-1)
   */
  static calculateRecencyScore(timestamp) {
    if (!timestamp) return 0.5;
    
    const now = new Date();
    const memoryDate = new Date(timestamp);
    const ageInDays = (now - memoryDate) / (1000 * 60 * 60 * 24);
    
    // Exponential decay function
    return Math.exp(-0.05 * ageInDays);
  }
  
  /**
   * Group similar memories to save tokens
   * @param {Array} memories - Array of memory objects
   * @returns {Array} - Grouped memories
   */
  static groupSimilarMemories(memories) {
    if (!memories || memories.length <= 3) return memories;
    
    const groups = [];
    const processedIndices = new Set();
    
    // Find similar memories and group them
    for (let i = 0; i < memories.length; i++) {
      if (processedIndices.has(i)) continue;
      
      const memory = memories[i];
      const similarMemories = [memory];
      processedIndices.add(i);
      
      // Find similar memories
      for (let j = i + 1; j < memories.length; j++) {
        if (processedIndices.has(j)) continue;
        
        const otherMemory = memories[j];
        // Simple similarity check - would be more sophisticated in real implementation
        const isSimilar = memory.content.split(' ').some(word => 
          word.length > 4 && otherMemory.content.includes(word)
        );
        
        if (isSimilar) {
          similarMemories.push(otherMemory);
          processedIndices.add(j);
        }
      }
      
      // If we found similar memories, group them
      if (similarMemories.length > 1) {
        // Keep the highest importance memory as is
        const highestImportanceMemory = similarMemories.sort((a, b) => 
          (b.importance || 0) - (a.importance || 0)
        )[0];
        
        // Add a note about similar memories
        highestImportanceMemory.content += ` (plus ${similarMemories.length - 1} similar memories)`;
        groups.push(highestImportanceMemory);
      } else {
        groups.push(memory);
      }
    }
    
    return groups;
  }
}

// Example usage
function demonstrateTokenOptimization() {
  const optimizer = new TokenOptimizer({
    tokenBudget: 8192,
    reservedForResponse: 2000
  });
  
  // Sample prompt with many messages
  const verbosePrompt = {
    messages: [
      {
        role: 'system',
        content: 'You are roleplaying as Professor Elias Thornfield, a quantum physicist troubled by the ethical implications of his discoveries. [... 500 more characters of character description...]'
      },
      {
        role: 'system',
        content: 'RELEVANT MEMORIES:\n- You felt betrayed when the government weaponized your research (Importance: 0.9)\n- You once told Maria that "time is less a river than a tapestry" (Importance: 0.8)\n- You established three ethical principles for time research (Importance: 0.9)\n- You had a heated argument with Director Wells about military applications (Importance: 0.7)\n- You mentored Dr. Sarah Chen for five years before the accident (Importance: 0.6)\n- You received the Quantum Science Award in 2029 (Importance: 0.4)\n- You published your breakthrough paper "Temporal Field Dynamics" (Importance: 0.8)\n- You refused a government contract worth $50 million on ethical grounds (Importance: 0.7)'
      },
      {
        role: 'user',
        content: 'What are your thoughts on time travel paradoxes?'
      },
      {
        role: 'assistant',
        content: 'The mathematical formulations suggest several possible interpretations of paradox scenarios. The most compelling is the self-consistency principle - that is, any action taken by a time traveler in the past must be consistent with the history that led to their time travel in the first place. [... 300 more characters of response...]'
      },
      {
        role: 'user',
        content: 'Could we use time manipulation to prevent disasters?'
      },
      {
        role: 'assistant',
        content: 'The mathematics allow it, but the ethics are murky at best. We must consider the unforeseen consequences of altering established timelines. [... 250 more characters of response...]'
      },
      {
        role: 'user',
        content: 'What if we could save millions of lives?'
      }
    ],
    parameters: {
      temperature: 0.7,
      max_tokens: 500
    }
  };
  
  // Optimize the prompt
  const optimized = optimizer.optimizePrompt(verbosePrompt);
  
  return {
    originalPrompt: verbosePrompt,
    optimizedPrompt: optimized
  };
}

module.exports = {
  TokenOptimizer,
  SimpleTokenizer,
  MemoryOptimizationStrategies,
  demonstrateTokenOptimization
};