// build-resources/README.md

# Build Resources

This directory contains resources needed for the build process and distribution:

## Contents

- `icon.png` - Application icon (1024x1024px)
- `icon.icns` - macOS application icon
- `icon.ico` - Windows application icon
- `entitlements.mac.plist` - macOS entitlements for hardened runtime
- `background.png` - Background image for macOS DMG installer

## Icon Generation

Icons for different platforms were generated from the main `icon.png` file using the following commands:

### macOS (icns)
```
cd build-resources
mkdir MyIcon.iconset
sips -z 16 16 icon.png --out MyIcon.iconset/icon_16x16.png
sips -z 32 32 icon.png --out MyIcon.iconset/icon_16x16@2x.png
sips -z 32 32 icon.png --out MyIcon.iconset/icon_32x32.png
sips -z 64 64 icon.png --out MyIcon.iconset/icon_32x32@2x.png
sips -z 128 128 icon.png --out MyIcon.iconset/icon_128x128.png
sips -z 256 256 icon.png --out MyIcon.iconset/icon_128x128@2x.png
sips -z 256 256 icon.png --out MyIcon.iconset/icon_256x256.png
sips -z 512 512 icon.png --out MyIcon.iconset/icon_256x256@2x.png
sips -z 512 512 icon.png --out MyIcon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out MyIcon.iconset/icon_512x512@2x.png
iconutil -c icns MyIcon.iconset
rm -R MyIcon.iconset
```

### Windows (ico)
For Windows, use a tool like https://convertico.com/ to convert the PNG to an ICO file.

## DMG Background
The DMG background should be 600x400px for best results.

# Enhanced Service Layer and Validation System

This update enhances the AI Character Council application with an improved service layer architecture and a robust validation system for handling data validation throughout the application.

## Key Components

### Service Layer Architecture

The following components have been implemented or updated:

1. **Service Layer**: Replaced direct IPC calls with a repository-based architecture.
   - `src/renderer/services/entityServices.ts`: Client-side service layer that handles data operations
   - `src/main/services/ServerService.ts`: Server-side service layer that handles business logic

2. **Repositories**: Added repositories for all entity types with standardized CRUD operations.
   - `src/shared/repositories/BaseRepository.ts`: Base repository with common operations
   - Specific repositories for each entity type (Character, Project, Memory, etc.)

3. **Enhanced IPC Handlers**: Updated IPC handlers to use the new service architecture.
   - `src/main/ipc/enhancedIpcHandler.ts`: Improved handlers with better error handling

### Validation System

1. **Validation Schemas**: Enhanced schemas for all entity types using Zod.
   - Added schemas for Notes, Tags, TaggedItems, etc.
   - Improved schema validation with detailed error messages

2. **Error Handling Components**:
   - `src/renderer/components/errors/EnhancedErrorDialog.tsx`: Improved error dialog with validation error display
   - `src/renderer/components/errors/ValidationErrorDisplay.tsx`: Component for showing validation errors
   - `src/renderer/utils/enhancedErrorUtils.ts`: Utilities for error handling

3. **Form Validation Components**:
   - `src/renderer/components/form/FormValidationError.tsx`: Context and components for form validation
   - `src/renderer/components/form/ValidatedInput.tsx`: Form controls with built-in validation

4. **Demo Components**:
   - `src/renderer/components/demo/ValidationDemo.tsx`: Demonstrates the validation system
   - `src/renderer/components/AppWithValidation.tsx`: Updated app component with validation demo

## Design Patterns Used

1. **Repository Pattern**: Centralizes data access logic
2. **Service Layer Pattern**: Separates business logic from presentation
3. **Dependency Injection**: Services and repositories use singleton instances
4. **Provider Pattern**: Context providers for form validation
5. **Higher-Order Components**: For adding validation to form components
6. **Error Boundary Pattern**: Graceful error handling at different levels

## Implementation Details

### JSON Field Handling

The system includes robust handling of JSON fields stored in the database:

- Automatic serialization/deserialization of JSON fields
- Type-safe parsing and validation
- Field-specific parsers for complex structures

### Error Handling Flow

1. Validation errors are caught at the service layer
2. Standardized error format is passed through IPC
3. Client-side error handler processes and displays errors
4. Form components extract field-specific errors

### Type Safety

- All schemas generate TypeScript types
- Repositories are strongly typed
- IPC functions maintain type safety across boundaries

## How to Use

### Using the Service Layer

Instead of directly calling IPC functions:

```typescript
// Old approach
const result = await window.electron.characters.getById(id);

// New approach
const character = await CharacterService.getById(id);
```

### Handling Validation Errors

```typescript
try {
  await ProjectService.create(data);
} catch (error) {
  // Show validation errors in form
  setErrors(error.validationErrors || {});
  
  // Or show in dialog
  setIsDialogOpen(true);
  setCurrentError(error);
}
```

### Using Validated Form Components

```jsx

```

## Future Improvements

1. Add unit tests for validation logic
2. Implement cache layer for frequently accessed data
3. Add transaction support for multi-step operations
4. Create more specialized repositories for advanced queries