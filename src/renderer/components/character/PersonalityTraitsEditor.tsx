// src/renderer/components/character/PersonalityTraitsEditor.tsx

import React, { useState, useEffect } from 'react';
import { useLogger } from '../../utils/LoggerProvider';
import { PersonalityTraitsField } from '../../../shared/utils/jsonUtils';

interface PersonalityTrait {
  name: string;
  value: number;
}

interface PersonalityTraitsProps {
  initialTraits: any; // Accepts the parsed personality traits object
  onChange: (traits: any) => void; // Returns the updated traits object
  readOnly?: boolean;
}

export const PersonalityTraitsEditor: React.FC<PersonalityTraitsProps> = ({
  initialTraits,
  onChange,
  readOnly = false
}) => {
  const logger = useLogger().createComponentLogger('PersonalityTraitsEditor');
  
  // Create a default structure if none provided
  const defaultTraits = PersonalityTraitsField.parse('{}');
  
  // Initialize state with the provided traits or defaults
  const [traits, setTraits] = useState<any>(initialTraits || defaultTraits);
  
  // Ensure core traits array exists
  const coreTraits = traits.core?.traits || [];
  const coreValues = traits.core?.values || [];
  
  // Update traits when initialTraits changes
  useEffect(() => {
    if (initialTraits) {
      setTraits(initialTraits);
    }
  }, [initialTraits]);
  
  // Handler for updating a specific trait value
  const handleTraitValueChange = (index: number, value: number) => {
    if (readOnly) return;
    
    const updatedTraits = { ...traits };
    
    // Ensure core and traits array exist
    if (!updatedTraits.core) {
      updatedTraits.core = {};
    }
    if (!updatedTraits.core.traits) {
      updatedTraits.core.traits = [];
    }
    
    // Update the trait at the specified index
    updatedTraits.core.traits[index] = {
      ...updatedTraits.core.traits[index],
      value: Math.min(100, Math.max(0, value)) // Clamp between 0-100
    };
    
    setTraits(updatedTraits);
    onChange(updatedTraits);
  };
  
  // Handler for updating a trait name
  const handleTraitNameChange = (index: number, name: string) => {
    if (readOnly) return;
    
    const updatedTraits = { ...traits };
    
    // Ensure core and traits array exist
    if (!updatedTraits.core) {
      updatedTraits.core = {};
    }
    if (!updatedTraits.core.traits) {
      updatedTraits.core.traits = [];
    }
    
    // Update the trait at the specified index
    updatedTraits.core.traits[index] = {
      ...updatedTraits.core.traits[index],
      name
    };
    
    setTraits(updatedTraits);
    onChange(updatedTraits);
  };
  
  // Handler for adding a new trait
  const handleAddTrait = () => {
    if (readOnly) return;
    
    const updatedTraits = { ...traits };
    
    // Ensure core and traits array exist
    if (!updatedTraits.core) {
      updatedTraits.core = {};
    }
    if (!updatedTraits.core.traits) {
      updatedTraits.core.traits = [];
    }
    
    // Add a new empty trait
    updatedTraits.core.traits.push({
      name: '',
      value: 50
    });
    
    setTraits(updatedTraits);
    onChange(updatedTraits);
  };
  
  // Handler for removing a trait
  const handleRemoveTrait = (index: number) => {
    if (readOnly) return;
    
    const updatedTraits = { ...traits };
    
    // Remove the trait at the specified index
    updatedTraits.core.traits.splice(index, 1);
    
    setTraits(updatedTraits);
    onChange(updatedTraits);
  };
  
  // Handler for adding a value
  const handleAddValue = () => {
    if (readOnly) return;
    
    const updatedTraits = { ...traits };
    
    // Ensure core and values array exist
    if (!updatedTraits.core) {
      updatedTraits.core = {};
    }
    if (!updatedTraits.core.values) {
      updatedTraits.core.values = [];
    }
    
    // Add a new empty value
    updatedTraits.core.values.push('');
    
    setTraits(updatedTraits);
    onChange(updatedTraits);
  };
  
  // Handler for updating a value
  const handleValueChange = (index: number, value: string) => {
    if (readOnly) return;
    
    const updatedTraits = { ...traits };
    
    // Ensure core and values array exist
    if (!updatedTraits.core) {
      updatedTraits.core = {};
    }
    if (!updatedTraits.core.values) {
      updatedTraits.core.values = [];
    }
    
    // Update the value at the specified index
    updatedTraits.core.values[index] = value;
    
    setTraits(updatedTraits);
    onChange(updatedTraits);
  };
  
  // Handler for removing a value
  const handleRemoveValue = (index: number) => {
    if (readOnly) return;
    
    const updatedTraits = { ...traits };
    
    // Remove the value at the specified index
    updatedTraits.core.values.splice(index, 1);
    
    setTraits(updatedTraits);
    onChange(updatedTraits);
  };
  
  // Handler for updating speech pattern
  const handleSpeechPatternChange = (pattern: string) => {
    if (readOnly) return;
    
    const updatedTraits = { ...traits };
    
    // Ensure voice object exists
    if (!updatedTraits.voice) {
      updatedTraits.voice = {};
    }
    
    updatedTraits.voice.speechPattern = pattern;
    
    setTraits(updatedTraits);
    onChange(updatedTraits);
  };
  
  return (
    <div className="space-y-6">
      {/* Core Traits Section */}
      <div>
        <h3 className="text-lg font-medium mb-3">Character Traits</h3>
        <div className="space-y-3">
          {coreTraits.map((trait: PersonalityTrait, index: number) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={trait.name}
                onChange={(e) => handleTraitNameChange(index, e.target.value)}
                placeholder="Trait name"
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                readOnly={readOnly}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={trait.value}
                onChange={(e) => handleTraitValueChange(index, parseInt(e.target.value))}
                className="flex-1"
                disabled={readOnly}
              />
              <span className="w-10 text-center">{trait.value}</span>
              {!readOnly && (
                <button
                  onClick={() => handleRemoveTrait(index)}
                  className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                  aria-label="Remove trait"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          
          {!readOnly && (
            <button
              onClick={handleAddTrait}
              className="w-full py-2 px-4 border border-blue-300 rounded text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Add Trait
            </button>
          )}
        </div>
      </div>
      
      {/* Core Values Section */}
      <div>
        <h3 className="text-lg font-medium mb-3">Character Values</h3>
        <div className="space-y-3">
          {coreValues.map((value: string, index: number) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={value}
                onChange={(e) => handleValueChange(index, e.target.value)}
                placeholder="Value"
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                readOnly={readOnly}
              />
              {!readOnly && (
                <button
                  onClick={() => handleRemoveValue(index)}
                  className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                  aria-label="Remove value"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          
          {!readOnly && (
            <button
              onClick={handleAddValue}
              className="w-full py-2 px-4 border border-blue-300 rounded text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Add Value
            </button>
          )}
        </div>
      </div>
      
      {/* Voice Section */}
      <div>
        <h3 className="text-lg font-medium mb-3">Speech Pattern</h3>
        <textarea
          value={traits.voice?.speechPattern || ''}
          onChange={(e) => handleSpeechPatternChange(e.target.value)}
          placeholder="Describe how the character speaks..."
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[100px]"
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};