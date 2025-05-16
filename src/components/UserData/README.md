# UserData Component Architecture

This directory contains modular components for the User Data page, which has been split into smaller, more manageable parts.

## Directory Structure

- `types.ts` - Contains shared interfaces and type definitions
- `UserDataUtils.ts` - Contains utility functions for data formatting and manipulation
- `index.ts` - Exports all components and utilities for easy importing
- Component files (e.g., `UserHeader.tsx`, `PersonalInfo.tsx`, etc.)

## Available Components

- `UserHeader` - User profile header with image, name, and basic info
- `PersonalInfo` - Personal information section
- `PhoneNumbers` - Phone numbers and contact information
- `VehiclesSection` - Vehicle information for applicable users
- `ImageModal` - Modal for displaying the user's image

## How to Add a New Component

1. Create a new file with your component (e.g., `NewSection.tsx`)
2. Import necessary types and utilities:
   ```tsx
   import React from 'react';
   import { motion } from 'framer-motion';
   import { UserDataProps } from './types';
   ```
3. Create your component:

   ```tsx
   const NewSection: React.FC<UserDataProps> = ({
     user,
     isRTL,
     isIdentityRevealed,
     formatDate,
     maskSensitiveInfo,
     t,
   }) => {
     return (
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.2 }}
         className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-blue-500/30 shadow-lg"
       >
         {/* Your component content here */}
       </motion.div>
     );
   };

   export default NewSection;
   ```

4. Add your component to the exports in `index.ts`:
   ```tsx
   export { default as NewSection } from './NewSection';
   ```
5. Use your component in `userdata.tsx`:

   ```tsx
   import { NewSection } from '../../components/UserData';

   // In your JSX:
   <NewSection
     user={user}
     isRTL={isRTL}
     isIdentityRevealed={isIdentityRevealed}
     formatDate={formatDate}
     maskSensitiveInfo={maskSensitiveInfo}
     t={t}
   />;
   ```

## Extending the Component Architecture

If you need to add specialized props for a component:

1. Define an interface extending UserDataProps in your component file:

   ```tsx
   interface NewSectionProps extends UserDataProps {
     additionalProp: string;
   }

   const NewSection: React.FC<NewSectionProps> = ({
     user,
     isRTL,
     isIdentityRevealed,
     formatDate,
     maskSensitiveInfo,
     t,
     additionalProp,
   }) => {
     // ...
   };
   ```

2. Pass the additional prop when using the component:
   ```tsx
   <NewSection
     user={user}
     isRTL={isRTL}
     isIdentityRevealed={isIdentityRevealed}
     formatDate={formatDate}
     maskSensitiveInfo={maskSensitiveInfo}
     t={t}
     additionalProp="value"
   />
   ```
