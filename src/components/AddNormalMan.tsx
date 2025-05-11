import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const AddNormalMan: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  // Add file input handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Add form input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {error && <div className="bg-red-100 p-3 mb-4 text-red-700 rounded">{error}</div>}
      {success && <div className="bg-green-100 p-3 mb-4 text-green-700 rounded">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
          {previewUrl && (
            <div className="mt-2">
              <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded" />
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Submitting...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default AddNormalMan;
