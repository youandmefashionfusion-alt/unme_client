// components/DirectCloudinaryUpload.js
import { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

const DirectCloudinaryUpload = ({ onUploadSuccess, onUploadError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    formData.append('folder', 'product-reviews');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadToCloudinary(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onUploadSuccess?.({
          info: {
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
          }
        });
        toast.success('Image uploaded successfully!');
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      setPreviewUrl('');
      toast.error('Failed to upload image. Please try again.');
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [onUploadSuccess, onUploadError]);

  const handleRemovePreview = () => {
    setPreviewUrl('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = e.dataTransfer.files;
      handleFileSelect({ target: input });
    }
  };

  if (previewUrl) {
    return (
      <div className="direct-upload-preview">
        <div className="preview-image-container">
          <Image 
            src={previewUrl} 
            alt="Preview" 
            width={200} 
            height={200}
            className="preview-image"
          />
          <button 
            onClick={handleRemovePreview}
            className="remove-preview-btn"
            type="button"
            disabled={isUploading}
          >
            <X size={16} />
          </button>
        </div>
        {isUploading && (
          <div className="upload-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            />
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="direct-upload-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="cloudinary-upload"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={isUploading}
        style={{ display: 'none' }}
      />
      <label 
        htmlFor="cloudinary-upload"
        className={`upload-label ${isUploading ? 'uploading' : ''}`}
      >
        <div className="upload-content">
          <Upload size={24} />
          <span className="upload-text">
            {isUploading ? 'Uploading...' : 'Click to upload or drag & drop'}
          </span>
          <span className="upload-hint">
            PNG, JPEG, WEBP (Max 5MB)
          </span>
        </div>
      </label>
    </div>
  );
};

export default DirectCloudinaryUpload;