// src/renderer/components/demo/ValidationDemo.tsx

import React, { useState } from 'react';
import { 
  ValidatedInput, 
  ValidatedTextarea, 
} from '../form/ValidatedInput';
import { 
  FormValidationProvider,
  FormValidationSummary,
  useFormValidation
} from '../form/FormValidationError';
import { EnhancedErrorDialog } from '../errors/EnhancedErrorDialog';
import { ProjectService, CharacterService } from '../../services/entityServices';

/**
 * A demo component showcasing the validation system
 */
export const ValidationDemo: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentError, setCurrentError] = useState<any>(null);
  
  // Project form state
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    description: ''
  });
  
  // Character form state
  const [characterFormData, setCharacterFormData] = useState({
    projectId: '',
    name: '',
    bio: '',
    personalityTraits: {
      core: {
        traits: [
          { name: '', value: 50 }
        ],
        values: []
      },
      voice: {
        speechPattern: ''
      }
    }
  });
  
  // Form validation context
  const { setErrors, clearErrors } = useFormValidation();
  
  // Handle input changes for project form
  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle input changes for character form
  const handleCharacterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCharacterFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle personality trait changes
  const handleTraitChange = (index: number, field: 'name' | 'value', value: string | number) => {
    setCharacterFormData(prev => {
      const traits = [...prev.personalityTraits.core.traits];
      traits[index] = { 
        ...traits[index], 
        [field]: field === 'value' ? Number(value) : value 
      };
      
      return {
        ...prev,
        personalityTraits: {
          ...prev.personalityTraits,
          core: {
            ...prev.personalityTraits.core,
            traits
          }
        }
      };
    });
  };
  
  // Handle speech pattern changes
  const handleSpeechPatternChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setCharacterFormData(prev => ({
      ...prev,
      personalityTraits: {
        ...prev.personalityTraits,
        voice: {
          ...prev.personalityTraits.voice,
          speechPattern: value
        }
      }
    }));
  };
  
  // Submit project form - intentionally pass invalid data to trigger validation errors
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    try {
      // Submit empty project to trigger validation errors
      const emptyProject = { ...projectFormData, name: '' };
      await ProjectService.create(emptyProject);
    } catch (error) {
      // Set the error in the form validation context
      if (error && typeof error === 'object' && 'validationErrors' in error) {
        setErrors((error as any).validationErrors || {});
      }
      
      // Also show the error dialog
      setCurrentError(error);
      setIsDialogOpen(true);
    }
  };
  
  // Submit character form - use complex validation for nested fields
  const handleCharacterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    try {
      // Submit character with missing required fields
      const invalidCharacter = { 
        ...characterFormData,
        projectId: characterFormData.projectId || '00000000-0000-0000-0000-000000000000', // Invalid UUID
        name: '', // Required field
        image: null,
      };
      
      await CharacterService.create(invalidCharacter);
    } catch (error) {
      // Set the error in the form validation context
      if (error && typeof error === 'object' && 'validationErrors' in error) {
        setErrors((error as any).validationErrors || {});
      }
      
      // Also show the error dialog
      setCurrentError(error);
      setIsDialogOpen(true);
    }
  };
  
  // Create some validation errors to show
  const triggerValidationErrors = () => {
    const validationErrors = {
      name: "Name is required",
      'personalityTraits.core.traits.0.name': "Trait name is required",
      'personalityTraits.voice.speechPattern': "Speech pattern is too short",
      'projectId': "Invalid project ID"
    };
    
    setErrors(validationErrors);
    
    // Create a full error object for the dialog
    const error = new Error("Validation failed");
    (error as any).name = "ValidationError";
    (error as any).code = "VALIDATION_ERROR";
    (error as any).validationErrors = validationErrors;
    
    setCurrentError(error);
    setIsDialogOpen(true);
  };
  
  return (
    <FormValidationProvider>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Validation System Demo</h1>
        
        {/* Demo buttons */}
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={triggerValidationErrors}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Show Validation Errors
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Project Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Project Form</h2>
            
            <FormValidationSummary />
            
            <form onSubmit={handleProjectSubmit}>
              <ValidatedInput
                label="Project Name"
                name="name"
                value={projectFormData.name}
                onChange={handleProjectChange}
                required
                error={currentError}
              />
              
              <ValidatedTextarea
                label="Description"
                name="description"
                value={projectFormData.description}
                onChange={handleProjectChange}
                error={currentError}
              />
              
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit Project (Trigger Validation)
              </button>
            </form>
          </div>
          
          {/* Character Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Character Form</h2>
            
            <FormValidationSummary />
            
            <form onSubmit={handleCharacterSubmit}>
              <ValidatedInput
                label="Project ID"
                name="projectId"
                value={characterFormData.projectId}
                onChange={handleCharacterChange}
                required
                error={currentError}
              />
              
              <ValidatedInput
                label="Character Name"
                name="name"
                value={characterFormData.name}
                onChange={handleCharacterChange}
                required
                error={currentError}
              />
              
              <ValidatedTextarea
                label="Biography"
                name="bio"
                value={characterFormData.bio}
                onChange={handleCharacterChange}
                error={currentError}
              />
              
              {/* Personality Trait */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personality Trait
                </label>
                
                <div className="flex gap-2 mb-2">
                  <input
                    name="traitName"
                    value={characterFormData.personalityTraits.core.traits[0].name}
                    onChange={(e) => handleTraitChange(0, 'name', e.target.value)}
                    placeholder="Trait name"
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  
                  <input
                    type="range"
                    name="traitValue"
                    min="0"
                    max="100"
                    value={characterFormData.personalityTraits.core.traits[0].value}
                    onChange={(e) => handleTraitChange(0, 'value', e.target.value)}
                    className="w-24"
                  />
                  
                  <span className="w-12 text-center">
                    {characterFormData.personalityTraits.core.traits[0].value}
                  </span>
                </div>
                
                {/* Show field-specific error */}
                {currentError && currentError.validationErrors && 
                 currentError.validationErrors['personalityTraits.core.traits.0.name'] && (
                  <p className="text-red-600 text-sm mt-1">
                    {currentError.validationErrors['personalityTraits.core.traits.0.name']}
                  </p>
                )}
              </div>
              
              {/* Speech Pattern */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speech Pattern
                </label>
                
                <textarea
                  name="speechPattern"
                  value={characterFormData.personalityTraits.voice.speechPattern}
                  onChange={handleSpeechPatternChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Describe how the character speaks..."
                />
                
                {/* Show field-specific error */}
                {currentError && currentError.validationErrors && 
                 currentError.validationErrors['personalityTraits.voice.speechPattern'] && (
                  <p className="text-red-600 text-sm mt-1">
                    {currentError.validationErrors['personalityTraits.voice.speechPattern']}
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit Character (Trigger Validation)
              </button>
            </form>
          </div>
        </div>
        
        {/* Error Dialog */}
        <EnhancedErrorDialog
          isOpen={isDialogOpen}
          error={currentError}
          onClose={() => setIsDialogOpen(false)}
          title="Validation Error"
          showDetails={true}
        />
      </div>
    </FormValidationProvider>
  );
};

export default ValidationDemo;