# AI Character Council - Data Models

## Executive Summary

This document defines the comprehensive data models for the AI Character Council application, designed to support speculative fiction authors in managing complex characters across multiple novels. The data models provide sophisticated structures for:

1. **Rich Character Personalities** - Detailed models for character traits, voices, worldviews, and behavioral patterns that drive consistent and nuanced AI-powered personalities
   
2. **Dynamic Memory Systems** - Vector-based memory storage enabling characters to remember conversations, evolve over time, and maintain coherent knowledge about their experiences
   
3. **Multi-Timeline Management** - Data structures that track characters across different timelines, transformations, reincarnations, and alternate realities
   
4. **Cross-Referenced Creative Assets** - An integrated tagging system that connects characters, conversations, events, and notes through thematic, symbolic, and narrative relationships
   
5. **Flexible Export Options** - Templates for exporting character and story data to common writing tools like Obsidian, Scrivener, and Word

The models are designed with both database efficiency and creative flexibility in mind, supporting the fluid narrative needs of speculative fiction while maintaining consistent data relationships. The system emphasizes character coherence and evolution while giving authors extensive control over how characters develop and interact across complex narratives.

## Table of Contents
1. [Overview](#overview)
2. [Core Entity Relationships](#core-entity-relationships)
3. [Character Models](#character-models)
   - [Character Entity](#character-entity)
   - [Character Personality](#character-personality)
   - [Character Memory](#character-memory)
   - [Character Version](#character-version)
4. [Conversation Models](#conversation-models)
   - [Conversation Entity](#conversation-entity)
   - [Conversation Message](#conversation-message)
   - [Memory Extraction](#memory-extraction)
5. [Timeline Models](#timeline-models)
   - [Timeline Entity](#timeline-entity)
   - [Timeline Event](#timeline-event)
   - [Character-Event Link](#character-event-link)
6. [Note System Models](#note-system-models)
   - [Note Entity](#note-entity)
   - [Tag System](#tag-system)
   - [Tagged Item](#tagged-item)
7. [Application Settings](#application-settings)
   - [User Settings](#user-settings)
   - [Export Templates](#export-templates)
8. [JSON Schemas](#json-schemas)
   - [Character Personality Traits](#character-personality-traits-schema)
   - [Character Sheet](#character-sheet-schema)
   - [Conversation Message Metadata](#conversation-message-metadata-schema)
   - [Timeline Event Metadata](#timeline-event-metadata-schema)
   - [Character Memory Metadata](#character-memory-metadata-schema)
9. [Vector Storage Model](#vector-storage-model)

## Overview

The AI Character Council application requires sophisticated data models to support complex character personalities, dynamic memory management, multiple timelines, and interconnected creative assets. This document defines the complete data model structure, including both the relational database schema and the JSON structures for complex nested data.

The data models are designed to support:
- Rich character personalities with traits, memories, and worldviews
- Evolving characters that learn and change through interactions
- Tracking characters across multiple timelines and transformations
- Cross-referenced creative elements with semantic tagging

## Core Entity Relationships

```
Project 1──────┬─────────────────┬───────────────┬────────────────┐
               │                 │               │                │
               ▼                 ▼               ▼                ▼
          Characters     Conversations       Timelines          Notes      Tags
               │                 │               │                │          │
               │                 │               │                │          │
               │                 │               │                ▼          ▼
               │                 │               │           Tagged Items ◄─────┐
               │                 │               │                ▲             │
               │                 │               │                │             │
               ▼                 ▼               ▼                │             │
     ┌─────────┬─────────┐      │         Timeline Events────────┘             │
     │         │         │      │               │                              │
     ▼         ▼         ▼      ▼               │                              │
Character   Character  Character-Event    Conversation            │             │
Versions    Memories      Links           Messages                │             │
     │                      ▲                  │                  │             │
     │                      │                  │                  │             │
     └──────────────────────┼──────────────────┘                  │             │
                            │                                     │             │
                            └─────────────────────────────────────┘             │
                                                                                │
                                                                                │
                            └────────────────────────────────────────────────────┘
```

### Entity-Relationship Model

The data model contains several key entities and relationships:

1. **Primary Entities**
   - `Project`: Container for all story-related data
   - `Character`: Core entity representing fictional characters
   - `Conversation`: Dialogue sessions with characters
   - `Timeline`: Sequential organization of story events
   - `Note`: Author's notes and writing materials
   - `Tag`: Cross-referencing system for all entities

2. **Secondary Entities**
   - `CharacterVersion`: Tracks character transformations and variants
   - `CharacterMemory`: Stores character knowledge and experiences
   - `ConversationMessage`: Individual messages in conversations
   - `TimelineEvent`: Discrete events in a timeline
   - `CharacterEventLink`: Links characters to events with specific roles
   - `TaggedItem`: Polymorphic many-to-many relationship mechanism

3. **Key Relationships**
   - Project contains all other primary entities
   - Characters participate in conversations through messages
   - Characters appear in timeline events through character-event links
   - Characters have versions, memories, and can be tagged
   - Any entity can be tagged with any number of tags
   - Characters can reference other characters (relationships)

## Character Models

### Character Entity

The core entity for storing character information.

**Database Fields:**
```
Character {
  id: UUID (Primary Key)
  projectId: UUID (Foreign Key to Project)
  name: String
  bio: String (nullable)
  personalityTraits: JSON
  characterSheet: JSON (nullable)
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Relationships:**
- Belongs to a `Project`
- Has many `ConversationMessages`
- Has many `CharacterEventLinks`
- Has many `CharacterMemories`
- Has many `CharacterVersions`
- Has many `TaggedItems`

The `Character` entity serves as the central model for character information, with complex data stored in JSON fields and related entities. The primary character definition is stored in the main record, while versions, memories, and relationships are stored in related tables.

### Character Personality

Complex character personality data stored in the `personalityTraits` JSON field.

**Structure:**
```json
{
  "core": {
    "traits": [
      { "name": "Curiosity", "value": 85 },
      { "name": "Compassion", "value": 70 },
      { "name": "Courage", "value": 60 },
      { "name": "Loyalty", "value": 90 }
    ],
    "values": [
      "Scientific integrity",
      "Ethical responsibility",
      "Truth above comfort"
    ],
    "drivingMotivations": [
      "Discover the unknown",
      "Protect the vulnerable",
      "Establish ethical boundaries for technology"
    ],
    "fears": [
      "Creating technology that harms humanity",
      "Being forgotten or irrelevant",
      "Failing those who depend on him"
    ]
  },
  "voice": {
    "speechPattern": "Formal, precise, with occasional philosophical tangents",
    "vocabulary": "Academic, technical, with metaphorical flourishes when discussing ethics",
    "commonPhrases": [
      "Fascinating hypothesis...",
      "One must consider the ethical implications...",
      "The data suggests an alternative interpretation..."
    ]
  },
  "background": {
    "formativeEvents": [
      {
        "age": 12,
        "description": "Witnessed father's research being weaponized against his wishes",
        "impact": "Developed strong ethical stance on scientific responsibility"
      },
      {
        "age": 23,
        "description": "Discovery of a fundamental principle during an accident",
        "impact": "Learned that serendipity is as valuable as methodical planning"
      }
    ],
    "education": [
      "PhD in Theoretical Physics, Cambridge University",
      "Post-doctoral research at CERN"
    ],
    "significantRelationships": [
      {
        "name": "Dr. Eleanor Voss",
        "nature": "Mentor, later rival",
        "status": "Estranged"
      },
      {
        "name": "Maria Thornfield",
        "nature": "Wife, fellow researcher",
        "status": "Deceased"
      }
    ]
  },
  "worldview": {
    "beliefs": [
      "Science must be guided by ethics",
      "Human connection transcends rational understanding",
      "Knowledge brings responsibility"
    ],
    "philosophicalStance": "Humanist with a deep respect for natural laws and skepticism of dogma",
    "moralFramework": "Consequentialist ethics tempered by deontological boundaries"
  },
  "behavioralTendencies": {
    "underStress": [
      "Retreats into analytical mode",
      "Becomes overly perfectionistic",
      "Withdraws from emotional connections"
    ],
    "whenComfortable": [
      "Shows dry wit and humor",
      "Becomes animated when discussing big ideas",
      "Displays surprising warmth and mentorship"
    ],
    "decisionMakingStyle": "Methodical analysis of options, weighted by ethical considerations and long-term outcomes"
  },
  "characterGrowth": {
    "arcs": [
      {
        "theme": "Balancing scientific pursuit with human connection",
        "currentStage": "Learning to reopen to emotional vulnerability after loss",
        "potentialFuture": "Integrates emotional wisdom with intellectual brilliance"
      }
    ],
    "unresolved": [
      "Guilt over unintended consequences of research",
      "Fear of intimacy after losing spouse"
    ]
  },
  "llmGuidance": {
    "importantNotes": "Character should maintain scientific precision while showing emotional depth",
    "voiceExamples": [
      "The equations don't lie, but perhaps we've been asking them the wrong questions.",
      "There's an elegance to this solution that transcends the merely mathematical."
    ],
    "avoidances": "Should not use slang, should maintain formal sentence structure"
  }
}
```

### Character Memory

Stores individual memories for characters that influence their responses and evolution.

**Database Fields:**
```
CharacterMemory {
  id: UUID (Primary Key)
  characterId: UUID (Foreign Key to Character)
  content: String
  importance: Float (default: 0.5)
  embedding: Bytes (nullable, for vector storage)
  metadata: JSON (nullable)
  timestamp: DateTime
}
```

**Relationships:**
- Belongs to a `Character`

The `CharacterMemory` entity stores discrete pieces of information that the character remembers. Each memory has an importance score and can have rich metadata about its source and context. The embedding field stores vector representations for similarity search.

### Character Version

Tracks different versions of a character, such as alternate reality variants, reincarnations, or transformations.

**Database Fields:**
```
CharacterVersion {
  id: UUID (Primary Key)
  characterId: UUID (Foreign Key to Character)
  versionName: String
  data: JSON
  createdAt: DateTime
}
```

**Relationships:**
- Belongs to a `Character`

The `CharacterVersion` entity allows authors to create and track different versions of a character throughout their development or across different timelines.

### Character Transformation System

The Character Transformation System enables sophisticated tracking of character evolution across different realities, timelines, and incarnations.

#### Transformation Types

1. **Timeline Variants**
   - Same character in different timelines
   - May have different experiences and memories
   - Core personality traits typically remain consistent
   - Example: "What if" scenarios where key decisions differ

2. **Reincarnations**
   - Character essence across different lifetimes
   - Different physical forms, time periods, and contexts
   - Spiritual or thematic continuity
   - Often retaining symbolic elements or core motivations

3. **Alternate Reality Versions**
   - Parallel universe or dimensional variants
   - May have drastically different personalities or abilities
   - Connected by a core identity or "soul"
   - Useful for exploring character extremes

4. **Genre Shifts**
   - Same character translated to different genres
   - Adjusts traits to fit genre conventions while maintaining essence
   - Example: Fantasy character shifted to sci-fi setting

#### Transformation Data Model

```json
{
  "transformationType": "reincarnation",
  "originCharacterId": "uuid-of-original-character",
  "transformationReason": "Death in timeline A led to rebirth in timeline B",
  "continuityElements": [
    {
      "trait": "Protective instinct",
      "expression": "In original life: military commander protecting kingdom; In new life: doctor healing the vulnerable"
    },
    {
      "trait": "Tragic past",
      "expression": "In original life: lost family to plague; In new life: orphaned during war"
    }
  ],
  "differentiatingElements": [
    {
      "trait": "Temperament",
      "originalExpression": "Stoic, disciplined, emotionally reserved",
      "newExpression": "Warm, expressive, emotionally available"
    },
    {
      "trait": "Approach to problems",
      "originalExpression": "Direct confrontation, strategic",
      "newExpression": "Healing, diplomatic, conciliatory"
    }
  ],
  "symbolism": [
    {
      "symbol": "Phoenix tattoo",
      "meaning": "Represents rebirth across lives",
      "manifestation": "Actual tattoo in original life; Birthmark in new life"
    }
  ],
  "memoryTransfer": {
    "type": "subconscious",
    "triggers": ["Dreams of past life during stress", "Recognition of key people from past life"],
    "specificMemories": [
      {
        "originalMemoryId": "uuid-of-specific-memory",
        "transferType": "dream",
        "distortionLevel": "moderate"
      }
    ]
  },
  "thematicPurpose": "Exploring how the character's protective nature evolves when given a second chance in a healing role rather than a warrior role"
}
```

#### Transformation Visualization

Characters can be visualized across multiple dimensions of transformation:

```
Timeline A ────────────┬─────────────── Timeline B ────────────┬─────────── Timeline C
                       │                                       │
Medieval Knight        │                                       │
(Original Character)   │                                       │
        │              │                                       │
        │              │                                       │
        ▼              │                                       │
Victorian Professor ───┼─────────────▶ Steampunk Inventor ─────┼───────▶ Cyberpunk Hacker
(Reincarnation)        │              (Timeline Variant)       │         (Genre Shift)
                       │                                       │
                       │                                       │
                       │                                       │
                       ▼                                       ▼
                  Space Explorer                         Cosmic Entity
                  (Genre Shift)                   (Transcendent Evolution)
```

This system allows authors to maintain character continuity across complex multiversal or reincarnation-based narratives while tracking the specific differences and similarities between versions.

## Conversation Models

### Conversation Entity

Stores conversation sessions between the author and one or more characters.

**Database Fields:**
```
Conversation {
  id: UUID (Primary Key)
  projectId: UUID (Foreign Key to Project)
  title: String
  summary: String (nullable)
  isRoundtable: Boolean (default: false)
  roundtableSettings: JSON (nullable)
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Relationships:**
- Belongs to a `Project`
- Has many `ConversationMessages`
- Has many `TaggedItems`

The `Conversation` entity groups related messages together into a cohesive conversation session, allowing authors to organize their character interactions.

### Character Roundtable System

The Character Roundtable feature allows authors to facilitate conversations between multiple characters to explore their dynamics, debate story points, or brainstorm plot directions.

#### Roundtable Settings Structure

```json
{
  "topic": "The ethical implications of time travel",
  "moderationStyle": "author_led",
  "participantCharacters": [
    {
      "characterId": "char123",
      "role": "protagonist",
      "specialInstructions": "Particularly concerned about altering past events"
    },
    {
      "characterId": "char456",
      "role": "antagonist",
      "specialInstructions": "Believes in manipulating time for 'greater good'"
    },
    {
      "characterId": "char789",
      "role": "neutral_advisor",
      "specialInstructions": "Scientific perspective, concerned with paradoxes"
    }
  ],
  "interactionRules": {
    "speakingOrder": "free_form",
    "conflictLevel": "moderate",
    "maxResponsesBeforeAuthorPrompt": 5
  },
  "characterRelationshipContext": [
    {
      "characterIds": ["char123", "char456"],
      "relationshipType": "rivals",
      "context": "Have opposing views on the responsible use of technology"
    },
    {
      "characterIds": ["char123", "char789"],
      "relationshipType": "mentor_student",
      "context": "Character 789 was once Character 123's professor"
    }
  ],
  "narrativeGoals": [
    "Explore ethical frameworks for time manipulation",
    "Highlight character philosophical differences",
    "Set up conflict for Chapter 7 confrontation"
  ]
}
```

#### Roundtable Processing Flow

1. **Initialization**
   - Author selects participating characters
   - Sets roundtable topic and parameters
   - Establishes moderation style

2. **Context Assembly**
   - System combines each character's:
     - Core personality and voice
     - Relevant memories (including memories of other participants)
     - Relationship dynamics with other participants
     - Knowledge of the discussion topic

3. **Conversation Flow**
   - Author can address specific characters or the entire group
   - Characters can respond to the author or interact with each other
   - Interactions follow natural conversation patterns while respecting character relationships
   - Author can interject at any point to steer the conversation

4. **Memory Integration**
   - New memories are created for each character based on the roundtable
   - Characters remember not only what they said, but how others responded
   - These memories influence future interactions between the characters

This system enables complex character dynamics to emerge naturally through conversation, helping authors develop rich, multi-faceted character relationships and explore plot points from multiple perspectives simultaneously.

### Conversation Message

Stores individual messages within a conversation.

**Database Fields:**
```
ConversationMessage {
  id: UUID (Primary Key)
  conversationId: UUID (Foreign Key to Conversation)
  characterId: UUID (Foreign Key to Character, nullable)
  role: String ('user', 'character', 'system')
  content: String
  metadata: JSON (nullable)
  timestamp: DateTime
}
```

**Relationships:**
- Belongs to a `Conversation`
- Optionally belongs to a `Character`

The `ConversationMessage` entity stores the actual content of messages exchanged during conversations. Messages from characters are linked to their source character for context.

### Memory Extraction and Evolution Process

The character memory system enables dynamic evolution through conversations:

```
┌───────────────┐          ┌───────────────┐
│ User Input    │────────▶│ Context       │
│               │          │ Builder       │
└───────────────┘          └───────┬───────┘
       ▲                           │
       │                           ▼
       │                   ┌───────────────┐
┌──────┴────────┐          │ LLM Engine    │
│ Character     │          │               │
│ Response      │◀─────────┘               │
└───────────────┘                          │
       │                                   │
       │                                   │
       ▼                                   ▼
┌───────────────┐          ┌───────────────┐
│ Memory        │◀─────────│ Memory        │
│ Database      │          │ Extractor     │
└───────────────┘          └───────────────┘
       ▲
       │
┌──────┴────────┐
│ Author Memory │
│ Controls      │
└───────────────┘
```

#### Character Memory Processing Workflow

1. **Conversation Processing**:
   - When a character responds to user input, the response is analyzed
   - Important information is extracted using NLP or LLM techniques
   - Extracted information is converted to discrete memory entries

2. **Memory Creation**:
   - Memory importance is calculated based on emotional content, relevance to character, etc.
   - Memory is embedded into vector space for future similarity search
   - Memories are stored with metadata linking back to the source conversation

3. **Memory Retrieval**:
   - When preparing character responses, relevant memories are retrieved
   - Memories are ranked by a combination of relevance, importance, and recency
   - Top-ranked memories are included in the context for the LLM

4. **Author Controls**:
   - Authors can manually add important memories
   - Delete or suppress unwanted memories
   - Adjust memory importance or accessibility
   - Create "forgotten" memories that may resurface under specific conditions

## Timeline Models

### Timeline Entity

Organizes events into coherent sequences, allowing multiple timelines per project.

**Database Fields:**
```
Timeline {
  id: UUID (Primary Key)
  projectId: UUID (Foreign Key to Project)
  name: String
  description: String (nullable)
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Relationships:**
- Belongs to a `Project`
- Has many `TimelineEvents`
- Has many `TaggedItems`

The `Timeline` entity allows authors to organize story events into chronological or thematic sequences, with the ability to create multiple timelines for different possibilities.

### Timeline Event

Represents a specific event within a timeline.

**Database Fields:**
```
TimelineEvent {
  id: UUID (Primary Key)
  timelineId: UUID (Foreign Key to Timeline)
  title: String
  description: String (nullable)
  date: String
  order: Integer (default: 0)
  metadata: JSON (nullable)
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Relationships:**
- Belongs to a `Timeline`
- Has many `CharacterEventLinks`
- Has many `TaggedItems`

The `TimelineEvent` entity represents discrete events that occur within a timeline. The flexible date field allows for both realistic and fictional dating systems.

**Event Metadata Structure:**
```json
{
  "significance": "pivotal",
  "location": "The Quantum Laboratory",
  "symbolism": ["change", "discovery", "sacrifice"],
  "emotionalTone": "bittersweet",
  "timeOfDay": "midnight",
  "weather": "thunderstorm",
  "consequences": [
    {
      "shortTerm": "Discovery of time dilation principle",
      "longTerm": "Foundation for later breakthrough in time travel"
    }
  ],
  "alternateOutcomes": [
    {
      "description": "Experiment causes catastrophic explosion",
      "probability": "narrowly avoided",
      "linkedTimelineId": "timeline-alt-universe-7"
    }
  ],
  "media": {
    "images": ["event123.jpg"],
    "notes": ["lab_notes.md"]
  }
}
```

### Character-Event Link

Connects characters to timeline events with defined roles.

**Database Fields:**
```
CharacterEventLink {
  id: UUID (Primary Key)
  characterId: UUID (Foreign Key to Character)
  eventId: UUID (Foreign Key to TimelineEvent)
  role: String (nullable)
  notes: String (nullable)
  createdAt: DateTime
}
```

**Relationships:**
- Belongs to a `Character`
- Belongs to a `TimelineEvent`

The `CharacterEventLink` entity tracks which characters participated in which events and their role in those events, allowing for rich relationship tracking.

## Note System Models

### Note Entity

Stores author notes about story elements, characters, etc.

**Database Fields:**
```
Note {
  id: UUID (Primary Key)
  projectId: UUID (Foreign Key to Project)
  title: String
  content: String
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Relationships:**
- Belongs to a `Project`
- Has many `TaggedItems`

The `Note` entity allows authors to record ideas, research, and other information related to their story.

### Tag System

Organizes story elements with cross-referenced tags.

**Database Fields:**
```
Tag {
  id: UUID (Primary Key)
  projectId: UUID (Foreign Key to Project)
  name: String
  type: String
  color: String (nullable)
  description: String (nullable)
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Relationships:**
- Belongs to a `Project`
- Has many `TaggedItems`

The `Tag` entity allows for organization of story elements by symbols, themes, locations, etc. The type field categorizes tags (e.g., 'symbol', 'theme', 'location').

#### Tag Types and Cross-Referencing

The tag system enables sophisticated cross-referencing across the entire story universe:

| Tag Type | Description | Examples | Typical Tagged Entities |
|----------|-------------|----------|-------------------------|
| `theme` | Major thematic elements | Redemption, Loss, Rebirth | Characters, Conversations, Events, Notes |
| `symbol` | Symbolic elements | Red Rose, Broken Clock, Mirror | Events, Notes, Character traits |
| `motif` | Recurring story devices | Coming of Age, Descent into Madness | Character arcs, Timeline sequences |
| `location` | Physical or metaphysical places | Castle Dawnhold, The Void Between | Events, Conversations |
| `concept` | Abstract ideas | Quantum Entanglement, Divine Right | Notes, Conversations |
| `artifact` | Significant objects | The Sword of Truth, Memory Crystal | Events, Character possessions |
| `relationship` | Character connections | Rivals, Lovers, Mentor/Student | Characters, Conversations |
| `emotion` | Emotional states | Grief, Euphoria, Existential Dread | Character states, Events, Conversations |
| `phrase` | Recurring expressions | "As the prophecy foretold" | Conversations, Notes |
| `era` | Time periods | The Great Calamity, The Rebuilding | Timeline sections, Events |
| `philosophical` | Philosophical stances | Determinism vs. Free Will | Character beliefs, Conversations |

#### Cross-Reference Query Examples

The tag system allows authors to perform complex queries across their story universe:

1. **Thematic Progression**
   - Find all events tagged with "redemption" across multiple timelines
   - Track how the "sacrifice" theme appears across different character arcs

2. **Symbolic Coherence**
   - Identify all appearances of the "broken mirror" symbol
   - See which characters are associated with "fire" symbolism

3. **Character Development**
   - Find all conversations where a character discusses their "fear of abandonment"
   - Track shifts in a character's "philosophical stance" through events

4. **Narrative Pattern Analysis**
   - Identify where the "betrayal" tag appears in relation to the "revelation" tag
   - Map the progression of "corruption" to "redemption" across a character's timeline

This system provides authors with powerful tools for maintaining thematic coherence and tracking complex narrative patterns across extensively developed story worlds.

### Tagged Item

Creates many-to-many relationships between tags and taggable entities.

**Database Fields:**
```
TaggedItem {
  id: UUID (Primary Key)
  tagId: UUID (Foreign Key to Tag)
  itemId: UUID
  itemType: String
  createdAt: DateTime
}
```

**Relationships:**
- Belongs to a `Tag`
- Polymorphic relationships to various entities (Character, Conversation, Timeline, TimelineEvent, Note)

The `TaggedItem` entity implements a polymorphic many-to-many relationship, allowing any entity to be tagged with any number of tags.

## Application Settings

### User Settings

Stores user preferences and application configuration.

**Database Fields:**
```
UserSettings {
  id: UUID (Primary Key)
  theme: String (default: 'light')
  llmProvider: String (default: 'openai')
  llmModel: String (default: 'gpt-4')
  maxMemoriesPerCall: Integer (default: 10)
  apiKeys: Bytes (nullable, encrypted)
  lastBackup: DateTime (nullable)
  updatedAt: DateTime
}
```

### Export Templates

Defines templates for exporting data to external formats.

**Database Fields:**
```
ExportTemplate {
  id: UUID (Primary Key)
  name: String
  format: String
  template: String
  description: String (nullable)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Export Format Examples

The application supports exporting data to various formats for use in external writing tools:

#### Character Export (Markdown/Obsidian Format)

```markdown
# Professor Elias Thornfield

## Core Traits
- **Intellectual**: 85/100
- **Skeptical**: 70/100
- **Compassionate**: 65/100
- **Detail-oriented**: 90/100

## Voice
Formal, precise, with occasional philosophical tangents. Uses academic vocabulary with metaphorical flourishes when discussing ethics.

## Background
A quantum physicist who accidentally discovered time travel but is haunted by the ethical implications of his work.

### Formative Events
- **Age 12**: Witnessed father's research being weaponized against his wishes
- **Age 23**: Discovery of a fundamental principle during an accident

## Values
- Scientific integrity
- Ethical responsibility
- Intellectual curiosity

## Key Relationships
- **Dr. Eleanor Voss**: Mentor, later rival (Estranged)
- **Maria Thornfield**: Wife, fellow researcher (Deceased)

## Arc
Currently struggling with balancing scientific pursuit with human connection after losing his wife. Learning to reopen to emotional vulnerability.

## Timeline Appearances
- [[Timeline - Main Universe]]
  - [[Event - Quantum Breakthrough Discovery]]
  - [[Event - University Ethics Committee Hearing]]
  - [[Event - First Successful Time Experiment]]

## Related Characters
- [[Character - Dr. Sarah Chen]] (Assistant researcher)
- [[Character - Director Malcolm Wells]] (Government oversight)

## Associated Tags
- #theme/ethics
- #theme/grief
- #symbol/clock
- #motif/unintended-consequences

## Recent Conversations
- [[Conversation - Ethics of Altering Past Events]]
- [[Conversation - Reconciling with Eleanor]]

## Notes
Character serves as the moral center of the story, embodying the conflict between scientific progress and ethical restraint. His arc explores healing from grief while taking responsibility for technological power.
```

#### Multiple-Export Format (Scrivener)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ScrivenerProject>
  <Characters>
    <Character ID="char123">
      <Title>Professor Elias Thornfield</Title>
      <Synopsis>Quantum physicist haunted by ethical implications of time travel</Synopsis>
      <Notes>
        <Section Title="Personality">
          <Paragraph>Intellectual, skeptical, compassionate, detail-oriented</Paragraph>
        </Section>
        <Section Title="Voice">
          <Paragraph>Formal, precise, with occasional philosophical tangents</Paragraph>
        </Section>
        <Section Title="Arc">
          <Paragraph>Learning to reopen to emotional vulnerability after loss</Paragraph>
        </Section>
        <Section Title="Timeline Points">
          <ListItem>Quantum Breakthrough Discovery</ListItem>
          <ListItem>University Ethics Committee Hearing</ListItem>
          <ListItem>First Successful Time Experiment</ListItem>
        </Section>
      </Notes>
      <Keywords>
        <Keyword>ethics</Keyword>
        <Keyword>grief</Keyword>
        <Keyword>science</Keyword>
      </Keywords>
    </Character>
  </Characters>
  
  <Timeline>
    <Event ID="event345">
      <Title>Quantum Breakthrough Discovery</Title>
      <Date>2031-03-15</Date>
      <Synopsis>Elias discovers the quantum principle that makes time manipulation possible</Synopsis>
      <Characters>
        <CharacterRef ID="char123" Role="Protagonist" />
        <CharacterRef ID="char456" Role="Witness" />
      </Characters>
      <Keywords>
        <Keyword>discovery</Keyword>
        <Keyword>turning point</Keyword>
      </Keywords>
    </Event>
  </Timeline>
  
  <Conversations>
    <Conversation ID="conv789">
      <Title>Ethics of Altering Past Events</Title>
      <Synopsis>Debate on moral implications of changing timeline</Synopsis>
      <Messages>
        <Message CharacterID="char123">The mathematics may allow it, but our moral framework hasn't evolved to handle the implications of causality violation.</Message>
        <Message CharacterID="char456">But if we could prevent great suffering, don't we have an obligation to act?</Message>
        <Message CharacterID="char123">Playing god with time has consequences we cannot predict. The hubris of believing we know better than the natural order...</Message>
      </Messages>
      <Keywords>
        <Keyword>ethics</Keyword>
        <Keyword>time travel</Keyword>
        <Keyword>philosophy</Keyword>
      </Keywords>
    </Conversation>
  </Conversations>
</ScrivenerProject>
```

This structured export approach ensures that the rich data from the AI Character Council can be integrated with authors' existing writing workflows and tools.

## JSON Schemas

### Character Personality Traits Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "core": {
      "type": "object",
      "properties": {
        "traits": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "value": { "type": "integer", "minimum": 0, "maximum": 100 }
            },
            "required": ["name", "value"]
          }
        },
        "values": {
          "type": "array",
          "items": { "type": "string" }
        },
        "drivingMotivations": {
          "type": "array",
          "items": { "type": "string" }
        },
        "fears": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "required": ["traits", "values", "drivingMotivations"]
    },
    "voice": {
      "type": "object",
      "properties": {
        "speechPattern": { "type": "string" },
        "vocabulary": { "type": "string" },
        "commonPhrases": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "required": ["speechPattern"]
    },
    "background": {
      "type": "object",
      "properties": {
        "formativeEvents": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "age": { "type": ["integer", "string"] },
              "description": { "type": "string" },
              "impact": { "type": "string" }
            },
            "required": ["description", "impact"]
          }
        },
        "education": {
          "type": "array",
          "items": { "type": "string" }
        },
        "significantRelationships": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "nature": { "type": "string" },
              "status": { "type": "string" }
            },
            "required": ["name", "nature"]
          }
        }
      }
    },
    "worldview": {
      "type": "object",
      "properties": {
        "beliefs": {
          "type": "array",
          "items": { "type": "string" }
        },
        "philosophicalStance": { "type": "string" },
        "moralFramework": { "type": "string" }
      }
    },
    "behavioralTendencies": {
      "type": "object",
      "properties": {
        "underStress": {
          "type": "array",
          "items": { "type": "string" }
        },
        "whenComfortable": {
          "type": "array",
          "items": { "type": "string" }
        },
        "decisionMakingStyle": { "type": "string" }
      }
    },
    "characterGrowth": {
      "type": "object",
      "properties": {
        "arcs": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "theme": { "type": "string" },
              "currentStage": { "type": "string" },
              "potentialFuture": { "type": "string" }
            },
            "required": ["theme", "currentStage"]
          }
        },
        "unresolved": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "llmGuidance": {
      "type": "object",
      "properties": {
        "importantNotes": { "type": "string" },
        "voiceExamples": {
          "type": "array",
          "items": { "type": "string" }
        },
        "avoidances": { "type": "string" }
      }
    }
  },
  "required": ["core", "voice", "worldview"]
}
```

### Character Sheet Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "physical": {
      "type": "object",
      "properties": {
        "appearance": { "type": "string" },
        "age": { "type": ["integer", "string"] },
        "height": { "type": "string" },
        "build": { "type": "string" },
        "distinguishingFeatures": {
          "type": "array",
          "items": { "type": "string" }
        },
        "mannerisms": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "social": {
      "type": "object",
      "properties": {
        "occupation": { "type": "string" },
        "socialStatus": { "type": "string" },
        "family": {
          "type": "array",
          "items": { 
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "relationship": { "type": "string" },
              "details": { "type": "string" }
            },
            "required": ["name", "relationship"]
          }
        },
        "allies": {
          "type": "array",
          "items": { "type": "string" }
        },
        "enemies": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "psychological": {
      "type": "object",
      "properties": {
        "desires": {
          "type": "array",
          "items": { "type": "string" }
        },
        "strengths": {
          "type": "array",
          "items": { "type": "string" }
        },
        "flaws": {
          "type": "array",
          "items": { "type": "string" }
        },
        "secrets": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "abilities": {
      "type": "object",
      "properties": {
        "skills": {
          "type": "array",
          "items": { 
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "proficiency": { "type": "string" }
            },
            "required": ["name", "proficiency"]
          }
        },
        "knowledge": {
          "type": "array",
          "items": { "type": "string" }
        },
        "specialAbilities": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "narrative": {
      "type": "object",
      "properties": {
        "role": { "type": "string" },
        "arc": { "type": "string" },
        "pastIncarnations": {
          "type": "array",
          "items": { 
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "era": { "type": "string" },
              "keyTraits": { "type": "array", "items": { "type": "string" } }
            },
            "required": ["name"]
          }
        },
        "thematicElements": {
          "type": "array",
          "items": { "type": "string" }
        },
        "symbolism": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "custom": {
      "type": "object",
      "additionalProperties": true
    }
  }
}
```

### Conversation Message Metadata Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "emotion": { "type": "string" },
    "context": { "type": "string" },
    "relevantMemories": {
      "type": "array",
      "items": { "type": "string" }
    },
    "keyInsights": {
      "type": "array",
      "items": { "type": "string" }
    },
    "authorNotes": { "type": "string" },
    "processMetrics": {
      "type": "object",
      "properties": {
        "tokensUsed": { "type": "integer" },
        "processingTime": { "type": "number" },
        "confidenceScore": { "type": "number" }
      }
    }
  }
}
```

### Timeline Event Metadata Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "significance": { 
      "type": "string",
      "enum": ["minor", "moderate", "major", "pivotal"]
    },
    "location": { "type": "string" },
    "symbolism": {
      "type": "array",
      "items": { "type": "string" }
    },
    "emotionalTone": { "type": "string" },
    "timeOfDay": { "type": "string" },
    "weather": { "type": "string" },
    "consequences": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "shortTerm": { "type": "string" },
          "longTerm": { "type": "string" }
        }
      }
    },
    "alternateOutcomes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "description": { "type": "string" },
          "probability": { "type": "string" },
          "linkedTimelineId": { "type": "string" }
        },
        "required": ["description"]
      }
    },
    "media": {
      "type": "object",
      "properties": {
        "images": {
          "type": "array",
          "items": { "type": "string" }
        },
        "notes": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  }
}
```

### Character Memory Metadata Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "type": { 
      "type": "string",
      "enum": ["interaction", "event", "knowledge", "belief", "relationship", "author-defined"]
    },
    "emotions": {
      "type": "array",
      "items": { "type": "string" }
    },
    "relatedCharacters": {
      "type": "array",
      "items": { "type": "string" }
    },
    "source": {
      "type": "object",
      "properties": {
        "type": { 
          "type": "string",
          "enum": ["conversation", "timeline", "author-defined"]
        },
        "id": { "type": "string" },
        "description": { "type": "string" }
      },
      "required": ["type"]
    },
    "accessibility": {
      "type": "object",
      "properties": {
        "conscious": { "type": "boolean" },
        "suppressionReason": { "type": "string" },
        "triggerConditions": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  },
  "required": ["type"]
}
```

## Vector Storage Model

The vector storage model enables semantic search of character memories and other textual content.

### Memory Embedding Process

1. **Text Preprocessing**
   - Memory content is processed to extract key semantic information
   - Text normalization and tokenization prepare content for embedding

2. **Vector Embedding**
   - Embedding models convert text to high-dimensional vectors
   - These vectors capture semantic meaning, enabling similarity search
   - Typical dimension: 384 or 768 elements per embedding

3. **Storage Strategy**
   - Vectors are stored alongside the original text in the database
   - The application uses vector similarity search to find related memories

### Retrieval Process

1. **Query Embedding**
   - User input or conversation content is converted to the same vector space

2. **Similarity Search**
   - Cosine similarity or other distance metrics identify related content
   - Results are ranked by relevance score

3. **Filtering and Weighting**
   - Results are filtered by character, recency, importance, etc.
   - Weighting algorithms balance semantic relevance with other factors

4. **Context Assembly**
   - Retrieved memories are assembled into context for the LLM
   - Context is structured to maximize the relevance of the LLM's response

This vector storage approach allows characters to have a form of semantic memory, where they can recall information based on meaning rather than just keywords.

## Conclusion

The data models for the AI Character Council application have been designed to address the unique and complex requirements of speculative fiction authors while maintaining technical efficiency and flexibility. Key design considerations include:

### Technical Considerations

1. **Balance of Structured and Unstructured Data**
   - Relational database for entity relationships and structured data
   - JSON fields for complex, nested character attributes and flexible metadata
   - Vector storage for semantic memory and retrieval

2. **Scalability**
   - Optimized for managing large numbers of characters across multiple projects
   - Efficient memory retrieval through vector similarity and importance weighting
   - Pagination and lazy loading design patterns for UI performance

3. **Data Integrity**
   - Consistent foreign key relationships to maintain referential integrity
   - Version tracking for character transformations
   - Backup and export capabilities to prevent data loss

### Creative Considerations

1. **Character Consistency and Evolution**
   - Rich personality models that guide consistent LLM responses
   - Dynamic memory systems that allow characters to evolve naturally
   - Author controls for manually managing character knowledge and development

2. **Narrative Flexibility**
   - Support for complex multiverse or reincarnation-based storytelling
   - Timeline management across multiple reality variants
   - Character transformations with tracking of consistent and changing elements

3. **Creative Process Support**
   - Cross-referenced tagging system for thematic and symbolic tracking
   - Roundtable conversations for exploring character dynamics
   - Export options for integration with existing writing workflows

These data models lay the foundation for an application that treats characters as true creative partners - entities with consistent personalities, evolving memories, and complex relationships that can help authors explore and develop richer, more nuanced narratives across their fictional universes.