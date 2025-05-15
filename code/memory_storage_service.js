/**
 * AI Character Council - Memory Storage Service
 * 
 * This module implements the vector-based memory storage system for character memories,
 * providing methods for storing, retrieving, and managing memory data.
 */

// Dependencies would typically include:
// - A vector database library (e.g., FAISS, HNSWLib)
// - A database ORM (e.g., Prisma)
// - An embedding model (e.g., sentence-transformers)

/**
 * Service for storing and retrieving character memories
 */
class MemoryStorageService {
  /**
   * Create a new MemoryStorageService
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    // Initialize vector database
    this.vectorDb = options.vectorDb || new VectorDatabase({
      dimensions: options.dimensions || 384,
      metric: options.metric || 'cosine',
      maxElements: options.maxElements || 100000
    });
    
    // Initialize embedding service
    this.embeddingService = options.embeddingService || new EmbeddingService({
      modelName: options.embeddingModel || 'all-MiniLM-L6-v2'
    });
    
    // Initialize database connection
    this.db = options.db || DatabaseService.getConnection();
    
    // Memory categorizer
    this.categorizer = options.categorizer || new MemoryCategorizer();
    
    // Memory evaluator for scoring
    this.evaluator = options.evaluator || new MemoryEvaluator();
    
    // Cache for frequent queries
    this.cache = new MemoryCache(options.cacheSize || 1000);
  }
  
  /**
   * Store a new memory for a character
   * @param {Object} memory Memory data
   * @returns {Promise<Object>} Stored memory
   */
  async storeMemory(memory) {
    try {
      // Validate required fields
      if (!memory.characterId || !memory.content) {
        throw new Error('Memory must have characterId and content');
      }
      
      // Generate embedding if not provided
      if (!memory.embedding) {
        memory.embedding = await this.embeddingService.embedText(memory.content);
      }
      
      // Categorize memory if category not provided
      if (!memory.category) {
        memory.category = this.categorizer.categorizeMemory(memory);
      }
      
      // Assign importance if not provided
      if (memory.importance === undefined) {
        memory.importance = this.categorizer.estimateImportance(memory);
      }
      
      // Ensure metadata structure
      memory.metadata = memory.metadata || {};
      
      // Add timestamp if not provided
      if (!memory.timestamp) {
        memory.timestamp = new Date();
      }
      
      // Prepare memory for database
      const memoryRecord = {
        id: memory.id || generateUUID(),
        characterId: memory.characterId,
        content: memory.content,
        importance: memory.importance,
        category: memory.category,
        subcategory: memory.subcategory || 'general',
        metadata: memory.metadata,
        embedding: Buffer.from(new Float32Array(memory.embedding).buffer),
        timestamp: memory.timestamp,
        accessCount: 0,
        decayRate: memory.decayRate || getDefaultDecayRate(memory.category)
      };
      
      // Store in database
      const storedMemory = await this.db.characterMemory.create({
        data: memoryRecord
      });
      
      // Add to vector index
      await this.vectorDb.addItem(memoryRecord.id, memory.embedding, {
        characterId: memory.characterId,
        category: memory.category
      });
      
      // Clear any related cache entries
      this.cache.invalidateForCharacter(memory.characterId);
      
      return storedMemory;
    } catch (error) {
      console.error('Error storing memory:', error);
      throw error;
    }
  }
  
  /**
   * Store multiple memories in batch
   * @param {Array} memories Array of memory objects
   * @returns {Promise<Array>} Stored memories
   */
  async storeMemories(memories) {
    // Process in batches to avoid overwhelming the system
    const results = [];
    const batchSize = 10;
    
    for (let i = 0; i < memories.length; i += batchSize) {
      const batch = memories.slice(i, i + batchSize);
      const batchPromises = batch.map(memory => this.storeMemory(memory));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
  
  /**
   * Retrieve memories by semantic search
   * @param {Object} params Search parameters
   * @returns {Promise<Array>} Retrieved memories
   */
  async searchMemories(params) {
    try {
      const {
        characterId,
        query,
        filter = {},
        limit = 10,
        offset = 0,
        minScore = 0.65
      } = params;
      
      if (!characterId) {
        throw new Error('Character ID is required');
      }
      
      // Check cache first
      const cacheKey = this.generateCacheKey(params);
      const cachedResults = this.cache.get(cacheKey);
      if (cachedResults) {
        return cachedResults;
      }
      
      // Generate query embedding
      let queryEmbedding;
      if (query) {
        queryEmbedding = await this.embeddingService.embedText(query);
      } else if (params.embedding) {
        queryEmbedding = params.embedding;
      } else {
        throw new Error('Query text or embedding is required');
      }
      
      // Prepare filter for vector search
      const vectorFilter = {
        characterId,
        ...filter
      };
      
      // Search vector database
      const vectorResults = await this.vectorDb.searchByVector(
        queryEmbedding,
        limit * 3, // Get more than needed for post-filtering
        vectorFilter
      );
      
      if (!vectorResults.length) {
        return [];
      }
      
      // Get memory IDs from vector results
      const memoryIds = vectorResults.map(result => result.id);
      
      // Fetch full memory objects from database
      const memories = await this.db.characterMemory.findMany({
        where: {
          id: { in: memoryIds },
          characterId: characterId,
          ...this.buildDatabaseFilter(filter)
        }
      });
      
      // Add similarity scores from vector search
      const memoriesWithSimilarity = memories.map(memory => {
        const vectorResult = vectorResults.find(vr => vr.id === memory.id);
        return {
          ...memory,
          semanticSimilarity: vectorResult ? vectorResult.score : 0
        };
      });
      
      // Evaluate and score memories
      const queryContext = {
        query,
        embedding: queryEmbedding,
        filter
      };
      
      const scoredMemories = this.evaluator.evaluateMemories(memoriesWithSimilarity, queryContext);
      
      // Filter by minimum score
      const filteredMemories = scoredMemories.filter(memory => memory.score >= minScore);
      
      // Apply pagination
      const paginatedMemories = filteredMemories.slice(offset, offset + limit);
      
      // Update access count for retrieved memories
      this.updateAccessCounts(paginatedMemories.map(m => m.id));
      
      // Store in cache
      this.cache.set(cacheKey, paginatedMemories);
      
      return paginatedMemories;
    } catch (error) {
      console.error('Error searching memories:', error);
      throw error;
    }
  }
  
  /**
   * Retrieve diverse memories for conversation context
   * @param {Object} params Search parameters
   * @returns {Promise<Array>} Diverse memory selection
   */
  async getConversationMemories(params) {
    try {
      const {
        characterId,
        query,
        limit = 10,
        distribution
      } = params;
      
      // First get scored memories
      const scoredMemories = await this.searchMemories({
        characterId,
        query,
        limit: limit * 3, // Get more than needed for diversity selection
        filter: params.filter || {}
      });
      
      if (!scoredMemories.length) {
        return [];
      }
      
      // Select diverse memories
      const diverseMemories = this.evaluator.selectDiverseMemories(
        scoredMemories, 
        limit,
        { distribution }
      );
      
      // Check for conflicts
      return this.evaluator.detectMemoryConflicts(diverseMemories);
    } catch (error) {
      console.error('Error getting conversation memories:', error);
      throw error;
    }
  }
  
  /**
   * Get memory by ID
   * @param {string} id Memory ID
   * @returns {Promise<Object>} Memory object
   */
  async getMemoryById(id) {
    try {
      const memory = await this.db.characterMemory.findUnique({
        where: { id }
      });
      
      if (memory) {
        // Increment access count
        this.updateAccessCounts([id]);
      }
      
      return memory;
    } catch (error) {
      console.error('Error getting memory by ID:', error);
      throw error;
    }
  }
  
  /**
   * Update memory
   * @param {string} id Memory ID
   * @param {Object} updates Memory updates
   * @returns {Promise<Object>} Updated memory
   */
  async updateMemory(id, updates) {
    try {
      // Get existing memory
      const existingMemory = await this.db.characterMemory.findUnique({
        where: { id }
      });
      
      if (!existingMemory) {
        throw new Error(`Memory with ID ${id} not found`);
      }
      
      // Check if content changed, requiring new embedding
      let newEmbedding = undefined;
      if (updates.content && updates.content !== existingMemory.content) {
        newEmbedding = await this.embeddingService.embedText(updates.content);
        
        // Update vector database
        await this.vectorDb.updateItem(id, newEmbedding);
      }
      
      // Prepare update data
      const updateData = {
        ...updates
      };
      
      if (newEmbedding) {
        updateData.embedding = Buffer.from(new Float32Array(newEmbedding).buffer);
      }
      
      // Update in database
      const updatedMemory = await this.db.characterMemory.update({
        where: { id },
        data: updateData
      });
      
      // Clear cache
      this.cache.invalidateForCharacter(existingMemory.characterId);
      
      return updatedMemory;
    } catch (error) {
      console.error('Error updating memory:', error);
      throw error;
    }
  }
  
  /**
   * Delete memory
   * @param {string} id Memory ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteMemory(id) {
    try {
      // Get memory to determine character ID for cache invalidation
      const memory = await this.db.characterMemory.findUnique({
        where: { id },
        select: { characterId: true }
      });
      
      if (!memory) {
        return false;
      }
      
      // Remove from vector database
      await this.vectorDb.removeItem(id);
      
      // Delete from database
      await this.db.characterMemory.delete({
        where: { id }
      });
      
      // Clear cache
      this.cache.invalidateForCharacter(memory.characterId);
      
      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  }
  
  /**
   * Update access counts for memories
   * @param {Array} ids Memory IDs
   * @private
   */
  async updateAccessCounts(ids) {
    if (!ids.length) return;
    
    try {
      // Batch update access counts
      await this.db.$transaction(
        ids.map(id => this.db.characterMemory.update({
          where: { id },
          data: {
            accessCount: { increment: 1 },
            lastAccessed: new Date()
          }
        }))
      );
    } catch (error) {
      // Non-critical operation, just log error
      console.error('Error updating access counts:', error);
    }
  }
  
  /**
   * Build database filter from query filter
   * @param {Object} filter Query filter
   * @returns {Object} Database filter
   * @private
   */
  buildDatabaseFilter(filter) {
    const dbFilter = {};
    
    if (filter.categories) {
      dbFilter.category = { in: Array.isArray(filter.categories) ? filter.categories : [filter.categories] };
    }
    
    if (filter.subcategories) {
      dbFilter.subcategory = { in: Array.isArray(filter.subcategories) ? filter.subcategories : [filter.subcategories] };
    }
    
    if (filter.minImportance !== undefined) {
      dbFilter.importance = { gte: filter.minImportance };
    }
    
    if (filter.afterDate) {
      dbFilter.timestamp = { gte: new Date(filter.afterDate) };
    }
    
    if (filter.beforeDate) {
      dbFilter.timestamp = { 
        ...dbFilter.timestamp,
        lte: new Date(filter.beforeDate) 
      };
    }
    
    return dbFilter;
  }
  
  /**
   * Generate cache key from search parameters
   * @param {Object} params Search parameters
   * @returns {string} Cache key
   * @private
   */
  generateCacheKey(params) {
    const { characterId, query, filter = {}, limit, offset } = params;
    return `search:${characterId}:${query}:${JSON.stringify(filter)}:${limit}:${offset}`;
  }
  
  /**
   * Apply memory decay to a character's memories
   * @param {string} characterId Character ID
   * @param {number} daysPassed Days to simulate passing
   * @returns {Promise<number>} Number of updated memories
   */
  async applyMemoryDecay(characterId, daysPassed = 30) {
    try {
      // Get memories that are eligible for decay
      const memories = await this.db.characterMemory.findMany({
        where: {
          characterId,
          category: { not: 'core' } // Core memories don't decay
        }
      });
      
      if (!memories.length) {
        return 0;
      }
      
      // Apply decay
      const decayedMemories = this.evaluator.applyMemoryDecay(memories, daysPassed);
      
      // Update in database
      const updatePromises = decayedMemories.map(memory => 
        this.db.characterMemory.update({
          where: { id: memory.id },
          data: { importance: memory.importance }
        })
      );
      
      await Promise.all(updatePromises);
      
      // Clear cache
      this.cache.invalidateForCharacter(characterId);
      
      return memories.length;
    } catch (error) {
      console.error('Error applying memory decay:', error);
      throw error;
    }
  }
  
  /**
   * Consolidate similar memories to save storage
   * @param {string} characterId Character ID
   * @returns {Promise<Object>} Consolidation results
   */
  async consolidateMemories(characterId) {
    try {
      // Get all memories for character
      const memories = await this.db.characterMemory.findMany({
        where: { characterId }
      });
      
      if (memories.length < 10) {
        // Not enough memories to consolidate
        return { 
          processed: memories.length,
          consolidated: 0
        };
      }
      
      // Group by category for more efficient processing
      const memoriesByCategory = {};
      memories.forEach(memory => {
        if (!memoriesByCategory[memory.category]) {
          memoriesByCategory[memory.category] = [];
        }
        memoriesByCategory[memory.category].push(memory);
      });
      
      let consolidated = 0;
      
      // Process each category
      for (const [category, categoryMemories] of Object.entries(memoriesByCategory)) {
        // Skip categories with few memories
        if (categoryMemories.length < 5) continue;
        
        // Skip core memories
        if (category === 'core') continue;
        
        // Create embedding lookup for faster comparison
        const embeddingLookup = {};
        categoryMemories.forEach(memory => {
          const embedding = Buffer.isBuffer(memory.embedding) 
            ? new Float32Array(memory.embedding.buffer)
            : memory.embedding;
          
          embeddingLookup[memory.id] = embedding;
        });
        
        // Find similar memories
        const similarGroups = [];
        
        for (let i = 0; i < categoryMemories.length; i++) {
          const memoryA = categoryMemories[i];
          
          // Skip if already in a group
          if (similarGroups.some(group => group.includes(memoryA.id))) continue;
          
          const similarIds = [memoryA.id];
          
          for (let j = i + 1; j < categoryMemories.length; j++) {
            const memoryB = categoryMemories[j];
            
            // Skip if already in a group
            if (similarGroups.some(group => group.includes(memoryB.id))) continue;
            
            // Check similarity
            const embeddingA = embeddingLookup[memoryA.id];
            const embeddingB = embeddingLookup[memoryB.id];
            
            const similarity = this.embeddingService.cosineSimilarity(embeddingA, embeddingB);
            
            // If very similar, group together
            if (similarity > 0.85) {
              similarIds.push(memoryB.id);
            }
          }
          
          // If found similar memories, add as a group
          if (similarIds.length > 1) {
            similarGroups.push(similarIds);
          }
        }
        
        // Consolidate each group
        for (const group of similarGroups) {
          // Get full memory objects
          const memoriesToConsolidate = categoryMemories.filter(m => group.includes(m.id));
          
          // Sort by importance (descending)
          memoriesToConsolidate.sort((a, b) => b.importance - a.importance);
          
          // Keep the most important memory
          const primaryMemory = memoriesToConsolidate[0];
          const secondaryMemories = memoriesToConsolidate.slice(1);
          
          // Update primary memory
          await this.db.characterMemory.update({
            where: { id: primaryMemory.id },
            data: {
              importance: Math.min(primaryMemory.importance * 1.2, 1.0), // Boost importance
              metadata: {
                ...primaryMemory.metadata,
                consolidated: {
                  count: secondaryMemories.length,
                  originalIds: secondaryMemories.map(m => m.id),
                  consolidatedAt: new Date()
                }
              }
            }
          });
          
          // Delete secondary memories
          for (const memory of secondaryMemories) {
            await this.deleteMemory(memory.id);
          }
          
          consolidated += secondaryMemories.length;
        }
      }
      
      // Clear cache
      this.cache.invalidateForCharacter(characterId);
      
      return {
        processed: memories.length,
        consolidated: consolidated
      };
    } catch (error) {
      console.error('Error consolidating memories:', error);
      throw error;
    }
  }
}

/**
 * Memory cache implementation
 */
class MemoryCache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.characterCacheKeys = new Map(); // Maps characterId to array of cache keys
  }
  
  get(key) {
    if (!this.cache.has(key)) return null;
    
    const entry = this.cache.get(key);
    entry.lastAccessed = Date.now();
    return entry.value;
  }
  
  set(key, value) {
    // Extract characterId from key (assuming format includes it)
    const characterIdMatch = key.match(/^search:([^:]+):/);
    const characterId = characterIdMatch ? characterIdMatch[1] : null;
    
    // If cache is full, remove least recently used
    if (this.cache.size >= this.maxSize) {
      let oldestKey = null;
      let oldestTime = Infinity;
      
      for (const [k, entry] of this.cache.entries()) {
        if (entry.lastAccessed < oldestTime) {
          oldestTime = entry.lastAccessed;
          oldestKey = k;
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
        // Remove from character cache keys mapping
        this.removeKeyFromCharacterMapping(oldestKey);
      }
    }
    
    // Add to cache
    this.cache.set(key, {
      value,
      lastAccessed: Date.now()
    });
    
    // Add to character cache keys mapping
    if (characterId) {
      if (!this.characterCacheKeys.has(characterId)) {
        this.characterCacheKeys.set(characterId, []);
      }
      this.characterCacheKeys.get(characterId).push(key);
    }
  }
  
  invalidateForCharacter(characterId) {
    const keys = this.characterCacheKeys.get(characterId) || [];
    
    // Delete each key from cache
    for (const key of keys) {
      this.cache.delete(key);
    }
    
    // Clear keys for this character
    this.characterCacheKeys.set(characterId, []);
  }
  
  removeKeyFromCharacterMapping(key) {
    // Extract characterId from key
    const characterIdMatch = key.match(/^search:([^:]+):/);
    if (!characterIdMatch) return;
    
    const characterId = characterIdMatch[1];
    const keys = this.characterCacheKeys.get(characterId) || [];
    
    // Remove key from character's keys
    const index = keys.indexOf(key);
    if (index !== -1) {
      keys.splice(index, 1);
      this.characterCacheKeys.set(characterId, keys);
    }
  }
}

/**
 * Memory categorization helper
 */
class MemoryCategorizer {
  categorizeMemory(memory) {
    // In a full implementation, this would use NLP or small LLM
    // For now, use keyword-based heuristics
    
    const content = memory.content.toLowerCase();
    
    // Check for episodic memory patterns
    if (content.includes('when i') || 
        content.includes('i remember') || 
        content.includes('happened') ||
        content.includes('experienced')) {
      return 'episodic';
    }
    
    // Check for procedural memory patterns
    if (content.includes('how to') || 
        content.includes('always do') || 
        content.includes('method') ||
        content.includes('technique') ||
        content.includes('process')) {
      return 'procedural';
    }
    
    // Check for emotional memory patterns
    if (content.includes('feel') || 
        content.includes('emotion') || 
        content.includes('love') ||
        content.includes('hate') ||
        content.includes('fear') ||
        content.includes('angry')) {
      return 'emotional';
    }
    
    // Default to semantic for factual information
    return 'semantic';
  }
  
  estimateImportance(memory) {
    // Simplified importance estimation
    let importance = 0.5; // Default importance
    
    // Adjust based on category
    if (memory.category === 'core') {
      importance = 0.9;
    } else if (memory.category === 'emotional') {
      importance = 0.7;
    } else if (memory.category === 'episodic') {
      importance = 0.6;
    }
    
    // Check content for significance indicators
    const content = memory.content.toLowerCase();
    
    // Personal beliefs/values boost importance
    if (content.includes('i believe') || 
        content.includes('i value') || 
        content.includes('important to me')) {
      importance += 0.15;
    }
    
    // Emotional content boosts importance
    const emotionalWords = ['love', 'hate', 'fear', 'hope', 'dream', 'terrified', 'excited'];
    if (emotionalWords.some(word => content.includes(word))) {
      importance += 0.1;
    }
    
    // Cap at 1.0
    return Math.min(importance, 1.0);
  }
}

// Utility functions
function generateUUID() {
  // Simple UUID generation for example
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getDefaultDecayRate(category) {
  // Default decay rates by category
  const decayRates = {
    core: 0.01,
    emotional: 0.04,
    episodic: 0.05,
    semantic: 0.03,
    procedural: 0.02
  };
  
  return decayRates[category] || 0.05;
}

// Mock vector database for example
class VectorDatabase {
  constructor(options) {
    this.dimensions = options.dimensions;
    this.items = new Map();
    this.metadata = new Map();
    console.log(`Initialized vector database with ${this.dimensions} dimensions`);
  }
  
  async addItem(id, vector, metadata) {
    this.items.set(id, vector);
    this.metadata.set(id, metadata);
    return id;
  }
  
  async updateItem(id, vector) {
    if (!this.items.has(id)) {
      throw new Error(`Item ${id} not found`);
    }
    this.items.set(id, vector);
    return true;
  }
  
  async removeItem(id) {
    this.items.delete(id);
    this.metadata.delete(id);
    return true;
  }
  
  async searchByVector(vector, limit, filter) {
    // Calculate similarity to all vectors
    const results = [];
    
    for (const [id, itemVector] of this.items.entries()) {
      const metadata = this.metadata.get(id);
      
      // Apply filter
      if (filter) {
        if (filter.characterId && metadata.characterId !== filter.characterId) {
          continue;
        }
        if (filter.category && metadata.category !== filter.category) {
          continue;
        }
      }
      
      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(vector, itemVector);
      
      results.push({
        id,
        score: similarity
      });
    }
    
    // Sort by similarity (descending)
    results.sort((a, b) => b.score - a.score);
    
    // Apply limit
    return results.slice(0, limit);
  }
  
  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < this.dimensions; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Mock embedding service for example
class EmbeddingService {
  constructor(options) {
    this.modelName = options.modelName;
    console.log(`Initialized embedding service with model ${this.modelName}`);
  }
  
  async embedText(text) {
    // In a real implementation, this would call a model API
    // For demo, generate random embedding
    return Array(384).fill(0).map(() => (Math.random() * 2 - 1) * 0.1);
  }
  
  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Mock database service for example
class DatabaseService {
  static getConnection() {
    return {
      characterMemory: {
        create: async (data) => {
          console.log('Creating memory:', data.data.id);
          return data.data;
        },
        findUnique: async (query) => {
          console.log('Finding memory by ID:', query.where.id);
          return { id: query.where.id, characterId: 'char123' };
        },
        findMany: async (query) => {
          console.log('Finding memories with query:', JSON.stringify(query));
          return [];
        },
        update: async (query) => {
          console.log('Updating memory:', query.where.id);
          return { id: query.where.id, ...query.data };
        },
        delete: async (query) => {
          console.log('Deleting memory:', query.where.id);
          return { id: query.where.id };
        }
      },
      $transaction: async (operations) => {
        console.log(`Executing transaction with ${operations.length} operations`);
        return operations.map(op => ({ success: true }));
      }
    };
  }
}

// Example usage demo
function demonstrateMemoryStorage() {
  const memoryStorage = new MemoryStorageService();
  
  // Example memory data
  const exampleMemory = {
    characterId: 'char123',
    content: 'I believe scientific progress must always be guided by ethical considerations.',
    category: 'core',
    importance: 0.95,
    metadata: {
      emotions: ["conviction", "responsibility"],
      entities: [{ name: "Science", relation: "field" }]
    }
  };
  
  // Simulated operations
  console.log("=== Memory Storage Service Demo ===");
  console.log("1. Storing a new memory");
  memoryStorage.storeMemory(exampleMemory).then(result => {
    console.log("Memory stored:", result.id);
    
    console.log("\n2. Searching for memories");
    return memoryStorage.searchMemories({
      characterId: 'char123',
      query: "ethical considerations in science"
    });
  }).then(results => {
    console.log(`Found ${results.length} relevant memories`);
    
    console.log("\n3. Retrieving diverse memories for conversation");
    return memoryStorage.getConversationMemories({
      characterId: 'char123',
      query: "ethics in research",
      limit: 5
    });
  }).then(memories => {
    console.log(`Selected ${memories.length} diverse memories for conversation context`);
    
    console.log("\n4. Applying memory decay");
    return memoryStorage.applyMemoryDecay('char123', 30);
  }).then(count => {
    console.log(`Applied decay to ${count} memories`);
    
    console.log("\n5. Consolidating similar memories");
    return memoryStorage.consolidateMemories('char123');
  }).then(result => {
    console.log(`Processed ${result.processed} memories, consolidated ${result.consolidated}`);
    console.log("\nDemo completed successfully");
  }).catch(error => {
    console.error("Error in demo:", error);
  });
  
  return "Memory Storage Service demo running...";
}

module.exports = {
  MemoryStorageService,
  MemoryCache,
  MemoryCategorizer,
  demonstrateMemoryStorage
};