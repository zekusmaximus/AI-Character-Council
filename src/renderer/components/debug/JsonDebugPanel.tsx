// src/renderer/components/debug/JsonDebugPanel.tsx

import React, { useState } from 'react';
import { 
  PersonalityTraitsField, 
  CharacterSheetField, 
  MemoryMetadataField, 
  EventMetadataField, 
  MessageMetadataField,
  JsonField
} from '../../../shared/utils/jsonUtils';
import { JsonTestUtility } from '../../utils/jsonTestUtility';
import { useLogger } from '../../utils/LoggerProvider';

// Simple component for debugging JSON parsing/serialization
export const JsonDebugPanel: React.FC = () => {
  const logger = useLogger().createComponentLogger('JsonDebugPanel');
  
  const [jsonInput, setJsonInput] = useState<string>('');
  const [fieldType, setFieldType] = useState<string>('personalityTraits');
  const [parsedOutput, setParsedOutput] = useState<string>('');
  const [serializedOutput, setSerializedOutput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Get the appropriate field based on selection
  const getSelectedField = (): JsonField<any> => {
    switch (fieldType) {
      case 'personalityTraits':
        return PersonalityTraitsField;
      case 'characterSheet':
        return CharacterSheetField;
      case 'memoryMetadata':
        return MemoryMetadataField;
      case 'eventMetadata':
        return EventMetadataField;
      case 'messageMetadata':
        return MessageMetadataField;
      default:
        return PersonalityTraitsField;
    }
  };
  
  // Handle parsing JSON input
  const handleParse = () => {
    try {
      setErrorMessage('');
      const field = getSelectedField();
      const parsed = field.parse(jsonInput);
      setParsedOutput(JSON.stringify(parsed, null, 2));
      logger.info(`Parsed ${fieldType} input`, { input: jsonInput, output: parsed });
    } catch (error) {
      const message = `Error parsing JSON: ${error instanceof Error ? error.message : String(error)}`;
      setErrorMessage(message);
      logger.error(message, error);
    }
  };
  
  // Handle serializing the parsed JSON
  const handleSerialize = () => {
    try {
      setErrorMessage('');
      const field = getSelectedField();
      const parsed = field.parse(jsonInput);
      const serialized = field.serialize(parsed);
      setSerializedOutput(serialized);
      logger.info(`Serialized ${fieldType} input`, { input: parsed, output: serialized });
    } catch (error) {
      const message = `Error serializing JSON: ${error instanceof Error ? error.message : String(error)}`;
      setErrorMessage(message);
      logger.error(message, error);
    }
  };
  
  // Run test for all fields
  const runTests = () => {
    try {
      setErrorMessage('');
      JsonTestUtility.testAllFields();
      setJsonInput('/* Tests completed. Check console logs for results. */');
      setParsedOutput('');
      setSerializedOutput('');
      logger.info('All JSON field tests completed');
    } catch (error) {
      const message = `Error running tests: ${error instanceof Error ? error.message : String(error)}`;
      setErrorMessage(message);
      logger.error(message, error);
    }
  };
  
  // Load sample data for selected field
  const loadSample = () => {
    let sample = '';
    
    switch (fieldType) {
      case 'personalityTraits':
        sample = JSON.stringify({
          core: {
            traits: [
              { name: 'Intelligent', value: 85 },
              { name: 'Curious', value: 90 }
            ],
            values: ['Truth', 'Knowledge', 'Freedom']
          },
          voice: {
            speechPattern: 'Formal and precise, with occasional dry humor'
          }
        }, null, 2);
        break;
      case 'characterSheet':
        sample = JSON.stringify({
          attributes: {
            strength: 14,
            intelligence: 18,
            wisdom: 12,
            charisma: 10
          },
          custom: {
            magicAffinity: 'High',
            specialAbilities: ['Telekinesis', 'Mind Reading']
          },
          notes: 'Character tends to overthink situations.'
        }, null, 2);
        break;
      case 'memoryMetadata':
        sample = JSON.stringify({
          contextualRelevance: 85,
          associatedMemories: ['mem_001', 'mem_042'],
          emotionalTone: 'Nostalgic'
        }, null, 2);
        break;
      case 'eventMetadata':
        sample = JSON.stringify({
          duration: '3 days',
          location: 'Royal Palace',
          consequences: [
            'Kings illness worsened',
            'Prince assumed temporary rule'
          ],
          themes: ['Betrayal', 'Power']
        }, null, 2);
        break;
      case 'messageMetadata':
        sample = JSON.stringify({
          emotions: ['Anger', 'Fear'],
          intentMarkers: ['Deception'],
          internalThoughts: 'I need to hide what I know'
        }, null, 2);
        break;
      default:
        sample = '{}';
    }
    
    setJsonInput(sample);
    setParsedOutput('');
    setSerializedOutput('');
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">JSON Parser/Serializer Debug</h2>
      
      {/* Field Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Field Type
        </label>
        <select
          value={fieldType}
          onChange={(e) => setFieldType(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="personalityTraits">Personality Traits</option>
          <option value="characterSheet">Character Sheet</option>
          <option value="memoryMetadata">Memory Metadata</option>
          <option value="eventMetadata">Event Metadata</option>
          <option value="messageMetadata">Message Metadata</option>
        </select>
      </div>
      
      {/* JSON Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          JSON Input
        </label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Enter JSON here..."
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex space-x-3 mb-4">
        <button
          onClick={handleParse}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Parse
        </button>
        <button
          onClick={handleSerialize}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          Parse &amp; Serialize
        </button>
        <button
          onClick={loadSample}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Load Sample
        </button>
        <button
          onClick={runTests}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          Run All Tests
        </button>
      </div>
      
      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded">
          <p className="font-medium">Error:</p>
          <p>{errorMessage}</p>
        </div>
      )}
      
      {/* Parsed Output */}
      {parsedOutput && (
        <div className="mb-4">
          <h3 className="text-md font-medium text-gray-700 mb-1">Parsed Object</h3>
          <pre className="p-3 bg-gray-100 rounded overflow-auto max-h-48 text-sm font-mono">
            {parsedOutput}
          </pre>
        </div>
      )}
      
      {/* Serialized Output */}
      {serializedOutput && (
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-1">Serialized String</h3>
          <pre className="p-3 bg-gray-100 rounded overflow-auto max-h-48 text-sm font-mono">
            {serializedOutput}
          </pre>
        </div>
      )}
    </div>
  );
};