import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
from matplotlib.path import Path
import matplotlib.lines as mlines

def create_db_schema_diagram():
    # Create figure and axis
    fig, ax = plt.subplots(figsize=(12, 10))
    
    # Define table colors
    table_color = '#F7C04B'  # Yellow/Gold
    relation_color = '#B19CD9'  # Purple
    
    # Function to create a table box with fields
    def create_table(x, y, width, height, name, fields):
        # Create the table box
        rect = mpatches.Rectangle((x, y), width, height, linewidth=1, 
                                 edgecolor='black', facecolor=table_color, alpha=0.8)
        ax.add_patch(rect)
        
        # Add the table name
        ax.text(x + width/2, y + height - 0.02, name, ha='center', va='top', 
                fontsize=10, fontweight='bold')
        
        # Add a line below the table name
        line = mlines.Line2D([x, x+width], [y + height - 0.04, y + height - 0.04], 
                            color='black', linewidth=1)
        ax.add_line(line)
        
        # Add fields
        num_fields = len(fields)
        field_height = (height - 0.05) / num_fields
        
        for i, field in enumerate(fields):
            field_y = y + height - 0.05 - (i + 0.5) * field_height
            ax.text(x + 0.02, field_y, field, ha='left', va='center', fontsize=8)
    
    # Tables with their fields
    tables = [
        {
            'name': 'Character',
            'x': 0.1,
            'y': 0.7,
            'width': 0.25,
            'height': 0.25,
            'fields': [
                'id: UUID (PK)',
                'name: String',
                'bio: Text',
                'personalityTraits: JSON',
                'characterSheet: JSON',
                'createdAt: DateTime',
                'updatedAt: DateTime',
                'projectId: UUID (FK)',
                '...'
            ]
        },
        {
            'name': 'Project',
            'x': 0.1,
            'y': 0.3,
            'width': 0.25,
            'height': 0.2,
            'fields': [
                'id: UUID (PK)',
                'name: String',
                'description: Text',
                'settings: JSON',
                'createdAt: DateTime',
                'updatedAt: DateTime',
                '...'
            ]
        },
        {
            'name': 'Conversation',
            'x': 0.45,
            'y': 0.7,
            'width': 0.25,
            'height': 0.25,
            'fields': [
                'id: UUID (PK)',
                'title: String',
                'summary: Text',
                'createdAt: DateTime',
                'updatedAt: DateTime',
                'projectId: UUID (FK)',
                '...'
            ]
        },
        {
            'name': 'ConversationMessage',
            'x': 0.8,
            'y': 0.7,
            'width': 0.25,
            'height': 0.25,
            'fields': [
                'id: UUID (PK)',
                'role: String',
                'content: Text',
                'timestamp: DateTime',
                'characterId: UUID (FK)',
                'conversationId: UUID (FK)',
                '...'
            ]
        },
        {
            'name': 'Timeline',
            'x': 0.45,
            'y': 0.3,
            'width': 0.25,
            'height': 0.2,
            'fields': [
                'id: UUID (PK)',
                'name: String',
                'description: Text',
                'projectId: UUID (FK)',
                'createdAt: DateTime',
                'updatedAt: DateTime',
                '...'
            ]
        },
        {
            'name': 'TimelineEvent',
            'x': 0.8,
            'y': 0.3,
            'width': 0.25,
            'height': 0.2,
            'fields': [
                'id: UUID (PK)',
                'title: String',
                'description: Text',
                'date: String',
                'timelineId: UUID (FK)',
                '...'
            ]
        },
        {
            'name': 'Note',
            'x': 0.1,
            'y': 0.05,
            'width': 0.25,
            'height': 0.15,
            'fields': [
                'id: UUID (PK)',
                'title: String',
                'content: Text',
                'projectId: UUID (FK)',
                '...'
            ]
        },
        {
            'name': 'Tag',
            'x': 0.45,
            'y': 0.05,
            'width': 0.25,
            'height': 0.15,
            'fields': [
                'id: UUID (PK)',
                'name: String',
                'type: String',
                'projectId: UUID (FK)',
                '...'
            ]
        },
        {
            'name': 'CharacterEventLink',
            'x': 0.8,
            'y': 0.05,
            'width': 0.25,
            'height': 0.15,
            'fields': [
                'characterId: UUID (FK)',
                'eventId: UUID (FK)',
                'role: String',
                '...'
            ]
        }
    ]
    
    # Draw all tables
    for table in tables:
        create_table(
            table['x'], 
            table['y'], 
            table['width'], 
            table['height'], 
            table['name'], 
            table['fields']
        )
    
    # Draw relationships
    relations = [
        # Project to Character
        (0.1+0.125, 0.5, 0.1+0.125, 0.7, 'one-to-many'),
        
        # Project to Conversation
        (0.35, 0.35, 0.45, 0.75, 'one-to-many'),
        
        # Character to ConversationMessage
        (0.35, 0.8, 0.8, 0.8, 'one-to-many'),
        
        # Conversation to ConversationMessage
        (0.7, 0.8, 0.8, 0.8, 'one-to-many'),
        
        # Project to Timeline
        (0.35, 0.4, 0.45, 0.4, 'one-to-many'),
        
        # Timeline to TimelineEvent
        (0.7, 0.4, 0.8, 0.4, 'one-to-many'),
        
        # Project to Note
        (0.225, 0.3, 0.225, 0.2, 'one-to-many'),
        
        # Project to Tag
        (0.3, 0.35, 0.5, 0.2, 'one-to-many'),
        
        # Character to CharacterEventLink
        (0.225, 0.7, 0.9, 0.2, 'one-to-many'),
        
        # TimelineEvent to CharacterEventLink
        (0.9, 0.3, 0.9, 0.2, 'one-to-many')
    ]
    
    # Draw the relationships
    for x1, y1, x2, y2, rel_type in relations:
        # Draw relation line
        ax.plot([x1, x2], [y1, y2], color='black', linestyle='-', linewidth=1)
        
        # Draw crow's foot for 'many' side
        if rel_type == 'one-to-many':
            # Determine direction of arrow to place crow's foot correctly
            dx, dy = x2 - x1, y2 - y1
            length = np.sqrt(dx**2 + dy**2)
            udx, udy = dx/length, dy/length
            
            # Draw crow's foot at x2, y2
            perpx, perpy = -udy, udx  # Perpendicular direction
            foot_size = 0.01
            
            # Draw the three lines of the crow's foot
            ax.plot([x2, x2 - udx * foot_size], [y2, y2 - udy * foot_size], color='black', linewidth=1)
            ax.plot([x2, x2 - udx * foot_size + perpx * foot_size], 
                   [y2, y2 - udy * foot_size + perpy * foot_size], color='black', linewidth=1)
            ax.plot([x2, x2 - udx * foot_size - perpx * foot_size], 
                   [y2, y2 - udy * foot_size - perpy * foot_size], color='black', linewidth=1)
    
    # Set title and layout
    ax.set_title('AI Character Council - Database Schema', fontsize=14, fontweight='bold')
    ax.set_xlim(0, 1.1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('/workspace/docs/diagrams/database_schema.png', dpi=300, bbox_inches='tight')
    print("Database schema diagram created and saved to /workspace/docs/diagrams/database_schema.png")

if __name__ == "__main__":
    create_db_schema_diagram()