// Utility functions for handling Cloudinary media URLs

/**
 * Get the URL from a media object (image or video)
 * Handles new Cloudinary object format only
 * @param {object} media - Media item (object with url property)
 * @param {string} backendUrl - Backend URL (not used for Cloudinary URLs)
 * @returns {string} - Cloudinary URL for the media
 */
export const getMediaUrl = (media, backendUrl = '') => {
  if (!media) return '';
  
  // New Cloudinary format - object with URL property
  if (typeof media === 'object' && media.url) {
    return media.url;
  }
  
  return '';
};

/**
 * Get image URL from product images array
 * @param {Array} images - Array of image objects or strings
 * @param {number} index - Index of the image (default: 0)
 * @param {string} backendUrl - Backend URL for local files
 * @returns {string} - Image URL
 */
export const getProductImageUrl = (images, index = 0, backendUrl = '') => {
  if (!images || !Array.isArray(images) || images.length === 0) return '';
  return getMediaUrl(images[index], backendUrl);
};

/**
 * Get video URL from product videos array
 * @param {Array} videos - Array of video objects or strings
 * @param {number} index - Index of the video (default: 0)
 * @param {string} backendUrl - Backend URL for local files
 * @returns {string} - Video URL
 */
export const getProductVideoUrl = (videos, index = 0, backendUrl = '') => {
  if (!videos || !Array.isArray(videos) || videos.length === 0) return '';
  return getMediaUrl(videos[index], backendUrl);
};

/**
 * Get all media URLs from product (both images and videos)
 * @param {object} product - Product object
 * @param {string} backendUrl - Backend URL for local files
 * @returns {Array} - Array of media URLs with type info
 */
export const getAllProductMedia = (product, backendUrl = '') => {
  const media = [];
  
  // Add images
  if (product?.images && Array.isArray(product.images)) {
    product.images.forEach((image, index) => {
      media.push({
        url: getMediaUrl(image, backendUrl),
        type: 'image',
        index: index,
        originalData: image
      });
    });
  }
  
  // Add videos
  if (product?.videos && Array.isArray(product.videos)) {
    product.videos.forEach((video, index) => {
      media.push({
        url: getMediaUrl(video, backendUrl),
        type: 'video',
        index: index,
        originalData: video
      });
    });
  }
  return media;
};

/**
 * Get category image URL from category object
 * Handles new Cloudinary object format and legacy string format
 * @param {object|string} image - Category image data (Cloudinary object or legacy string)
 * @param {string} backendUrl - Backend URL for legacy files
 * @returns {string} - Image URL
 */
export const getCategoryImageUrl = (image, backendUrl = '') => {
  console.log('getCategoryImageUrl called with:', { image, backendUrl });
  
  if (!image) {
    console.log('No image provided');
    return '';
  }
  
  // New Cloudinary format - object with URL property
  if (typeof image === 'object' && image.url) {
    console.log('Using Cloudinary URL:', image.url);
    return image.url;
  }
  
  // Legacy format - string path
  if (typeof image === 'string') {
    // If it's already a full URL (starts with http), return as is
    if (image.startsWith('http')) {
      console.log('Using full URL:', image);
      return image;
    }
    // If it's a relative path, prepend backend URL
    const fullUrl = `${backendUrl}/${image}`;
    console.log('Using legacy URL:', fullUrl);
    return fullUrl;
  }
  
  console.log('Unknown image format:', typeof image, image);
  return '';
};

/**
 * Get banner image URL from banner object
 * Handles new Cloudinary object format and legacy string format
 * @param {object|string} image - Banner image data (Cloudinary object or legacy string)
 * @param {string} backendUrl - Backend URL for legacy files
 * @returns {string} - Image URL
 */
export const getBannerImageUrl = (image, backendUrl = '') => {
  if (!image) return '';
  
  // New Cloudinary format - object with URL property
  if (typeof image === 'object' && image.url) {
    return image.url;
  }
  
  // Legacy format - string path
  if (typeof image === 'string') {
    // If it's already a full URL (starts with http), return as is
    if (image.startsWith('http')) {
      return image;
    }
    // If it's a relative path, prepend backend URL
    return `${backendUrl}${image}`;
  }
  
  return '';
};

/**
 * Get avatar URL from user or shop object
 * Handles new Cloudinary object format only
 * @param {object} avatar - Avatar data (object with url property)
 * @param {string} backendUrl - Backend URL (not used for Cloudinary URLs)
 * @returns {string} - Cloudinary URL for the avatar or default avatar
 */
export const getAvatarUrl = (avatar, backendUrl = '') => {
  if (!avatar) return 'https://via.placeholder.com/150/6366F1/FFFFFF?text=User';
  
  // New Cloudinary format - object with URL property
  if (typeof avatar === 'object' && avatar.url) {
    return avatar.url;
  }
  
  return 'https://via.placeholder.com/150/6366F1/FFFFFF?text=User';
};