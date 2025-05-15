import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.lines as mlines
import numpy as np

def create_character_memory_diagram():
    # Create figure and axis
    fig, ax = plt.subplots(figsize=(12, 9))
    
    # Define component colors
    colors = {
        'user': '#E0F0FF',
        'character': '#FFE0E0',
        'memory': '#E0FFE0',
        'context': '#FFFFD0',
        'llm': '#E0E0FF',
        'system': '#F0E0FF'
    }
    
    # Draw components
    
    # 1. Character Base Definition
    character_box = mpatches.Rectangle((0.1, 0.65), 0.3, 0.25, 
                                     linewidth=1, edgecolor='black', 
                                     facecolor=colors['character'], alpha=0.8)
    ax.add_patch(character_box)
    ax.text(0.25, 0.85, "Character Definition", ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(0.25, 0.80, "- Personality traits", ha='center', va='center', fontsize=9)
    ax.text(0.25, 0.77, "- Background", ha='center', va='center', fontsize=9)
    ax.text(0.25, 0.74, "- Voice", ha='center', va='center', fontsize=9)
    ax.text(0.25, 0.71, "- Worldview", ha='center', va='center', fontsize=9)
    ax.text(0.25, 0.68, "- Default memories", ha='center', va='center', fontsize=9)
    
    # 2. Memory Vector Database
    memory_box = mpatches.Rectangle((0.1, 0.2), 0.3, 0.3, 
                                  linewidth=1, edgecolor='black', 
                                  facecolor=colors['memory'], alpha=0.8)
    ax.add_patch(memory_box)
    ax.text(0.25, 0.45, "Character Memory", ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(0.25, 0.40, "Vector Database", ha='center', va='center', fontsize=10)
    ax.text(0.25, 0.35, "- Stored experiences", ha='center', va='center', fontsize=9)
    ax.text(0.25, 0.32, "- Weighted by importance", ha='center', va='center', fontsize=9)
    ax.text(0.25, 0.29, "- Recent vs. long-term", ha='center', va='center', fontsize=9)
    ax.text(0.25, 0.26, "- Emotional content", ha='center', va='center', fontsize=9)
    ax.text(0.25, 0.23, "- Source metadata", ha='center', va='center', fontsize=9)
    
    # 3. Context Builder
    context_box = mpatches.Rectangle((0.5, 0.45), 0.3, 0.25, 
                                   linewidth=1, edgecolor='black', 
                                   facecolor=colors['context'], alpha=0.8)
    ax.add_patch(context_box)
    ax.text(0.65, 0.65, "Context Builder", ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(0.65, 0.60, "Assembles LLM Prompt with:", ha='center', va='center', fontsize=9)
    ax.text(0.65, 0.56, "1. Character personality", ha='center', va='center', fontsize=9)
    ax.text(0.65, 0.53, "2. Relevant memories", ha='center', va='center', fontsize=9)
    ax.text(0.65, 0.50, "3. Conversation history", ha='center', va='center', fontsize=9)
    ax.text(0.65, 0.47, "4. User input", ha='center', va='center', fontsize=9)
    
    # 4. LLM Processor
    llm_box = mpatches.Rectangle((0.5, 0.2), 0.3, 0.15, 
                              linewidth=1, edgecolor='black', 
                              facecolor=colors['llm'], alpha=0.8)
    ax.add_patch(llm_box)
    ax.text(0.65, 0.275, "LLM Engine", ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(0.65, 0.24, "Generates character response", ha='center', va='center', fontsize=9)
    ax.text(0.65, 0.215, "based on provided context", ha='center', va='center', fontsize=9)
    
    # 5. User Interface
    user_box = mpatches.Rectangle((0.5, 0.75), 0.3, 0.15, 
                               linewidth=1, edgecolor='black', 
                               facecolor=colors['user'], alpha=0.8)
    ax.add_patch(user_box)
    ax.text(0.65, 0.825, "User Input", ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(0.65, 0.79, "Author's questions, prompts,", ha='center', va='center', fontsize=9)
    ax.text(0.65, 0.765, "or conversation with character", ha='center', va='center', fontsize=9)
    
    # 6. Memory Extractor
    memory_extractor_box = mpatches.Rectangle((0.9, 0.2), 0.2, 0.3, 
                                            linewidth=1, edgecolor='black', 
                                            facecolor=colors['system'], alpha=0.8)
    ax.add_patch(memory_extractor_box)
    ax.text(1.0, 0.45, "Memory Extractor", ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(1.0, 0.40, "Analyzes conversation", ha='center', va='center', fontsize=9)
    ax.text(1.0, 0.37, "for important", ha='center', va='center', fontsize=9)
    ax.text(1.0, 0.34, "information to store", ha='center', va='center', fontsize=9)
    ax.text(1.0, 0.31, "as new memories", ha='center', va='center', fontsize=9)
    ax.text(1.0, 0.28, "with importance", ha='center', va='center', fontsize=9)
    ax.text(1.0, 0.25, "scoring", ha='center', va='center', fontsize=9)
    
    # 7. Author Memory Controls
    memory_control_box = mpatches.Rectangle((0.9, 0.65), 0.2, 0.25, 
                                          linewidth=1, edgecolor='black', 
                                          facecolor='#FFE0B0', alpha=0.8)
    ax.add_patch(memory_control_box)
    ax.text(1.0, 0.85, "Author Controls", ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(1.0, 0.80, "Manual Memory", ha='center', va='center', fontsize=10)
    ax.text(1.0, 0.77, "Management:", ha='center', va='center', fontsize=10)
    ax.text(1.0, 0.73, "- Add memories", ha='center', va='center', fontsize=9)
    ax.text(1.0, 0.70, "- Delete memories", ha='center', va='center', fontsize=9)
    ax.text(1.0, 0.67, "- Adjust importance", ha='center', va='center', fontsize=9)
    
    # Add process flow arrows
    arrows = [
        # User to Context
        (0.65, 0.75, 0.65, 0.70),
        
        # Character to Context
        (0.40, 0.75, 0.50, 0.60),
        
        # Memory to Context
        (0.40, 0.35, 0.50, 0.50),
        
        # Context to LLM
        (0.65, 0.45, 0.65, 0.35),
        
        # LLM to Memory Extractor
        (0.80, 0.275, 0.90, 0.35),
        
        # Memory Extractor to Memory
        (0.90, 0.30, 0.40, 0.30),
        
        # Author Controls to Memory
        (0.90, 0.70, 0.40, 0.40)
    ]
    
    for x1, y1, x2, y2 in arrows:
        ax.arrow(x1, y1, x2-x1, y2-y1, head_width=0.02, head_length=0.02, 
                fc='black', ec='black', length_includes_head=True)
    
    # Add a big circular arrow for the feedback loop
    arc = mpatches.Arc((0.55, 0.5), 0.8, 0.6, angle=0, theta1=-40, theta2=220, 
                     linewidth=1.5, color='black', linestyle='--')
    ax.add_patch(arc)
    # Add arrowhead to the arc
    ax.arrow(0.32, 0.65, -0.02, 0.02, head_width=0.02, head_length=0.02, 
            fc='black', ec='black', length_includes_head=True)
    ax.text(0.35, 0.10, "Character Evolution Feedback Loop", ha='center', va='center', 
           fontsize=12, fontweight='bold', color='#444444')
    
    # Add legend
    legend_elements = [
        mpatches.Patch(color=colors['user'], alpha=0.8, label='User Interaction'),
        mpatches.Patch(color=colors['character'], alpha=0.8, label='Character Definition'),
        mpatches.Patch(color=colors['memory'], alpha=0.8, label='Memory System'),
        mpatches.Patch(color=colors['context'], alpha=0.8, label='Context Building'),
        mpatches.Patch(color=colors['llm'], alpha=0.8, label='LLM Processing'),
        mpatches.Patch(color=colors['system'], alpha=0.8, label='System Processing'),
    ]
    ax.legend(handles=legend_elements, loc='upper center', bbox_to_anchor=(0.5, 0.03),
              ncol=3, fontsize=9)
    
    # Set title and layout
    ax.set_title('AI Character Council - Character Memory & Evolution System', fontsize=14, fontweight='bold')
    ax.set_xlim(0, 1.2)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('/workspace/docs/diagrams/character_memory_system.png', dpi=300, bbox_inches='tight')
    print("Character memory system diagram created and saved to /workspace/docs/diagrams/character_memory_system.png")

if __name__ == "__main__":
    create_character_memory_diagram()