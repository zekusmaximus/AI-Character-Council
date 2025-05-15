# AI Character Council - Memory Architecture

## Executive Summary

This document defines the comprehensive memory architecture for AI characters in the Character Council application. The memory system is designed to give characters persistent, evolving knowledge that influences their personalities and responses over time. The architecture includes:

1. **Vector-Based Memory Storage** - An efficient system for storing and retrieving character memories based on semantic meaning
2. **Memory Categorization** - A classification system that mimics human memory types (episodic, semantic, procedural)
3. **Context-Aware Retrieval** - Algorithms for retrieving the most relevant memories based on conversation context
4. **Prioritization Mechanics** - Methods for determining which memories most strongly influence character behavior

The memory architecture integrates with the existing character data models and LLM integration strategy, forming a core component of the AI Character Council's ability to create persistent, evolving character personalities.

## Table of Contents

1. [Memory Architecture Overview](#memory-architecture-overview)
2. [Memory Data Model](#memory-data-model)
3. [Memory Storage System](#memory-storage-system)
4. [Memory Categorization](#memory-categorization)
5. [Retrieval Mechanisms](#retrieval-mechanisms)
6. [Memory Prioritization Algorithms](#memory-prioritization-algorithms)
7. [Technical Implementation](#technical-implementation)
8. [Optimizations & Performance](#optimizations--performance)

## Memory Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI Character Council Application                 │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
┌─────────────────▼─────────────────┐   ┌─────────────▼─────────────────┐
│                                   │   │                               │
│        Character Engine           │   │       Memory Subsystem        │
│        - Personality              │   │       - Storage Pipeline      │
│        - Response Generation      │   │       - Retrieval Engine      │
│        - Evolution Management     │   │       - Categorization        │
│                                   │   │       - Author Controls       │
└───────────────┬───────────────────┘   └─────────────┬─────────────────┘
                │                                     │
                │               ┌─────────────────────┘
                │               │
┌───────────────▼───────────────▼───────────────────────────────────────┐
│                                                                       │
│                         Vector Database                               │
│                         - Memory Storage                              │
│                         - Embedding Indexing                          │
│                         - Similarity Search                           │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### Core Components

1. **Memory Storage Pipeline**: Processes and stores new memories from character interactions
2. **Retrieval Engine**: Fetches relevant memories based on conversation context
3. **Vector Database**: Enables semantic search of memories using embeddings
4. **Categorization System**: Organizes memories by type and attributes
5. **Author Control Interface**: Allows authors to manipulate character memories

### Information Flow

1. **Memory Creation**:
   - Character interactions generate potential memory content
   - Memory extraction identifies significant information
   - New memories are embedded, categorized, and stored

2. **Memory Retrieval**:
   - Conversation context triggers memory search
   - Vector similarity finds semantically relevant memories
   - Prioritization algorithms rank memories by importance
   - Top memories are included in character context

3. **Memory Evolution**:
   - New experiences modify importance of existing memories
   - Contradictory information can update or create conflicts
   - Memory decay reduces importance of old, unreinforced memories
   - Key character-defining memories remain persistent

## Memory Data Model

The memory system extends the existing `CharacterMemory` data model with additional fields and relationships.

### Enhanced Memory Model

```
CharacterMemory {
  id: UUID (Primary Key)
  characterId: UUID (Foreign Key to Character)
  content: String
  importance: Float (default: 0.5)
  embedding: Bytes (vector embedding)
  
  // Memory Categorization
  category: Enum ('episodic', 'semantic', 'procedural', 'emotional', 'author-defined')
  subcategory: String (optional)
  
  // Metadata
  metadata: JSON {
    source: {
      type: String ('conversation', 'event', 'author-defined', etc.)
      id: UUID (optional, reference to source entity)
      details: String (optional description)
    }
    emotions: Array<String> (emotional tags associated with memory)
    entities: Array<{
      id: UUID (optional, reference to other characters/entities)
      name: String
      relation: String (e.g., 'friend', 'enemy', 'mentor')
    }>
    locations: Array<String> (places associated with memory)
    accessibility: {
      conscious: Boolean (whether memory is consciously accessible)
      trigger_conditions: Array<String> (conditions that make memory accessible)
      suppression_reason: String (why memory might be suppressed)
    }
  }
  
  // Memory Lifecycle
  created_at: DateTime
  last_accessed: DateTime (optional)
  access_count: Integer (default: 0)
  decay_rate: Float (how quickly memory fades, default: 0.1)
}
```

### Memory Categories

Each memory is assigned a primary category that affects how it's used in character responses:

| Category | Description | Usage in Character Behavior |
|----------|-------------|----------------------------|
| **Episodic** | Specific experiences and events | Personal anecdotes, reactions to similar situations |
| **Semantic** | General knowledge and facts | World understanding, conceptual knowledge |
| **Procedural** | Skills and action patterns | How to perform actions, behavioral habits |
| **Emotional** | Feelings and emotional associations | Emotional reactions, personal biases |
| **Author-defined** | Custom memory types | Special author-created memory influences |

### Memory Metadata

The JSON metadata structure provides rich context about each memory:

1. **Source**: Tracks where the memory originated
2. **Emotions**: Emotional tags associated with the memory
3. **Entities**: Other characters or entities involved
4. **Locations**: Places associated with the memory
5. **Accessibility**: Controls when/how the memory is accessible

## Memory Storage System

The memory storage system handles the process of creating, embedding, and storing character memories.

### Memory Creation Pipeline

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  Information  │────>│   Memory      │────>│  Importance   │
│  Extraction   │     │  Formation    │     │  Assessment   │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
        │                                           │
        │                                           │
        │                                           ▼
        │                                  ┌───────────────┐
        │                                  │               │
        │                                  │  Emotional    │
        │                                  │  Tagging      │
        │                                  │               │
        │                                  └───────────────┘
        │                                           │
        ▼                                           ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  Embedding    │────>│  Category     │────>│  Storage      │
│  Generation   │     │  Assignment   │     │  Operation    │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

1. **Information Extraction**:
   - For conversations: Extract significant statements from character responses
   - For events: Extract character participation and impact
   - For author-defined: Process direct author input

2. **Memory Formation**:
   - Structure extracted information into discrete memory units
   - Format for consistent storage
   - Link to relevant entities, locations, and concepts

3. **Importance Assessment**:
   - Analyze content for emotional significance
   - Evaluate relevance to character's core traits
   - Consider author-assigned importance (if any)
   - Calculate initial importance score (0.0-1.0)

4. **Emotional Tagging**:
   - Identify emotional content in memory
   - Tag with emotional labels
   - Determine emotional intensity

5. **Embedding Generation**:
   - Process memory content through embedding model
   - Generate vector representation
   - Optimize for semantic similarity search

6. **Category Assignment**:
   - Analyze content to determine memory type
   - Assign primary category and subcategory
   - Set metadata fields based on content

7. **Storage Operation**:
   - Save memory to database
   - Index embedding in vector store
   - Link to character and related entities

### Vector Embedding System

The vector embedding system converts text-based memories into numerical vectors that capture semantic meaning:

1. **Embedding Model**: Uses a small, efficient embedding model (e.g., BERT, sentence-transformers)
2. **Vector Dimensionality**: 384 or 768 dimensions, balancing quality and storage efficiency
3. **Indexing**: Uses approximate nearest neighbor algorithms for fast retrieval (HNSW, IVF)
4. **Storage Format**: Binary format for efficient database storage (BLOB field)
5. **Cluster Optimization**: Similar memories are indexed together for faster retrieval

## Memory Categorization

The memory categorization system organizes memories to reflect how human memory works, allowing for more nuanced character behavior.

### Primary Memory Categories

#### 1. Episodic Memories

Memories of specific events experienced by the character.

**Subcategories:**
- **Personal**: Direct experiences of the character
- **Observed**: Events witnessed but not directly experienced
- **Reported**: Events learned about from others
- **Defining**: Key moments that shaped the character

**Example Structure:**
```json
{
  "category": "episodic",
  "subcategory": "defining",
  "content": "When I was 12, I watched my father's research being weaponized against his wishes",
  "importance": 0.9,
  "metadata": {
    "emotions": ["betrayal", "disillusionment", "resolve"],
    "entities": [
      {
        "name": "Father",
        "relation": "parent"
      },
      {
        "name": "Military Research Division",
        "relation": "antagonist"
      }
    ],
    "accessibility": {
      "conscious": true,
      "trigger_conditions": ["discussions of weapons", "ethics in science"]
    }
  }
}
```

#### 2. Semantic Memories

General knowledge, facts, and concepts known by the character.

**Subcategories:**
- **Academic**: Learned knowledge from education
- **Professional**: Knowledge from career and expertise
- **Cultural**: Societal knowledge and norms
- **Philosophical**: Beliefs and abstract understanding

**Example Structure:**
```json
{
  "category": "semantic",
  "subcategory": "professional",
  "content": "Quantum entanglement allows particles to maintain correlation regardless of distance",
  "importance": 0.85,
  "metadata": {
    "source": {
      "type": "background",
      "details": "Part of character's professional knowledge as physicist"
    },
    "accessibility": {
      "conscious": true
    }
  }
}
```

#### 3. Procedural Memories

Knowledge of how to perform actions and behaviors.

**Subcategories:**
- **Skills**: Learned abilities and techniques
- **Habits**: Automatic behavioral patterns
- **Protocols**: Standard procedures the character follows
- **Techniques**: Specialized methods in character's field

**Example Structure:**
```json
{
  "category": "procedural",
  "subcategory": "protocols",
  "content": "When conducting temporal field experiments, I always verify calibration three times",
  "importance": 0.75,
  "metadata": {
    "source": {
      "type": "character-development",
      "details": "Developed after lab accident in 2030"
    }
  }
}
```

#### 4. Emotional Memories

Emotional associations and feelings linked to stimuli.

**Subcategories:**
- **Associations**: Emotional responses to triggers
- **Traumas**: Emotional wounds and their triggers
- **Joys**: Sources of happiness and fulfillment
- **Fears**: Sources of anxiety and avoidance

**Example Structure:**
```json
{
  "category": "emotional",
  "subcategory": "trauma",
  "content": "I feel a deep sense of loss whenever I see quantum stabilizers like the ones that failed during the accident that took Maria",
  "importance": 0.95,
  "metadata": {
    "emotions": ["grief", "guilt", "anxiety"],
    "entities": [
      {
        "name": "Maria",
        "relation": "deceased_spouse"
      }
    ],
    "accessibility": {
      "conscious": true,
      "trigger_conditions": ["laboratory settings", "equipment failure discussions"]
    }
  }
}
```

### Special Memory Attributes

Certain memory attributes affect how memories are used in character responses:

1. **Core Memories**: High importance (>0.9) memories that fundamentally define the character
2. **Suppressed Memories**: Memories that are only accessible under specific conditions
3. **Evolving Memories**: Memories that change in interpretation over time
4. **Conflicting Memories**: Sets of memories that contain contradictory information

## Retrieval Mechanisms

The retrieval system is responsible for finding the most relevant memories for each conversation context.

### Context-Aware Retrieval Process

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  Query        │────>│  Semantic     │────>│  Initial      │
│  Analysis     │     │  Search       │     │  Results      │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
                                                    │
                                                    │
                                                    ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  Response     │<────│  Final        │<────│  Multi-factor │
│  Integration  │     │  Selection    │     │  Ranking      │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

1. **Query Analysis**:
   - Extract key topics from user input
   - Identify entities, locations, and concepts
   - Determine emotional tone
   - Consider conversation history

2. **Semantic Search**:
   - Convert query to embedding vector
   - Perform approximate nearest neighbor search
   - Retrieve top-N semantically similar memories
   - Filter by character accessibility

3. **Multi-factor Ranking**:
   - Score memories on multiple dimensions:
     - Semantic relevance (vector similarity)
     - Importance score (author/system assigned)
     - Recency (time-based decay)
     - Category relevance (to conversation)
     - Access frequency (commonly recalled)

4. **Final Selection**:
   - Apply budgeting (token limits)
   - Ensure diversity of memory types
   - Include at least one core memory
   - Balance recent and foundational memories

5. **Response Integration**:
   - Format selected memories for LLM context
   - Update memory access timestamps
   - Increment access counters

### Memory Query Types

The system supports different types of memory queries for various scenarios:

1. **Conversational Queries**: Standard retrieval during character conversations
   ```
   Input: User message in conversation
   Output: Top 5-10 relevant memories
   ```

2. **Reflective Queries**: Deep search across character's entire memory
   ```
   Input: "What does [character] truly believe about [topic]?"
   Output: Comprehensive set of beliefs and experiences
   ```

3. **Emotional Queries**: Search focusing on emotional reactions
   ```
   Input: "How would [character] feel about [situation]?"
   Output: Memories with strong emotional content
   ```

4. **Relationship Queries**: Search for memories involving specific entities
   ```
   Input: "What does [character] remember about [entity]?"
   Output: Memories involving target entity
   ```

### Temporal Context Awareness

The retrieval system is aware of different temporal contexts:

1. **Present Context**: Default mode for standard conversations
2. **Past Context**: Retrieving memories as they existed at a specific point
3. **Alternate Timeline**: Retrieving memories from specific character versions
4. **Hypothetical Context**: Retrieving memories relevant to "what if" scenarios

## Memory Prioritization Algorithms

The prioritization system determines which memories have the strongest influence on character responses.

### Prioritization Formula

```
MemoryScore = (w₁ × SemanticRelevance) + (w₂ × Importance) + (w₃ × RecencyScore) + (w₄ × AccessFrequency)

Where:
- SemanticRelevance: Cosine similarity between query and memory (0-1)
- Importance: Author/system assigned importance score (0-1)
- RecencyScore: Exponential decay function of memory age (0-1)
- AccessFrequency: Normalized access count score (0-1)
- w₁, w₂, w₃, w₄: Configurable weights that sum to 1.0
```

Default weights:
- w₁ (Semantic Relevance): 0.5
- w₂ (Importance): 0.3
- w₃ (Recency): 0.15
- w₄ (Access Frequency): 0.05

### Decay Function

Recency score is calculated using an exponential decay function:

```
RecencyScore = e^(-decay_rate × age_in_days)
```

Where:
- `decay_rate` is a configurable parameter (default 0.05)
- Higher decay rates cause faster memory fading
- Core memories use a lower decay rate (0.01)

### Memory Interference

The system models how memories can interfere with each other:

1. **Recency Bias**: Recent memories temporarily boost in importance
2. **Retrieval-Induced Forgetting**: Recalling some memories inhibits related ones
3. **Interference Effects**: Similar memories can reduce each other's distinctiveness

### Emotional Amplification

Emotions amplify memory importance based on:

1. **Emotional Intensity**: Stronger emotions increase importance
2. **Character Sensitivity**: Characters are more affected by emotions aligned with their traits
3. **Trigger Proximity**: Stimuli similar to memory triggers increase importance

## Technical Implementation

### Vector Database Implementation

The memory system uses a hybrid approach:

1. **Primary Database**: SQLite with Prisma ORM
   - Stores all memory metadata and properties
   - Maintains relationships between entities
   - Handles transaction guarantees

2. **Vector Index**: FAISS or Hnswlib
   - Stores and indexes memory embeddings
   - Performs approximate nearest neighbor search
   - Optimized for fast similarity queries

```javascript
// Example vector search implementation
class VectorDatabase {
  constructor() {
    this.index = new HnswIndex(384); // 384-dimensional vectors
    this.memoryMap = new Map(); // Maps vector IDs to memory IDs
  }
  
  async addMemory(memory) {
    // Add to vector index
    const vectorId = this.index.add(memory.embedding);
    this.memoryMap.set(vectorId, memory.id);
    
    // Save to SQL database
    await db.characterMemory.create({
      data: {
        id: memory.id,
        characterId: memory.characterId,
        content: memory.content,
        importance: memory.importance,
        category: memory.category,
        subcategory: memory.subcategory,
        metadata: memory.metadata,
        embedding: Buffer.from(memory.embedding),
        createdAt: new Date(),
        accessCount: 0,
        decayRate: memory.category === 'core' ? 0.01 : 0.05
      }
    });
  }
  
  async search(query, characterId, limit = 10) {
    // Convert query to embedding
    const queryEmbedding = await embedText(query);
    
    // Search vector index
    const results = this.index.search(queryEmbedding, limit * 3);
    
    // Get memory IDs from vector IDs
    const memoryIds = results.map(r => this.memoryMap.get(r.id));
    
    // Fetch full memory objects from database
    const memories = await db.characterMemory.findMany({
      where: {
        id: { in: memoryIds },
        characterId: characterId
      }
    });
    
    // Calculate final score with additional factors
    const scoredMemories = this.calculateMemoryScores(memories, results);
    
    // Return top memories
    return scoredMemories.slice(0, limit);
  }
}
```

### Memory Extraction Process

The memory extraction process identifies information worth remembering:

1. **LLM-Based Extraction**: Uses a small, efficient LLM to identify important information
   ```javascript
   async function extractMemories(conversation) {
     // Prompt for memory extraction
     const prompt = `
       Analyze the following conversation and identify important information 
       that the character should remember. Focus on:
       1. New information about the world
       2. Personal revelations
       3. Emotional moments
       4. Commitments or promises made
       5. Changes in relationships
       
       Conversation:
       ${conversation}
       
       Extract 1-3 memories in JSON format with fields:
       - content: The memory content
       - importance: Estimated importance (0.0-1.0)
       - category: Memory category (episodic, semantic, etc.)
       - emotions: Array of emotional tags
     `;
     
     // Call smaller, efficient LLM for extraction
     const response = await llmClient.generate(prompt, {
       model: "gpt-3.5-turbo",
       temperature: 0.3,
       max_tokens: 300
     });
     
     // Parse extracted memories
     return JSON.parse(response);
   }
   ```

2. **Rule-Based Extraction**: Fallback method using pattern matching
   ```javascript
   function extractImportantPhrases(text) {
     const phrases = [];
     
     // Split text into sentences
     const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
     
     // Apply importance heuristics
     for (const sentence of sentences) {
       let importance = 0.5; // Default importance
       
       // Check for emotional content
       const emotionalWords = ['love', 'hate', 'fear', 'hope', 'dream', 'believe'];
       if (emotionalWords.some(word => sentence.includes(word))) {
         importance += 0.2;
       }
       
       // Check for personal assertions
       if (sentence.includes('I am') || sentence.includes('I believe')) {
         importance += 0.15;
       }
       
       // Check for commitments
       if (sentence.includes('I will') || sentence.includes('I promise')) {
         importance += 0.25;
       }
       
       // If sufficiently important, add as potential memory
       if (importance >= 0.6 && sentence.length > 20) {
         phrases.push({
           content: sentence.trim(),
           importance: importance
         });
       }
     }
     
     return phrases;
   }
   ```

### Embedding Generation

The embedding generation system uses local models for efficiency:

```javascript
class EmbeddingService {
  constructor() {
    // Load local embedding model
    this.model = new SentenceTransformerModel("all-MiniLM-L6-v2");
    this.dimensions = 384;
    this.cache = new LRUCache(1000); // Cache for efficiency
  }
  
  async embedText(text) {
    // Check cache first
    const cacheKey = crypto.createHash('md5').update(text).digest('hex');
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Generate embedding
    const embedding = await this.model.encode(text);
    
    // Store in cache
    this.cache.set(cacheKey, embedding);
    
    return embedding;
  }
  
  cosineSimilarity(embedding1, embedding2) {
    // Calculate cosine similarity between embeddings
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < this.dimensions; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}
```

## Optimizations & Performance

### Memory Indexing Optimizations

1. **Hierarchical Indexing**:
   - First-level categorization by character and memory type
   - Second-level embedding-based similarity
   - Improves query performance by filtering before vector search

2. **Cluster-Based Indexing**:
   - Group similar memories into clusters
   - Query searches relevant clusters first
   - Reduces search space for large memory sets

3. **Cached Query Results**:
   - Store results of common queries
   - Implement LRU cache with configurable size
   - Invalidate on new relevant memories

### Memory Compression

For characters with extensive histories, memory compression techniques preserve important information while reducing storage requirements:

1. **Memory Consolidation**:
   - Detect similar memories and merge them
   - Update importance and reference count
   - Maintain oldest original timestamp
   - Preserve unique emotional content

2. **Summarization**:
   - Periodically summarize groups of related memories
   - Create higher-level "concept" memories
   - Maintain links to original detailed memories
   - Use LLM for intelligent summarization

3. **Selective Retention**:
   - Automatically archive memories below importance threshold
   - Create compressed memory digest for access when needed
   - Preserve core memories permanently

### Performance Metrics

Expected performance characteristics:

| Operation | Avg. Response Time | Notes |
|-----------|-------------------|-------|
| Memory Storage | 50-100ms | Includes embedding generation |
| Memory Retrieval (basic) | 20-50ms | For 10-memory limit |
| Memory Retrieval (complex) | 50-100ms | With multi-factor scoring |
| Memory Extraction | 200-500ms | Using LLM-based extraction |
| Memory Consolidation | 1-2s | Periodic batch process |

### Scaling Considerations

The memory system is designed to scale efficiently:

1. **Memory Count**: Efficiently handles up to 100,000 memories per character
2. **Character Count**: Supports hundreds of characters with distinct memory spaces
3. **Query Performance**: Maintains sub-100ms retrieval for most operations
4. **Storage Requirements**: Approximately 1KB per memory plus embedding storage

## Conclusion

The memory architecture described in this document provides a comprehensive system for storing, retrieving, and utilizing character memories in the AI Character Council application. By implementing this architecture, characters will exhibit consistent yet evolving personalities, draw upon past experiences, and maintain coherent long-term knowledge that enhances the author's creative process.

Key benefits of this memory system include:

1. **Persistent Character Knowledge**: Characters remember conversations and events across sessions
2. **Dynamic Evolution**: Character personalities evolve naturally based on experiences
3. **Author Control**: Writers can manipulate memories to shape character development
4. **Efficient Performance**: Optimized for both quality and computational efficiency
5. **Flexible Integration**: Works seamlessly with the LLM generation pipeline

This memory system forms the cognitive foundation for the AI Character Council, enabling characters to become true creative partners for speculative fiction authors.