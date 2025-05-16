import { toast } from 'react-hot-toast';
import { BASE_API_URL } from '../../../config/constants';

/**
 * Converts a captured webcam image to a File object
 */
export const webcamImageToFile = (
  capturedImage: string,
  fileName = `webcam_capture_${Date.now()}.jpg`
): File | null => {
  if (!capturedImage) return null;

  try {
    // Extract the base64 part if it's a data URL
    let base64Data = capturedImage;
    if (base64Data.startsWith('data:image/jpeg;base64,')) {
      base64Data = capturedImage.split(',')[1];
    } else if (base64Data.startsWith('data:')) {
      // Handle other image formats
      const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        base64Data = matches[2];
      } else {
        console.error('Invalid data URL format');
        throw new Error('Invalid image format from webcam');
      }
    }

    // Convert base64 to binary
    const byteString = atob(base64Data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // Create blob and file
    const blob = new Blob([ab], { type: 'image/jpeg' });
    return new File([blob], fileName, { type: 'image/jpeg' });
  } catch (error) {
    console.error('Error converting base64 to file:', error);
    toast.error(
      'Failed to process webcam image. Please try again or upload a file instead.'
    );
    return null;
  }
};

/**
 * Scrolls to the form element or error section
 */
export const scrollToElement = (
  selector: string,
  behavior: ScrollBehavior = 'smooth'
) => {
  setTimeout(() => {
    document
      .querySelector(selector)
      ?.scrollIntoView({ behavior, block: 'center' });
  }, 100);
};

/**
 * Store temporary form data in localStorage for recovery
 */
export const saveFormDataToLocalStorage = (
  userId: string,
  userName: string,
  formType: string,
  formData: FormData
) => {
  try {
    const formDataObj: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        formDataObj[key] = value;
      }
    });

    localStorage.setItem(
      `temp_registration_${userId}`,
      JSON.stringify({
        id: userId,
        name: userName,
        form_type: formType,
        timestamp: new Date().toISOString(),
        data: formDataObj,
      })
    );

    console.log(
      `Saved form data to localStorage with key: temp_registration_${userId}`
    );
    return true;
  } catch (e) {
    console.error('Failed to save form data to localStorage:', e);
    return false;
  }
};

/**
 * Attempt to verify face ID after registration
 */
export const verifyFaceAfterRegistration = async (
  userId: string,
  imageFile: File
) => {
  // Only attempt verification if we have a valid userId (not temp-)
  if (!userId || userId.startsWith('temp-')) {
    console.warn(
      'No user ID received from server or temporary ID used, skipping verification'
    );
    return;
  }

  try {
    // Try to trigger face processing via verify-face endpoint
    if (imageFile) {
      console.log(
        'Attempting to trigger face processing via verify-face endpoint'
      );
      const verifyFormData = new FormData();
      verifyFormData.append('file', imageFile);

      fetch(`${BASE_API_URL}/api/verify-face`, {
        method: 'POST',
        body: verifyFormData,
      })
        .then((response) => {
          if (response.ok) {
            console.log(
              'Face verification successful, this may help generate face_id'
            );
          }
        })
        .catch((verifyError) => {
          console.error('Error during face verification:', verifyError);
        });
    }
  } catch (verifyError) {
    console.error('Error during face verification:', verifyError);
  }
};
