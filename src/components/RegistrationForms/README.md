# Registration Forms Component Structure

This directory contains the components for the registration forms, organized in a modular structure for easier maintenance.

## Directory Structure

```
RegistrationForms/
├── shared/                   # Shared components, types, and utilities
│   ├── types.ts              # Type definitions used across forms
│   ├── formUtils.ts          # Shared utility functions
│   ├── SectionButtons.tsx    # Navigation buttons component
│   ├── PhotoCapture.tsx      # Photo capture/upload component
│   ├── SubmitButton.tsx      # Submit button component
│   └── index.ts              # Exports for shared components
│
├── AddNormalChild/           # Child registration form components
│   ├── BasicInfoSection.tsx  # Section 1: Basic information
│   ├── GuardianInfoSection.tsx # Section 2: Guardian information
│   ├── DisappearanceSection.tsx # Section 3: Disappearance details
│   ├── PhotoSection.tsx      # Section 4: Photo capture/upload
│   └── index.ts              # Exports for child form components
│
├── AddDisabled/              # Disabled registration form components
│   ├── BasicInfoSection.tsx  # Section 1: Basic information
│   ├── ContactInfoSection.tsx # Section 2: Contact information
│   ├── DisabilityInfoSection.tsx # Section 3: Disability details
│   ├── PhotoSection.tsx      # Section 4: Photo capture/upload
│   └── index.ts              # Exports for disabled form components
│
└── README.md                 # This documentation file
```

## Component Overview

### Shared Components

- **SectionButtons**: Navigation buttons component for moving between form sections
- **PhotoCapture**: Unified component for handling camera capture and file uploads
- **SubmitButton**: Standardized submit button with loading state animation

### Type Definitions

- **BaseFormData**: Base interface with common properties for all forms
- **ChildFormData**: Interface for child registration form data
- **DisabledFormData**: Interface for disabled person registration form data

### Utility Functions

- **webcamImageToFile**: Converts webcam capture to File object
- **scrollToElement**: Helper to scroll to a specific element
- **saveFormDataToLocalStorage**: Saves form data for recovery
- **verifyFaceAfterRegistration**: Attempt face verification after registration

## How to Add a New Form

1. Create a new directory under `RegistrationForms/` for your form
2. Add any necessary types to `shared/types.ts`
3. Create section components for your form
4. Add an index.ts file to export your components
5. Create a main form file in the `pages/register/` directory

## How to Modify Existing Forms

- Each section of the form is now in its own component for easier maintenance
- Shared styling and functionality is extracted into the shared components
- Modify individual sections without affecting the entire form
