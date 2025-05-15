import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.lines as mlines
import numpy as np

def create_llm_integration_diagram():
    # Create figure and axis
    fig, ax = plt.subplots(figsize=(14, 10))
    
    # Define component colors
    colors = {
        'app': '#E0F0FF',          # Light Blue
        'local': '#E0FFE0',        # Light Green
        'cloud': '#FFE0E0',        # Light Red
        'database': '#FFFFD0',     # Light Yellow
        'processing': '#E0E0FF',   # Light Purple
        'character': '#F0E0FF'     # Light Magenta
    }
    
    # Main application components
    app_box = mpatches.Rectangle((0.1, 0.8), 0.8, 0.1, 
                             linewidth=1, edgecolor='black', 
                             facecolor=colors['app'], alpha=0.8)
    ax.add_patch(app_box)
    ax.text(0.5, 0.85, "AI Character Council Application", ha='center', va='center', 
            fontsize=14, fontweight='bold')
    
    # Character Engine
    character_box = mpatches.Rectangle((0.25, 0.65), 0.5, 0.1, 
                                  linewidth=1, edgecolor='black', 
                                  facecolor=colors['character'], alpha=0.8)
    ax.add_patch(character_box)
    ax.text(0.5, 0.7, "Character Engine", ha='center', va='center', 
            fontsize=12, fontweight='bold')
    ax.text(0.5, 0.675, "Personality Management, Context Assembly, Response Processing", 
            ha='center', va='center', fontsize=9)
    
    # Local components
    local_embedding_box = mpatches.Rectangle((0.1, 0.4), 0.25, 0.2, 
                                        linewidth=1, edgecolor='black', 
                                        facecolor=colors['local'], alpha=0.8)
    ax.add_patch(local_embedding_box)
    ax.text(0.225, 0.5, "Local Embedding Engine", ha='center', va='center', 
            fontsize=11, fontweight='bold')
    ax.text(0.225, 0.465, "- Memory Encoding", ha='center', va='center', fontsize=9)
    ax.text(0.225, 0.44, "- Semantic Search", ha='center', va='center', fontsize=9)
    ax.text(0.225, 0.415, "- Relevance Ranking", ha='center', va='center', fontsize=9)
    
    local_llm_box = mpatches.Rectangle((0.1, 0.15), 0.25, 0.2, 
                                  linewidth=1, edgecolor='black', 
                                  facecolor=colors['local'], alpha=0.8)
    ax.add_patch(local_llm_box)
    ax.text(0.225, 0.25, "Local Fallback LLM", ha='center', va='center', 
            fontsize=11, fontweight='bold')
    ax.text(0.225, 0.215, "- Offline Operation", ha='center', va='center', fontsize=9)
    ax.text(0.225, 0.19, "- Basic Responses", ha='center', va='center', fontsize=9)
    ax.text(0.225, 0.165, "- Llama/Mistral Models", ha='center', va='center', fontsize=9)
    
    # Cloud components
    cloud_llm_box = mpatches.Rectangle((0.65, 0.4), 0.25, 0.2, 
                                  linewidth=1, edgecolor='black', 
                                  facecolor=colors['cloud'], alpha=0.8)
    ax.add_patch(cloud_llm_box)
    ax.text(0.775, 0.5, "Cloud LLM Connector", ha='center', va='center', 
            fontsize=11, fontweight='bold')
    ax.text(0.775, 0.465, "- Primary Response Generation", ha='center', va='center', fontsize=9)
    ax.text(0.775, 0.44, "- Advanced Character Dialogue", ha='center', va='center', fontsize=9)
    ax.text(0.775, 0.415, "- API Key Management", ha='center', va='center', fontsize=9)
    
    cloud_api_box = mpatches.Rectangle((0.65, 0.15), 0.25, 0.2, 
                                  linewidth=1, edgecolor='black', 
                                  facecolor=colors['cloud'], alpha=0.8)
    ax.add_patch(cloud_api_box)
    ax.text(0.775, 0.25, "External LLM APIs", ha='center', va='center', 
            fontsize=11, fontweight='bold')
    ax.text(0.775, 0.215, "- OpenAI GPT-4/3.5", ha='center', va='center', fontsize=9)
    ax.text(0.775, 0.19, "- Anthropic Claude", ha='center', va='center', fontsize=9)
    ax.text(0.775, 0.165, "- Alternative Providers", ha='center', va='center', fontsize=9)
    
    # Database component
    db_box = mpatches.Rectangle((0.375, 0.15), 0.25, 0.2, 
                            linewidth=1, edgecolor='black', 
                            facecolor=colors['database'], alpha=0.8)
    ax.add_patch(db_box)
    ax.text(0.5, 0.25, "Vector Database", ha='center', va='center', 
            fontsize=11, fontweight='bold')
    ax.text(0.5, 0.215, "- Memory Storage", ha='center', va='center', fontsize=9)
    ax.text(0.5, 0.19, "- Conversation History", ha='center', va='center', fontsize=9)
    ax.text(0.5, 0.165, "- Character Data", ha='center', va='center', fontsize=9)
    
    # Processing component
    processing_box = mpatches.Rectangle((0.375, 0.4), 0.25, 0.2, 
                                   linewidth=1, edgecolor='black', 
                                   facecolor=colors['processing'], alpha=0.8)
    ax.add_patch(processing_box)
    ax.text(0.5, 0.5, "Context Processor", ha='center', va='center', 
            fontsize=11, fontweight='bold')
    ax.text(0.5, 0.465, "- Memory Selection", ha='center', va='center', fontsize=9)
    ax.text(0.5, 0.44, "- Prompt Engineering", ha='center', va='center', fontsize=9)
    ax.text(0.5, 0.415, "- Token Optimization", ha='center', va='center', fontsize=9)
    
    # Add connection arrows
    arrows = [
        # App to Character Engine
        (0.5, 0.8, 0.5, 0.75),
        
        # Character Engine to components
        (0.3, 0.65, 0.225, 0.6),  # To Local Embedding
        (0.5, 0.65, 0.5, 0.6),    # To Context Processor
        (0.7, 0.65, 0.775, 0.6),  # To Cloud LLM
        
        # Local Embedding to Vector DB
        (0.225, 0.4, 0.225, 0.35),
        (0.225, 0.35, 0.375, 0.25),
        
        # Context Processor to Vector DB
        (0.5, 0.4, 0.5, 0.35),
        
        # Cloud LLM to External APIs
        (0.775, 0.4, 0.775, 0.35),
        
        # Database to Local Fallback
        (0.375, 0.25, 0.35, 0.25),
        
        # Local Fallback to Character Engine (fallback path)
        (0.225, 0.35, 0.225, 0.55),
        (0.225, 0.55, 0.35, 0.65),
        
        # Cloud API to Character Engine
        (0.775, 0.35, 0.775, 0.55),
        (0.775, 0.55, 0.65, 0.65),
    ]
    
    for x1, y1, x2, y2 in arrows:
        ax.arrow(x1, y1, x2-x1, y2-y1, head_width=0.02, head_length=0.02, 
                fc='black', ec='black', length_includes_head=True)
    
    # Add data flow annotations
    ax.text(0.35, 0.57, "Character\nDefinition", ha='center', va='center', 
            fontsize=8, rotation=45)
    ax.text(0.65, 0.57, "Response\nGeneration", ha='center', va='center', 
            fontsize=8, rotation=-45)
    ax.text(0.25, 0.32, "Memory\nRetrieval", ha='center', va='center', 
            fontsize=8, rotation=90)
    ax.text(0.775, 0.32, "API\nRequests", ha='center', va='center', 
            fontsize=8, rotation=90)
    
    # Add legend for hybrid approach
    hybrid_text = "HYBRID LLM APPROACH\n\n• Cloud LLMs for quality character responses\n• Local embeddings for memory and semantic search\n• Fallback to local models when offline\n• Cost optimization through tiered usage"
    ax.text(0.5, 0.05, hybrid_text, ha='center', va='center', 
            fontsize=11, fontweight='bold', bbox=dict(facecolor='white', alpha=0.7, 
                                                     boxstyle='round,pad=0.5'))
    
    # Add legend
    legend_elements = [
        mpatches.Patch(color=colors['app'], alpha=0.8, label='Application Layer'),
        mpatches.Patch(color=colors['character'], alpha=0.8, label='Character Engine'),
        mpatches.Patch(color=colors['local'], alpha=0.8, label='Local Processing'),
        mpatches.Patch(color=colors['cloud'], alpha=0.8, label='Cloud Services'),
        mpatches.Patch(color=colors['database'], alpha=0.8, label='Data Storage'),
        mpatches.Patch(color=colors['processing'], alpha=0.8, label='Context Processing')
    ]
    ax.legend(handles=legend_elements, loc='upper center', bbox_to_anchor=(0.5, 0.97),
              ncol=3, fontsize=9)
    
    # Set title and layout
    ax.set_title('AI Character Council - Hybrid LLM Integration Architecture', fontsize=16, fontweight='bold')
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('/workspace/docs/diagrams/llm_integration_architecture.png', dpi=300, bbox_inches='tight')
    print("LLM integration architecture diagram created and saved to /workspace/docs/diagrams/llm_integration_architecture.png")

if __name__ == "__main__":
    create_llm_integration_diagram()