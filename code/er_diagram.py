import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.lines as mlines
import numpy as np

def create_er_diagram():
    # Create figure and axis
    fig, ax = plt.subplots(figsize=(14, 12))
    
    # Define entity colors
    colors = {
        'primary': '#4C9BE8',    # Blue
        'secondary': '#5DBB63',  # Green
        'tertiary': '#F7C04B',   # Yellow/Gold
        'support': '#E85D5D',    # Red
    }
    
    # Define entities with position, size, color, name, and fields
    entities = [
        # Primary entities
        [0.1, 0.80, 0.15, 0.15, colors['primary'], 'Project', [
            'id: UUID', 'name: String', 'description: String', 'settings: JSON'
        ]],
        [0.1, 0.50, 0.15, 0.20, colors['primary'], 'Character', [
            'id: UUID', 'projectId: UUID', 'name: String', 'bio: String', 
            'personalityTraits: JSON', 'characterSheet: JSON'
        ]],
        [0.55, 0.80, 0.15, 0.15, colors['primary'], 'Conversation', [
            'id: UUID', 'projectId: UUID', 'title: String', 'summary: String'
        ]],
        [0.55, 0.50, 0.15, 0.20, colors['primary'], 'Timeline', [
            'id: UUID', 'projectId: UUID', 'name: String', 'description: String'
        ]],
        
        # Secondary entities
        [0.35, 0.50, 0.15, 0.20, colors['secondary'], 'CharacterVersion', [
            'id: UUID', 'characterId: UUID', 'versionName: String', 'data: JSON'
        ]],
        [0.80, 0.80, 0.15, 0.15, colors['secondary'], 'ConversationMessage', [
            'id: UUID', 'conversationId: UUID', 'characterId: UUID', 
            'role: String', 'content: String', 'metadata: JSON'
        ]],
        [0.80, 0.50, 0.15, 0.20, colors['secondary'], 'TimelineEvent', [
            'id: UUID', 'timelineId: UUID', 'title: String', 
            'date: String', 'order: Int', 'metadata: JSON'
        ]],
        
        # Tertiary entities
        [0.10, 0.20, 0.15, 0.15, colors['tertiary'], 'CharacterMemory', [
            'id: UUID', 'characterId: UUID', 'content: String', 
            'importance: Float', 'embedding: Bytes', 'metadata: JSON'
        ]],
        [0.35, 0.20, 0.15, 0.15, colors['tertiary'], 'CharacterEventLink', [
            'id: UUID', 'characterId: UUID', 'eventId: UUID', 
            'role: String', 'notes: String'
        ]],
        
        # Support entities
        [0.60, 0.20, 0.15, 0.15, colors['support'], 'Note', [
            'id: UUID', 'projectId: UUID', 'title: String', 'content: String'
        ]],
        [0.85, 0.20, 0.15, 0.15, colors['support'], 'Tag', [
            'id: UUID', 'projectId: UUID', 'name: String', 
            'type: String', 'color: String'
        ]],
        [0.35, 0.05, 0.30, 0.10, colors['tertiary'], 'TaggedItem', [
            'id: UUID', 'tagId: UUID', 'itemId: UUID', 'itemType: String'
        ]],
    ]
    
    # Draw entities
    for x, y, w, h, color, name, fields in entities:
        # Create entity box
        rect = mpatches.Rectangle((x, y), w, h, linewidth=1, 
                                 edgecolor='black', facecolor=color, alpha=0.7)
        ax.add_patch(rect)
        
        # Add entity name
        ax.text(x + w/2, y + h - 0.01, name, ha='center', va='top', 
                fontsize=12, fontweight='bold')
        
        # Add line below entity name
        line = mlines.Line2D([x, x+w], [y + h - 0.03, y + h - 0.03], 
                            color='black', linewidth=1)
        ax.add_line(line)
        
        # Add fields
        for i, field in enumerate(fields):
            field_y = y + h - 0.04 - (i + 1) * 0.02
            ax.text(x + 0.01, field_y, field, ha='left', va='center', fontsize=8)
    
    # Define relationships with start entity index, end entity index, and relationship type
    # Relationship types: '1-to-many', 'many-to-many', '1-to-1'
    relationships = [
        # Project relationships
        (0, 1, '1-to-many'),  # Project to Character
        (0, 2, '1-to-many'),  # Project to Conversation
        (0, 3, '1-to-many'),  # Project to Timeline
        (0, 9, '1-to-many'),  # Project to Note
        (0, 10, '1-to-many'), # Project to Tag
        
        # Character relationships
        (1, 4, '1-to-many'),  # Character to CharacterVersion
        (1, 7, '1-to-many'),  # Character to CharacterMemory
        (1, 8, '1-to-many'),  # Character to CharacterEventLink
        (1, 5, '1-to-many'),  # Character to ConversationMessage (optional)
        
        # Conversation relationships
        (2, 5, '1-to-many'),  # Conversation to ConversationMessage
        
        # Timeline relationships
        (3, 6, '1-to-many'),  # Timeline to TimelineEvent
        
        # TimelineEvent relationships
        (6, 8, '1-to-many'),  # TimelineEvent to CharacterEventLink
        
        # Tag relationships
        (10, 11, '1-to-many'), # Tag to TaggedItem
        
        # TaggedItem polymorphic relationships (simplified)
        (1, 11, '1-to-many'),  # Character to TaggedItem
        (2, 11, '1-to-many'),  # Conversation to TaggedItem
        (3, 11, '1-to-many'),  # Timeline to TaggedItem
        (6, 11, '1-to-many'),  # TimelineEvent to TaggedItem
        (9, 11, '1-to-many'),  # Note to TaggedItem
    ]
    
    # Draw relationships
    for start_idx, end_idx, rel_type in relationships:
        start_entity = entities[start_idx]
        end_entity = entities[end_idx]
        
        # Get entity centers
        start_x = start_entity[0] + start_entity[2]/2
        start_y = start_entity[1] + start_entity[3]/2
        end_x = end_entity[0] + end_entity[2]/2
        end_y = end_entity[1] + end_entity[3]/2
        
        # Adjust connection points to entity borders
        dx = end_x - start_x
        dy = end_y - start_y
        
        # Normalize direction vector
        length = np.sqrt(dx**2 + dy**2)
        if length > 0:
            udx, udy = dx/length, dy/length
        else:
            udx, udy = 0, 0
            
        # Calculate border intersection points
        if abs(udx) > abs(udy):
            # Horizontal dominant
            if udx > 0:
                start_x = start_entity[0] + start_entity[2]
                end_x = end_entity[0]
            else:
                start_x = start_entity[0]
                end_x = end_entity[0] + end_entity[2]
                
            t_start = (start_x - (start_entity[0] + start_entity[2]/2)) / udx
            start_y = (start_entity[1] + start_entity[3]/2) + udy * t_start
            
            t_end = (end_x - (end_entity[0] + end_entity[2]/2)) / udx
            end_y = (end_entity[1] + end_entity[3]/2) + udy * t_end
        else:
            # Vertical dominant
            if udy > 0:
                start_y = start_entity[1] + start_entity[3]
                end_y = end_entity[1]
            else:
                start_y = start_entity[1]
                end_y = end_entity[1] + end_entity[3]
                
            t_start = (start_y - (start_entity[1] + start_entity[3]/2)) / udy
            start_x = (start_entity[0] + start_entity[2]/2) + udx * t_start
            
            t_end = (end_y - (end_entity[1] + end_entity[3]/2)) / udy
            end_x = (end_entity[0] + end_entity[2]/2) + udx * t_end
        
        # Draw relationship line
        ax.plot([start_x, end_x], [start_y, end_y], color='black', linestyle='-', linewidth=1)
        
        # Draw relationship symbols
        if rel_type == '1-to-many':
            # Draw "1" on start entity side
            one_x = start_x + udx * 0.02
            one_y = start_y + udy * 0.02
            ax.text(one_x, one_y, "1", ha='center', va='center', fontsize=8)
            
            # Draw crow's foot on end entity side
            # Recalculate direction for crow's foot
            dx = end_x - start_x
            dy = end_y - start_y
            length = np.sqrt(dx**2 + dy**2)
            udx, udy = dx/length, dy/length
            perpx, perpy = -udy, udx  # Perpendicular direction
            
            foot_size = 0.01
            # Draw the three lines of the crow's foot
            ax.plot([end_x, end_x - udx * foot_size], 
                   [end_y, end_y - udy * foot_size], color='black', linewidth=1)
            ax.plot([end_x, end_x - udx * foot_size + perpx * foot_size], 
                   [end_y, end_y - udy * foot_size + perpy * foot_size], color='black', linewidth=1)
            ax.plot([end_x, end_x - udx * foot_size - perpx * foot_size], 
                   [end_y, end_y - udy * foot_size - perpy * foot_size], color='black', linewidth=1)
    
    # Add legend
    legend_elements = [
        mpatches.Patch(color=colors['primary'], alpha=0.7, label='Primary Entities'),
        mpatches.Patch(color=colors['secondary'], alpha=0.7, label='Secondary Entities'),
        mpatches.Patch(color=colors['tertiary'], alpha=0.7, label='Relationship Entities'),
        mpatches.Patch(color=colors['support'], alpha=0.7, label='Support Entities')
    ]
    ax.legend(handles=legend_elements, loc='upper center', bbox_to_anchor=(0.5, 0.02),
              ncol=4, fontsize=10)
    
    # Set title and layout
    ax.set_title('AI Character Council - Entity-Relationship Diagram', fontsize=14, fontweight='bold')
    ax.set_xlim(0, 1.05)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('/workspace/docs/diagrams/er_diagram.png', dpi=300, bbox_inches='tight')
    print("Entity-Relationship diagram created and saved to /workspace/docs/diagrams/er_diagram.png")

if __name__ == "__main__":
    create_er_diagram()