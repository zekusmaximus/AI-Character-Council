// src/renderer/components/timeline/TimelineEventForm.tsx

import React, { useState, useEffect } from 'react';
import { useLogger } from '../../utils/LoggerProvider';
import { TimelineEvent, TimelineService } from '../../services/databaseService';
import { EventMetadataField } from '../../../shared/utils/jsonUtils';

interface TimelineEventFormProps {
  timelineId: string;
  event?: TimelineEvent;
  onSave: (event: TimelineEvent) => void;
  onCancel: () => void;
  maxOrder?: number;
}

export const TimelineEventForm: React.FC<TimelineEventFormProps> = ({
  timelineId,
  event,
  onSave,
  onCancel,
  maxOrder = 0
}) => {
  const logger = useLogger().createComponentLogger('TimelineEventForm');
  
  // Initialize default state
  const [formData, setFormData] = useState<Partial<TimelineEvent>>({
    timelineId,
    title: '',
    description: '',
    date: '',
    order: maxOrder + 1,
    importance: 50,
    metadata: EventMetadataField.parse('{}')
  });
  
  // Store themes separately for easier manipulation
  const [themes, setThemes] = useState<string[]>(
    formData.metadata?.themes || []
  );
  
  // Store linked events separately for easier manipulation
  const [linkedEvents, setLinkedEvents] = useState<string[]>(
    formData.metadata?.linkedEvents || []
  );
  
  // Update form data when props change
  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        // Ensure metadata is properly parsed
        metadata: event.metadata || EventMetadataField.parse('{}')
      });
      
      // Extract arrays from metadata
      setThemes(event.metadata?.themes || []);
      setLinkedEvents(event.metadata?.linkedEvents || []);
    } else {
      // Set default order for new events
      setFormData((prev) => ({
        ...prev,
        order: maxOrder + 1
      }));
    }
  }, [event, maxOrder]);
  
  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === 'importance' || name === 'order') {
      const numValue = parseInt(value, 10);
      setFormData({
        ...formData,
        [name]: isNaN(numValue) ? (name === 'importance' ? 50 : 0) : numValue
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
  
  // Handle themes changes
  const handleAddTheme = () => {
    const newThemes = [...themes, ''];
    setThemes(newThemes);
    
    // Update the metadata
    handleMetadataChange('themes', newThemes);
  };
  
  const handleUpdateTheme = (index: number, value: string) => {
    const newThemes = [...themes];
    newThemes[index] = value;
    setThemes(newThemes);
    
    // Update the metadata
    handleMetadataChange('themes', newThemes);
  };
  
  const handleRemoveTheme = (index: number) => {
    const newThemes = [...themes];
    newThemes.splice(index, 1);
    setThemes(newThemes);
    
    // Update the metadata
    handleMetadataChange('themes', newThemes);
  };
  
  // Handle linked events changes
  const handleAddLinkedEvent = () => {
    const newLinkedEvents = [...linkedEvents, ''];
    setLinkedEvents(newLinkedEvents);
    
    // Update the metadata
    handleMetadataChange('linkedEvents', newLinkedEvents);
  };
  
  const handleUpdateLinkedEvent = (index: number, value: string) => {
    const newLinkedEvents = [...linkedEvents];
    newLinkedEvents[index] = value;
    setLinkedEvents(newLinkedEvents);
    
    // Update the metadata
    handleMetadataChange('linkedEvents', newLinkedEvents);
  };
  
  const handleRemoveLinkedEvent = (index: number) => {
    const newLinkedEvents = [...linkedEvents];
    newLinkedEvents.splice(index, 1);
    setLinkedEvents(newLinkedEvents);
    
    // Update the metadata
    handleMetadataChange('linkedEvents', newLinkedEvents);
  };
  
  // Save the event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let savedEvent: TimelineEvent | null;
      
      if (event?.id) {
        // Update existing event
        savedEvent = await TimelineService.updateEvent(event.id, formData);
      } else {
        // Create new event
        savedEvent = await TimelineService.createEvent(formData as any);
      }
      
      if (savedEvent) {
        onSave(savedEvent);
      } else {
        throw new Error('Failed to save event');
      }
    } catch (error) {
      logger.error('Failed to save timeline event', error);
      // Handle error (show notification, etc.)
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {event?.id ? 'Edit Event' : 'Create New Event'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Event Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Event title"
            required
          />
        </div>
        
        {/* Event Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Event description"
          />
        </div>
        
        {/* Event Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="text"
            name="date"
            value={formData.date || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Event date (supports fictional calendars)"
          />
        </div>
        
        {/* Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order in Timeline
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            min="0"
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
        
        {/* Metadata: Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.metadata?.location || ''}
            onChange={(e) => handleMetadataChange('location', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Where did this event take place?"
          />
        </div>
        
        {/* Metadata: Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <input
            type="text"
            value={formData.metadata?.duration || ''}
            onChange={(e) => handleMetadataChange('duration', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="How long did this event last?"
          />
        </div>
        
        {/* Metadata: Themes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Themes
          </label>
          <div className="space-y-2">
            {themes.map((theme, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => handleUpdateTheme(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Theme"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTheme(index)}
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
              onClick={handleAddTheme}
              className="w-full py-2 px-4 border border-blue-300 rounded text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Add Theme
            </button>
          </div>
        </div>
        
        {/* Metadata: Consequences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consequences
          </label>
          <textarea
            value={Array.isArray(formData.metadata?.consequences) ? formData.metadata?.consequences.join('\n') : ''}
            onChange={(e) => handleMetadataChange('consequences', e.target.value.split('\n').filter(line => line.trim() !== ''))}
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="What were the consequences of this event? (One per line)"
          />
        </div>
        
        {/* Metadata: Linked Events */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Linked Events
          </label>
          <div className="space-y-2">
            {linkedEvents.map((eventId, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={eventId}
                  onChange={(e) => handleUpdateLinkedEvent(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Event ID or reference"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveLinkedEvent(index)}
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
              onClick={handleAddLinkedEvent}
              className="w-full py-2 px-4 border border-blue-300 rounded text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Add Linked Event
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
            Save Event
          </button>
        </div>
      </form>
    </div>
  );
};