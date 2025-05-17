// src/renderer/components/memory/MemoryEditor.tsx

import React, { useState, useEffect } from 'react';
import { useLogger } from '../../utils/LoggerProvider';
import { CharacterMemory, MemoryService } from '../../services/databaseService';
import { MemoryMetadataField } from '../../../shared/utils/jsonUtils';

interface MemoryEditorProps {
  memory?: CharacterMemory;
  characterId: string;
  onSave: (memory: CharacterMemory) => void;
  onCancel: () => void;
}

export const MemoryEditor: React.FC<MemoryEditorProps> = ({
  memory,
  characterId,
  onSave,
  onCancel
}) => {
  const logger = useLogger().createComponentLogger('MemoryEditor');
  
  // Initialize state based on whether we're editing an existing memory
  const [formData, setFormData] = useState<Partial<CharacterMemory>>({
    characterId,
    memoryType: 'episodic',
    content: '',
    importance: 50,
    metadata: MemoryMetadataField.parse('{}')
  });
  
  const [associatedMemories, setAssociatedMemories] = useState<string[]>(
    formData.metadata?.associatedMemories || []
  );
  
  // Update form data when props change
  useEffect(() => {
    if (memory) {
      setFormData({
        ...memory,
        // Ensure metadata is properly parsed
        metadata: memory.metadata || MemoryMetadataField.parse('{}')
      });
      
      // Extract associated memories from metadata
      setAssociatedMemories(memory.metadata?.associatedMemories || []);
    }
  }, [memory]);
  
  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === 'importance') {
      const numValue = parseInt(value, 10);
      setFormData({
        ...formData,
        [name]: isNaN(numValue) ? 50 : Math.min(100, Math.max(0, numValue))
      });
      return;
    }
    
    // Handle other fields
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle metadata field changes
  const handleMetadataChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        [field]: value
      }
    });
  };
  
  // Handle associated memories changes
  const handleAddAssociatedMemory = () => {
    const newAssociatedMemories = [...associatedMemories, ''];
    setAssociatedMemories(newAssociatedMemories);
    
    // Update the metadata
    handleMetadataChange('associatedMemories', newAssociatedMemories);
  };
  
  const handleUpdateAssociatedMemory = (index: number, value: string) => {
    const newAssociatedMemories = [...associatedMemories];
    newAssociatedMemories[index] = value;
    setAssociatedMemories(newAssociatedMemories);
    
    // Update the metadata
    handleMetadataChange('associatedMemories', newAssociatedMemories);
  };
  
  const handleRemoveAssociatedMemory = (index: number) => {
    const newAssociatedMemories = [...associatedMemories];
    newAssociatedMemories.splice(index, 1);
    setAssociatedMemories(newAssociatedMemories);
    
    // Update the metadata
    handleMetadataChange('associatedMemories', newAssociatedMemories);
  };
  
  // Save the memory
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let savedMemory: CharacterMemory | null;
      
      if (memory?.id) {
        // Update existing memory
        savedMemory = await MemoryService.update(memory.id, formData);
      } else {
        // Create new memory
        savedMemory = await MemoryService.create(formData as any);
      }
      
      if (savedMemory) {
        onSave(savedMemory);
      } else {
        throw new Error('Failed to save memory');
      }
    } catch (error) {
      logger.error('Failed to save memory', error);
      // Handle error (show notification, etc.)
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {memory?.id ? 'Edit Memory' : 'Create New Memory'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Memory Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Memory Type
          </label>
          <select
            name="memoryType"
            value={formData.memoryType}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="episodic">Episodic</option>
            <option value="semantic">Semantic</option>
            <option value="procedural">Procedural</option>
            <option value="emotional">Emotional</option>
          </select>
        </div>
        
        {/* Memory Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Memory Content
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="What does the character remember?"
            required
          />
        </div>
        
        {/* Memory Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source (Optional)
          </label>
          <input
            type="text"
            name="source"
            value={formData.source || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Where did this memory come from?"
          />
        </div>
        
        {/* Importance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Importance (0-100)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              name="importance"
              min="0"
              max="100"
              value={formData.importance}
              onChange={handleChange}
              className="flex-1"
            />
            <span className="w-10 text-center">{formData.importance}</span>
          </div>
        </div>
        
        {/* Metadata: Emotional Tone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Emotional Tone
          </label>
          <input
            type="text"
            value={formData.metadata?.emotionalTone || ''}
            onChange={(e) => handleMetadataChange('emotionalTone', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="How does the character feel about this memory?"
          />
        </div>
        
        {/* Metadata: Contextual Relevance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contextual Relevance (0-100)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="100"
              value={formData.metadata?.contextualRelevance || 50}
              onChange={(e) => handleMetadataChange('contextualRelevance', parseInt(e.target.value, 10))}
              className="flex-1"
            />
            <span className="w-10 text-center">{formData.metadata?.contextualRelevance || 50}</span>
          </div>
        </div>
        
        {/* Metadata: Associated Memories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Associated Memories
          </label>
          <div className="space-y-2">
            {associatedMemories.map((memory, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={memory}
                  onChange={(e) => handleUpdateAssociatedMemory(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Associated memory reference"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAssociatedMemory(index)}
                  className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddAssociatedMemory}
              className="w-full py-2 px-4 border border-blue-300 rounded text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Add Associated Memory
            </button>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Save Memory
          </button>
        </div>
      </form>
    </div>
  );
};