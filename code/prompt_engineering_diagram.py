import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.lines as mlines
import numpy as np

def create_prompt_engineering_diagram():
    # Create figure and axis
    fig, ax = plt.subplots(figsize=(14, 10))
    
    # Define component colors
    colors = {
        'character': '#E0F0FF',     # Light Blue
        'system': '#E0FFE0',        # Light Green
        'prompt': '#FFE0E0',        # Light Red
        'memory': '#FFFFD0',        # Light Yellow
        'llm': '#E0E0FF',           # Light Purple
        'response': '#F0E0FF'       # Light Magenta
    }
    
    # Main character data box
    char_box = mpatches.Rectangle((0.05, 0.7), 0.4, 0.25, 
                             linewidth=1, edgecolor='black', 
                             facecolor=colors['character'], alpha=0.8)
    ax.add_patch(char_box)
    ax.text(0.25, 0.92, "Character Data", ha='center', va='center', 
            fontsize=14, fontweight='bold')
    
    # Character data components
    char_components = [
        "Personality Traits:\n- Intellectual (85/100)\n- Skeptical (70/100)\n- Compassionate (65/100)",
        "Voice & Style:\n\"Formal, precise, with\noccasional philosophical tangents\"",
        "Background:\n\"Quantum physicist troubled\nby ethical implications of discoveries\"",
        "Values & Beliefs:\n- Scientific integrity\n- Ethical responsibility\n- Truth seeking"
    ]
    
    for i, comp in enumerate(char_components):
        y_pos = 0.88 - (i * 0.06)
        ax.text(0.25, y_pos, comp, ha='center', va='center', 
                fontsize=9, linespacing=1.3)
        if i < len(char_components) - 1:  # Add separator lines between components
            line = mlines.Line2D([0.07, 0.43], [0.88 - ((i+1) * 0.06) + 0.03, 0.88 - ((i+1) * 0.06) + 0.03], 
                                color='black', alpha=0.3, linestyle='-', linewidth=1)
            ax.add_line(line)
    
    # Prompt engineering system
    system_box = mpatches.Rectangle((0.55, 0.7), 0.4, 0.25, 
                               linewidth=1, edgecolor='black', 
                               facecolor=colors['system'], alpha=0.8)
    ax.add_patch(system_box)
    ax.text(0.75, 0.92, "Prompt Engineering System", ha='center', va='center', 
            fontsize=14, fontweight='bold')
    
    # Prompt engineering components
    system_components = [
        "Personality Mapping:\nTraits → LLM Parameters\ntemperature=0.7, top_p=0.9",
        "Voice Templates:\nFormalized speech patterns\nwith academic terminology",
        "Parameter Translation:\nWorldview → Response filtering\nValues → Ethical guardrails",
        "Pattern Recognition:\nSpeech → Examples\nBehavior → Instructions"
    ]
    
    for i, comp in enumerate(system_components):
        y_pos = 0.88 - (i * 0.06)
        ax.text(0.75, y_pos, comp, ha='center', va='center', 
                fontsize=9, linespacing=1.3)
        if i < len(system_components) - 1:  # Add separator lines
            line = mlines.Line2D([0.57, 0.93], [0.88 - ((i+1) * 0.06) + 0.03, 0.88 - ((i+1) * 0.06) + 0.03], 
                                color='black', alpha=0.3, linestyle='-', linewidth=1)
            ax.add_line(line)
    
    # Memory retrieval section
    memory_box = mpatches.Rectangle((0.05, 0.45), 0.4, 0.2, 
                              linewidth=1, edgecolor='black', 
                              facecolor=colors['memory'], alpha=0.8)
    ax.add_patch(memory_box)
    ax.text(0.25, 0.62, "Memory Retrieval System", ha='center', va='center', 
            fontsize=14, fontweight='bold')
    
    # Memory components
    memory_components = [
        "Relevant Memories:\n- \"Felt betrayed when research\nwas weaponized\" (0.9 importance)",
        "- \"Once told Maria that 'time is less\na river than a tapestry'\" (0.8)",
        "- \"Established three ethical principles\nfor time research\" (0.85)"
    ]
    
    for i, comp in enumerate(memory_components):
        y_pos = 0.57 - (i * 0.06)
        ax.text(0.25, y_pos, comp, ha='center', va='center', 
                fontsize=9, linespacing=1.3)
    
    # Conversation context
    conversation_box = mpatches.Rectangle((0.55, 0.45), 0.4, 0.2, 
                                    linewidth=1, edgecolor='black', 
                                    facecolor=colors['prompt'], alpha=0.8)
    ax.add_patch(conversation_box)
    ax.text(0.75, 0.62, "Conversation Context", ha='center', va='center', 
            fontsize=14, fontweight='bold')
    
    # Conversation components
    conversation_components = [
        "Recent Messages:\nUSER: \"Could we use time manipulation\nto prevent disasters?\"",
        "ELIAS: \"The mathematics allow it,\nbut the ethics are murky at best.\"",
        "Current Query:\nUSER: \"What if we could save\nmillions of lives?\""
    ]
    
    for i, comp in enumerate(conversation_components):
        y_pos = 0.57 - (i * 0.06)
        ax.text(0.75, y_pos, comp, ha='center', va='center', 
                fontsize=9, linespacing=1.3)
    
    # Generated prompt
    prompt_box = mpatches.Rectangle((0.1, 0.1), 0.8, 0.3, 
                              linewidth=1, edgecolor='black', 
                              facecolor=colors['llm'], alpha=0.8)
    ax.add_patch(prompt_box)
    ax.text(0.5, 0.37, "Generated LLM Prompt", ha='center', va='center', 
            fontsize=14, fontweight='bold')
    
    # Prompt text
    prompt_text = """You are roleplaying as Professor Elias Thornfield, a quantum physicist troubled by the ethical implications of his discoveries.

IMPORTANT CHARACTER TRAITS:
- Intellectual (85/100): You analyze problems deeply and value rational thought
- Skeptical (70/100): You question assumptions and require evidence
- Compassionate (65/100): Despite analytical nature, you care about human impact

VOICE & COMMUNICATION STYLE:
Formal, precise, with occasional philosophical tangents. You use academic terminology.
Examples: "The equations don't lie, but perhaps we've been asking them the wrong questions."

CORE VALUES & BELIEFS:
- Scientific integrity: Truth in research above personal gain
- Ethical responsibility: Scientists must consider consequences
- Truth seeking: Even uncomfortable truths must be faced

RELEVANT MEMORIES:
- You felt betrayed when your research was weaponized (Importance: 0.9)
- You once told Maria that "time is less a river than a tapestry" (Importance: 0.8)
- You established three ethical principles for time research (Importance: 0.9)

RECENT CONVERSATION:
USER: "Could we use time manipulation to prevent disasters?"
ELIAS: "The mathematics allow it, but the ethics are murky at best."
USER: "What if we could save millions of lives?"

RESPONSE AS PROFESSOR ELIAS THORNFIELD:"""
    
    ax.text(0.5, 0.22, prompt_text, ha='center', va='center', 
            fontsize=8, linespacing=1.2, family='monospace')
    
    # Add connection arrows
    arrows = [
        # Character Data to Prompt System
        (0.45, 0.82, 0.55, 0.82),
        
        # Character Data to Memory
        (0.25, 0.7, 0.25, 0.65),
        
        # Conversation to Prompt System
        (0.75, 0.45, 0.75, 0.7),
        
        # Memory to Generated Prompt
        (0.25, 0.45, 0.25, 0.4),
        (0.25, 0.4, 0.5, 0.4),
        
        # Prompt System to Generated Prompt
        (0.75, 0.7, 0.75, 0.4),
        
        # Generated Prompt to LLM (implied)
        (0.5, 0.1, 0.5, 0.05)
    ]
    
    for x1, y1, x2, y2 in arrows:
        ax.arrow(x1, y1, x2-x1, y2-y1, head_width=0.02, head_length=0.02, 
                fc='black', ec='black', length_includes_head=True)
    
    # Add LLM box (implied destination)
    llm_circle = plt.Circle((0.5, 0.02), 0.02, color='black', alpha=0.5)
    ax.add_artist(llm_circle)
    ax.text(0.5, 0.02, "LLM", ha='center', va='center', 
            color='white', fontsize=8, fontweight='bold')
    
    # Add character response
    response_box = mpatches.FancyBboxPatch((0.2, -0.05), 0.6, 0.05,
                                       boxstyle=mpatches.BoxStyle("Round", pad=0.02),
                                       linewidth=1, edgecolor='black', 
                                       facecolor=colors['response'], alpha=0.8)
    ax.add_patch(response_box)
    
    response_text = "The quantitative calculus might permit it, but we must weigh the moral dimensions..."
    ax.text(0.5, -0.025, response_text, ha='center', va='center', 
            fontsize=9, style='italic')
    
    # Add arrow from LLM to response
    ax.arrow(0.5, 0.0, 0.0, -0.02, head_width=0.02, head_length=0.01, 
            fc='black', ec='black', length_includes_head=True)
    
    # Add legend
    legend_elements = [
        mpatches.Patch(color=colors['character'], alpha=0.8, label='Character Definition'),
        mpatches.Patch(color=colors['system'], alpha=0.8, label='Prompt Engineering'),
        mpatches.Patch(color=colors['memory'], alpha=0.8, label='Memory System'),
        mpatches.Patch(color=colors['prompt'], alpha=0.8, label='Conversation Context'),
        mpatches.Patch(color=colors['llm'], alpha=0.8, label='Generated Prompt'),
        mpatches.Patch(color=colors['response'], alpha=0.8, label='Character Response')
    ]
    ax.legend(handles=legend_elements, loc='lower center', bbox_to_anchor=(0.5, -0.12),
              ncol=3, fontsize=9)
    
    # Set title and layout
    ax.set_title('AI Character Council - Prompt Engineering Process', fontsize=16, fontweight='bold')
    ax.set_xlim(0, 1)
    ax.set_ylim(-0.13, 1)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig('/workspace/docs/diagrams/prompt_engineering_process.png', dpi=300, bbox_inches='tight')
    print("Prompt engineering process diagram created and saved to /workspace/docs/diagrams/prompt_engineering_process.png")

if __name__ == "__main__":
    create_prompt_engineering_diagram()