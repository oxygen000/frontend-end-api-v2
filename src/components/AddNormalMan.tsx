const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setIsLoading(true);

  try {
    // Validate form fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      throw new Error('Please fill in all required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error('Please enter a valid email address');
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      throw new Error('Please enter a valid 10-digit phone number');
    }

    // Validate image
    if (!selectedImage) {
      throw new Error('Please select an image');
    }

    // Check image size (max 5MB)
    if (selectedImage.size > 5 * 1024 * 1024) {
      throw new Error('Image size should be less than 5MB');
    }

    // Check image type
    if (
      !['image/jpeg', 'image/png', 'image/jpg'].includes(selectedImage.type)
    ) {
      throw new Error('Please upload a valid image file (JPEG, PNG)');
    }

    // Create form data
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('image', selectedImage);

    // First, verify face detection
    const faceResponse = await fetch('/api/verify-face', {
      method: 'POST',
      body: formDataToSend,
    });

    if (!faceResponse.ok) {
      const errorData = await faceResponse.json();
      throw new Error(errorData.error || 'Face verification failed');
    }

    // If face verification successful, proceed with registration
    const response = await fetch('/api/register', {
      method: 'POST',
      body: formDataToSend,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    setSuccess('Registration successful!');
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
    setSelectedImage(null);
    setPreviewUrl('');
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'An error occurred during registration'
    );
  } finally {
    setIsLoading(false);
  }
};
