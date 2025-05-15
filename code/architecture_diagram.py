import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
from matplotlib.path import Path

def create_architecture_diagram():
    # Create figure and axis
    fig, ax = plt.subplots(figsize=(12, 10))
    
    # Define component colors
    colors = {
        'ui': '#4C9BE8',        # Blue
        'core': '#5DBB63',      # Green
        'database': '#F7C04B',  # Yellow/Gold
        'ai': '#E85D5D',        # Red
        'external': '#B19CD9',  # Purple
        'utility': '#78C2AD'    # Teal
    }
    
    # Component definitions with [x, y, width, height, color, label]
    components = [
        # UI Layer
        [0.15, 0.8, 0.7, 0.15, colors['ui'], 'UI Layer\n(Electron Renderer - React/TypeScript)'],
        
        # Core Components
        [0.15, 0.55, 0.15, 0.20, colors['core'], 'Character\nManager'],
        [0.35, 0.55, 0.15, 0.20, colors['core'], 'Timeline\nSystem'],
        [0.55, 0.55, 0.15, 0.20, colors['core'], 'Notes &\nTags System'],
        [0.75, 0.55, 0.15, 0.20, colors['core'], 'Export\nSystem'],
        
        # AI Engine
        [0.15, 0.25, 0.35, 0.25, colors['ai'], 'AI Character Engine\n(LangChain.js)'],
        [0.55, 0.25, 0.35, 0.25, colors['utility'], 'Visualization Engine\n(D3.js)'],
        
        # Database
        [0.15, 0.05, 0.7, 0.15, colors['database'], 'Database Layer\n(SQLite + Prisma ORM)'],
        
        # External Services
        [0.9, 0.25, 0.15, 0.3, colors['external'], 'External\nLLM APIs'],
        [0.9, 0.6, 0.15, 0.3, colors['external'], 'Export\nDestinations']
    ]
    
    # Draw components
    for x, y, w, h, color, label in components:
        rect = mpatches.Rectangle((x, y), w, h, linewidth=1, edgecolor='black', facecolor=color, alpha=0.8)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h/2, label, ha='center', va='center', fontsize=9, fontweight='bold')
    
    # Add arrows for connections
    arrows = [
        # UI to Core
        [0.5, 0.8, 0.5, 0.75],
        
        # Core to AI and Visualization
        [0.3, 0.55, 0.3, 0.5],
        [0.42, 0.55, 0.42, 0.5],
        [0.6, 0.55, 0.6, 0.5],
        [0.72, 0.55, 0.72, 0.5],
        
        # AI to Database
        [0.3, 0.25, 0.3, 0.2],
        [0.7, 0.25, 0.7, 0.2],
        
        # AI to External
        [0.5, 0.35, 0.9, 0.35],
        
        # Export to External
        [0.8, 0.65, 0.9, 0.65]
    ]
    
    for x1, y1, x2, y2 in arrows:
        ax.arrow(x1, y1, x2-x1, y2-y1, head_width=0.02, head_length=0.02, 
                fc='black', ec='black', length_includes_head=True)
    
    # Add legend
    legend_elements = [
        mpatches.Patch(color=colors['ui'], alpha=0.8, label='UI Layer'),
        mpatches.Patch(color=colors['core'], alpha=0.8, label='Core Components'),
        mpatches.Patch(color=colors['ai'], alpha=0.8, label='AI Engine'),
        mpatches.Patch(color=colors['utility'], alpha=0.8, label='Utility Engines'),
        mpatches.Patch(color=colors['database'], alpha=0.8, label='Database Layer'),
        mpatches.Patch(color=colors['external'], alpha=0.8, label='External Services')
    ]
    ax.legend(handles=legend_elements, loc='upper center', bbox_to_anchor=(0.5, 0.02),
              ncol=3, fontsize=9)
    
    # Set title and layout
    ax.set_title('AI Character Council - System Architecture', fontsize=14, fontweight='bold')
    ax.set_xlim(0, 1.1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('/workspace/docs/diagrams/system_architecture.png', dpi=300, bbox_inches='tight')
    print("Architecture diagram created and saved to /workspace/docs/diagrams/system_architecture.png")

if __name__ == "__main__":
    create_architecture_diagram()