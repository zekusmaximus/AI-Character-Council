/**
 * AI Character Council - Memory Evaluation Algorithm
 * 
 * This module implements the memory prioritization and relevance evaluation
 * algorithms for the character memory system.
 */

class MemoryEvaluator {
  /**
   * Create a new MemoryEvaluator instance
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    // Default weights for memory scoring factors
    this.weights = {
      semanticRelevance: options.weights?.semanticRelevance || 0.5,
      importance: options.weights?.importance || 0.3,
      recency: options.weights?.recency || 0.15,
      accessFrequency: options.weights?.accessFrequency || 0.05
    };
    
    // Ensure weights sum to 1.0
    const totalWeight = Object.values(this.weights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.001) {
      const normalizationFactor = 1.0 / totalWeight;
      for (const key in this.weights) {
        this.weights[key] *= normalizationFactor;
      }
    }
    
    // Default decay rates
    this.decayRates = {
      core: options.decayRates?.core || 0.01,
      episodic: options.decayRates?.episodic || 0.05,
      semantic: options.decayRates?.semantic || 0.03,
      procedural: options.decayRates?.procedural || 0.02,
      emotional: options.decayRates?.emotional || 0.04,
      default: options.decayRates?.default || 0.05
    };
    
    // Maximum age in days considered for recency calculation
    this.maxAgeInDays = options.maxAgeInDays || 365;
    
    // Access frequency normalization factor
    this.maxAccessCount = options.maxAccessCount || 100;
  }
  
  /**
   * Score memories based on multiple factors
   * @param {Array} memories Array of memory objects
   * @param {Object} queryContext Context of the current query
   * @returns {Array} Scored and sorted memories
   */
  evaluateMemories(memories, queryContext) {
    if (!memories || memories.length === 0) {
      return [];
    }
    
    // Score each memory
    const scoredMemories = memories.map(memory => {
      // Make a copy with all original properties
      const scoredMemory = { ...memory };
      
      // Calculate individual factor scores
      const semanticScore = this.calculateSemanticScore(memory, queryContext);
      const importanceScore = this.calculateImportanceScore(memory);
      const recencyScore = this.calculateRecencyScore(memory);
      const accessScore = this.calculateAccessScore(memory);
      
      // Combine into weighted final score
      scoredMemory.score = (
        (this.weights.semanticRelevance * semanticScore) +
        (this.weights.importance * importanceScore) +
        (this.weights.recency * recencyScore) +
        (this.weights.accessFrequency * accessScore)
      );
      
      // Store individual scores for debugging/transparency
      scoredMemory.scoreComponents = {
        semanticScore,
        importanceScore,
        recencyScore,
        accessScore
      };
      
      return scoredMemory;
    });
    
    // Sort by score (descending)
    return scoredMemories.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Calculate semantic relevance score
   * @param {Object} memory Memory object
   * @param {Object} queryContext Query context
   * @returns {Number} Semantic score (0-1)
   */
  calculateSemanticScore(memory, queryContext) {
    // In a real implementation, this would use the cosine similarity
    // between memory embedding and query embedding
    if (memory.semanticSimilarity !== undefined) {
      // If similarity was pre-calculated (e.g., from vector search)
      return memory.semanticSimilarity;
    }
    
    if (!queryContext || !queryContext.embedding) {
      return 0.5; // Default if no embedding provided
    }
    
    // Simulated cosine similarity computation
    // In a real implementation, this would use actual vector comparison
    return Math.random() * 0.5 + 0.5; // Placeholder returning 0.5-1.0
  }
  
  /**
   * Calculate importance score
   * @param {Object} memory Memory object
   * @returns {Number} Importance score (0-1)
   */
  calculateImportanceScore(memory) {
    // Start with base importance
    let importance = memory.importance || 0.5;
    
    // Apply category-specific adjustments
    if (memory.category === 'core') {
      // Core memories always have high importance
      importance = Math.max(importance, 0.9);
    } else if (memory.category === 'emotional') {
      // Emotional memories get a slight boost
      importance = Math.min(importance * 1.2, 1.0);
    }
    
    // Apply emotional amplification if relevant emotions match query
    if (memory.metadata?.emotions && Array.isArray(memory.metadata.emotions)) {
      const hasStrongEmotions = memory.metadata.emotions.some(
        emotion => ['love', 'hate', 'fear', 'grief'].includes(emotion)
      );
      
      if (hasStrongEmotions) {
        importance = Math.min(importance * 1.1, 1.0);
      }
    }
    
    return importance;
  }
  
  /**
   * Calculate recency score using exponential decay
   * @param {Object} memory Memory object
   * @returns {Number} Recency score (0-1)
   */
  calculateRecencyScore(memory) {
    if (!memory.timestamp && !memory.createdAt) {
      return 0.5; // Default if no timestamp
    }
    
    const now = new Date();
    const memoryDate = new Date(memory.timestamp || memory.createdAt);
    
    // Calculate age in days
    const ageInDays = (now - memoryDate) / (1000 * 60 * 60 * 24);
    
    // Cap age at maximum considered
    const cappedAge = Math.min(ageInDays, this.maxAgeInDays);
    
    // Determine decay rate based on memory category
    const decayRate = this.decayRates[memory.category] || this.decayRates.default;
    
    // Apply exponential decay function
    return Math.exp(-decayRate * cappedAge);
  }
  
  /**
   * Calculate access frequency score
   * @param {Object} memory Memory object
   * @returns {Number} Access frequency score (0-1)
   */
  calculateAccessScore(memory) {
    const accessCount = memory.accessCount || 0;
    
    // Normalize access count to 0-1 range using configurable maximum
    return Math.min(accessCount / this.maxAccessCount, 1.0);
  }
  
  /**
   * Apply decay to memories over time
   * @param {Array} memories Array of memory objects
   * @param {Number} daysPassed Number of days to simulate passing
   * @returns {Array} Updated memories with decayed importance
   */
  applyMemoryDecay(memories, daysPassed = 30) {
    return memories.map(memory => {
      // Skip core memories or memories with no decay
      if (memory.category === 'core' || memory.decayRate === 0) {
        return memory;
      }
      
      const decayRate = this.decayRates[memory.category] || this.decayRates.default;
      
      // Copy the memory
      const updatedMemory = { ...memory };
      
      // Apply decay to importance
      const decayFactor = Math.exp(-decayRate * daysPassed);
      updatedMemory.importance = memory.importance * decayFactor;
      
      // Note: importance won't decay below 0.1 for preserved memories
      if (updatedMemory.metadata?.preserve && updatedMemory.importance < 0.1) {
        updatedMemory.importance = 0.1;
      }
      
      return updatedMemory;
    });
  }
  
  /**
   * Select a diverse set of memories based on scores and categories
   * @param {Array} scoredMemories Memories with scores
   * @param {Number} limit Maximum number of memories to select
   * @param {Object} options Selection options
   * @returns {Array} Selected diverse memories
   */
  selectDiverseMemories(scoredMemories, limit = 10, options = {}) {
    if (scoredMemories.length <= limit) {
      return scoredMemories;
    }
    
    const result = [];
    const categoryCount = {};
    
    // Ensure we include at least one core memory if available
    const coreMemories = scoredMemories.filter(m => m.category === 'core');
    if (coreMemories.length > 0) {
      result.push(coreMemories[0]);
      categoryCount['core'] = 1;
    }
    
    // Define desired distribution of memory types
    const targetDistribution = options.distribution || {
      episodic: 0.4,   // 40% episodic memories
      semantic: 0.3,   // 30% semantic memories
      emotional: 0.2,  // 20% emotional memories
      procedural: 0.1  // 10% procedural memories
    };
    
    // Calculate target count for each category
    const remainingSlots = limit - result.length;
    const targetCounts = {};
    
    for (const [category, proportion] of Object.entries(targetDistribution)) {
      targetCounts[category] = Math.round(remainingSlots * proportion);
    }
    
    // First pass: fill categories based on target distribution
    for (const memory of scoredMemories) {
      if (result.includes(memory)) continue;
      
      const category = memory.category;
      if (!categoryCount[category]) categoryCount[category] = 0;
      
      if (categoryCount[category] < (targetCounts[category] || 0)) {
        result.push(memory);
        categoryCount[category]++;
        
        if (result.length >= limit) break;
      }
    }
    
    // Second pass: fill remaining slots with highest scored memories
    if (result.length < limit) {
      const remainingMemories = scoredMemories.filter(m => !result.includes(m));
      
      for (const memory of remainingMemories) {
        result.push(memory);
        
        if (result.length >= limit) break;
      }
    }
    
    return result;
  }
  
  /**
   * Detect conflicting memories and resolve them
   * @param {Array} memories Array of memory objects
   * @returns {Array} Memories with conflict annotations
   */
  detectMemoryConflicts(memories) {
    const conflictGroups = [];
    const processedMemories = [...memories];
    
    // Group potentially conflicting memories (simplified approach)
    // In a real implementation, would use more sophisticated NLP techniques
    for (let i = 0; i < memories.length; i++) {
      const memoryA = memories[i];
      
      for (let j = i + 1; j < memories.length; j++) {
        const memoryB = memories[j];
        
        // Check for potential semantic conflict
        // This is a simplified heuristic - a real impl would use NLP or LLM
        if (this.couldConflict(memoryA, memoryB)) {
          // Find existing conflict group or create new one
          let foundGroup = conflictGroups.find(group => 
            group.includes(memoryA) || group.includes(memoryB)
          );
          
          if (!foundGroup) {
            foundGroup = [memoryA, memoryB];
            conflictGroups.push(foundGroup);
          } else if (!foundGroup.includes(memoryA)) {
            foundGroup.push(memoryA);
          } else if (!foundGroup.includes(memoryB)) {
            foundGroup.push(memoryB);
          }
        }
      }
    }
    
    // Annotate memories with conflict info
    for (const group of conflictGroups) {
      if (group.length < 2) continue;
      
      // Sort by importance and recency
      group.sort((a, b) => {
        const aScore = (a.importance || 0.5) * 0.7 + this.calculateRecencyScore(a) * 0.3;
        const bScore = (b.importance || 0.5) * 0.7 + this.calculateRecencyScore(b) * 0.3;
        return bScore - aScore;
      });
      
      // The first memory is considered the "dominant" version
      const dominantMemory = group[0];
      
      // Annotate all memories in the group
      for (let i = 0; i < group.length; i++) {
        const memory = group[i];
        const memoryIndex = processedMemories.findIndex(m => m.id === memory.id);
        
        if (memoryIndex >= 0) {
          // Add conflict metadata
          processedMemories[memoryIndex] = {
            ...memory,
            metadata: {
              ...memory.metadata,
              conflict: {
                isConflicted: true,
                isDominant: memory.id === dominantMemory.id,
                conflictGroupId: `conflict-${dominantMemory.id}`,
                conflictingMemoryIds: group.filter(m => m.id !== memory.id).map(m => m.id)
              }
            }
          };
        }
      }
    }
    
    return processedMemories;
  }
  
  /**
   * Simple heuristic to determine if two memories might conflict
   * @param {Object} memoryA First memory
   * @param {Object} memoryB Second memory
   * @returns {Boolean} Whether the memories might conflict
   */
  couldConflict(memoryA, memoryB) {
    // In a real implementation, this would use more sophisticated NLP
    // For this example, we'll use a very simplified approach
    
    // Only consider certain memory types for conflicts
    const conflictableTypes = ['semantic', 'episodic'];
    if (!conflictableTypes.includes(memoryA.category) || 
        !conflictableTypes.includes(memoryB.category)) {
      return false;
    }
    
    // Check if memories refer to same entities
    const entitiesA = memoryA.metadata?.entities?.map(e => e.name.toLowerCase()) || [];
    const entitiesB = memoryB.metadata?.entities?.map(e => e.name.toLowerCase()) || [];
    
    const hasCommonEntities = entitiesA.some(entity => entitiesB.includes(entity));
    
    // Check for semantic similarity (would use embeddings in real impl)
    // For this example, we'll check if they share significant words
    const wordsA = new Set(memoryA.content.toLowerCase().split(/\W+/).filter(w => w.length > 5));
    const wordsB = new Set(memoryB.content.toLowerCase().split(/\W+/).filter(w => w.length > 5));
    
    const commonWords = [...wordsA].filter(word => wordsB.has(word));
    const hasSignificantOverlap = commonWords.length >= 3;
    
    // Check for contradictory content (simplified)
    const contradictionPatterns = [
      { positive: 'always', negative: 'never' },
      { positive: 'love', negative: 'hate' },
      { positive: 'believe', negative: "don't believe" },
      { positive: 'support', negative: 'oppose' }
    ];
    
    const contentA = memoryA.content.toLowerCase();
    const contentB = memoryB.content.toLowerCase();
    
    const hasContradiction = contradictionPatterns.some(pattern => 
      (contentA.includes(pattern.positive) && contentB.includes(pattern.negative)) ||
      (contentA.includes(pattern.negative) && contentB.includes(pattern.positive))
    );
    
    // Consider memories potentially conflicting if they share entities
    // and either have significant word overlap or contain contradictory phrases
    return hasCommonEntities && (hasSignificantOverlap || hasContradiction);
  }
}

// Example usage
function demonstrateMemoryEvaluation() {
  // Sample memories
  const memories = [
    {
      id: "mem1",
      content: "I believe scientific progress must always be guided by ethical considerations.",
      category: "core",
      importance: 0.95,
      timestamp: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      metadata: {
        emotions: ["conviction", "responsibility"],
        entities: [{ name: "Science", relation: "field" }]
      }
    },
    {
      id: "mem2",
      content: "When I was 12, I witnessed my father's research being weaponized against his wishes.",
      category: "episodic",
      importance: 0.9,
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      metadata: {
        emotions: ["betrayal", "resolve"],
        entities: [
          { name: "Father", relation: "parent" },
          { name: "Military", relation: "antagonist" }
        ]
      }
    },
    {
      id: "mem3",
      content: "The quantum entanglement principle allows particles to maintain correlation regardless of distance.",
      category: "semantic",
      importance: 0.7,
      timestamp: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
      metadata: {
        entities: [{ name: "Quantum Physics", relation: "field" }]
      },
      accessCount: 12
    },
    {
      id: "mem4",
      content: "I always check quantum stabilizers three times before any experiment.",
      category: "procedural",
      importance: 0.6,
      timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      metadata: {
        entities: [{ name: "Laboratory", relation: "location" }]
      }
    },
    {
      id: "mem5",
      content: "I feel deep anxiety whenever I see the blue glow of a quantum stabilizer.",
      category: "emotional",
      importance: 0.85,
      timestamp: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
      metadata: {
        emotions: ["anxiety", "grief"],
        entities: [
          { name: "Quantum Stabilizer", relation: "trigger" },
          { name: "Laboratory Accident", relation: "event" }
        ]
      }
    },
    {
      id: "mem6",
      content: "Director Wells promised the research would never be used for military applications.",
      category: "episodic",
      importance: 0.75,
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      metadata: {
        emotions: ["trust", "hope"],
        entities: [{ name: "Director Wells", relation: "colleague" }]
      }
    },
    {
      id: "mem7",
      content: "I discovered Director Wells authorized military use of my research without my knowledge.",
      category: "episodic",
      importance: 0.85,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      metadata: {
        emotions: ["betrayal", "anger"],
        entities: [{ name: "Director Wells", relation: "antagonist" }]
      }
    }
  ];
  
  // Create evaluator
  const evaluator = new MemoryEvaluator();
  
  // Evaluate memories for a query about ethics in science
  const ethicsQueryContext = {
    query: "What are your thoughts on the ethical responsibilities of scientists?",
    embedding: [0.1, 0.2, 0.3], // Simulated query embedding
    topics: ["ethics", "science", "responsibility"]
  };
  
  const ethicsResults = evaluator.evaluateMemories(memories, ethicsQueryContext);
  
  // Evaluate memories for a query about Director Wells
  const wellsQueryContext = {
    query: "How do you feel about Director Wells?",
    embedding: [0.4, 0.5, 0.6], // Simulated query embedding
    topics: ["Director Wells", "relationship"]
  };
  
  const wellsResults = evaluator.evaluateMemories(memories, wellsQueryContext);
  
  // Check for conflicting memories
  const conflictResults = evaluator.detectMemoryConflicts(memories);
  
  // Select diverse memories
  const diverseSelection = evaluator.selectDiverseMemories(ethicsResults, 5);
  
  return {
    ethicsQuery: {
      query: ethicsQueryContext.query,
      results: ethicsResults.map(m => ({
        id: m.id,
        content: m.content.substring(0, 50) + (m.content.length > 50 ? '...' : ''),
        score: m.score,
        components: m.scoreComponents
      }))
    },
    wellsQuery: {
      query: wellsQueryContext.query,
      results: wellsResults.map(m => ({
        id: m.id,
        content: m.content.substring(0, 50) + (m.content.length > 50 ? '...' : ''),
        score: m.score,
        components: m.scoreComponents
      }))
    },
    conflicts: conflictResults.filter(m => m.metadata?.conflict?.isConflicted).map(m => ({
      id: m.id,
      content: m.content.substring(0, 50) + (m.content.length > 50 ? '...' : ''),
      isDominant: m.metadata.conflict.isDominant,
      conflictingWith: m.metadata.conflict.conflictingMemoryIds
    })),
    diverseSelection: diverseSelection.map(m => ({
      id: m.id,
      category: m.category,
      content: m.content.substring(0, 50) + (m.content.length > 50 ? '...' : '')
    }))
  };
}

module.exports = {
  MemoryEvaluator,
  demonstrateMemoryEvaluation
};