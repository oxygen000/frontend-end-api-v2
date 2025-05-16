# Integration Guide

This document provides instructions for updating the main form files in `pages/register` to use the new component structure.

## Steps to Update AddNormalChild.tsx

1. **Update imports** - Replace direct component imports with imports from our component library:

   ```tsx
   import {
     BasicInfoSection,
     GuardianInfoSection,
     DisappearanceSection,
     PhotoSection,
   } from '../../components/RegistrationForms/AddNormalChild';

   import {
     ChildFormData,
     webcamImageToFile,
     scrollToElement,
     saveFormDataToLocalStorage,
     verifyFaceAfterRegistration,
   } from '../../components/RegistrationForms/shared';
   ```

2. **Remove UserWithFaceId import** - Since this type is only used for type checking, remove:

   ```tsx
   // Remove or update to be a type import
   import { UserWithFaceId } from '...';
   ```

3. **Replace form sections** - Replace each section in the JSX with its corresponding component:

   ```tsx
   {
     currentSection === 1 && (
       <BasicInfoSection
         formData={formData}
         onInputChange={handleInputChange}
         onNext={nextSection}
       />
     );
   }

   {
     currentSection === 2 && (
       <GuardianInfoSection
         formData={formData}
         onInputChange={handleInputChange}
         onPrev={prevSection}
         onNext={nextSection}
       />
     );
   }

   {
     currentSection === 3 && (
       <DisappearanceSection
         formData={formData}
         onInputChange={handleInputChange}
         onPrev={prevSection}
         onNext={nextSection}
       />
     );
   }

   {
     currentSection === 4 && (
       <PhotoSection
         formData={formData}
         capturedImage={capturedImage}
         webcamRef={webcamRef}
         facingMode={facingMode}
         onToggleCamera={handleToggleCamera}
         onToggleFacingMode={toggleCameraFacingMode}
         onCaptureImage={captureImage}
         onRetakePhoto={retakePhoto}
         onFileSelect={handleFileSelect}
         onPrev={prevSection}
         isSubmitting={isSubmitting}
       />
     );
   }
   ```

## Steps to Update AddDisabled.tsx

1. **Update imports** - Replace direct component imports with imports from our component library:

   ```tsx
   import {
     BasicInfoSection,
     ContactInfoSection,
     DisabilityInfoSection,
     PhotoSection,
   } from '../../components/RegistrationForms/AddDisabled';

   import {
     DisabledFormData,
     webcamImageToFile,
     scrollToElement,
     saveFormDataToLocalStorage,
     verifyFaceAfterRegistration,
   } from '../../components/RegistrationForms/shared';
   ```

2. **Replace form sections** - Replace each section in the JSX with its corresponding component:

   ```tsx
   {
     currentSection === 1 && (
       <BasicInfoSection
         formData={formData}
         onInputChange={handleInputChange}
         onNext={nextSection}
       />
     );
   }

   {
     currentSection === 2 && (
       <ContactInfoSection
         formData={formData}
         onInputChange={handleInputChange}
         onPrev={prevSection}
         onNext={nextSection}
       />
     );
   }

   {
     currentSection === 3 && (
       <DisabilityInfoSection
         formData={formData}
         onInputChange={handleInputChange}
         onPrev={prevSection}
         onNext={nextSection}
       />
     );
   }

   {
     currentSection === 4 && (
       <PhotoSection
         formData={formData}
         capturedImage={capturedImage}
         webcamRef={webcamRef}
         facingMode={facingMode}
         onToggleCamera={handleToggleCamera}
         onToggleFacingMode={toggleCameraFacingMode}
         onCaptureImage={captureImage}
         onRetakePhoto={retakePhoto}
         onFileSelect={handleFileSelect}
         onPrev={prevSection}
         isSubmitting={isSubmitting}
       />
     );
   }
   ```

## Additional Considerations

1. **TypeScript Issues**: You may need to fix TypeScript errors related to the RefObject<Webcam>. Update the component props to match the exact type.

2. **Missing Utilities**: If you encounter errors about missing utility functions, check that all required utilities have been properly exported from the shared folder.

3. **Styling Consistency**: Ensure that the styling is consistent between the main form containers and the components. Check things like spacing, colors, and animations.

4. **Testing**: After conversion, thoroughly test the forms to ensure all functionality works as expected:
   - Form validation
   - Navigation between sections
   - Image capture/upload
   - Form submission
