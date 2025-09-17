# Admin Banner Management System

## Overview
A comprehensive admin interface that allows administrators to dynamically edit the home page banner content including text, images, and statistics without code changes.

## Features

### 🎨 **Banner Content Management**
- **Dynamic Text Editing**: Main title, subtitle, and description
- **Button Customization**: Primary and secondary button text
- **Image Management**: Upload and manage banner images with preview
- **Statistics Section**: Customizable stats with counts and labels
- **Live Preview**: Real-time preview of changes before saving
- **Reset Functionality**: One-click reset to default settings

### 🔧 **Technical Features**
- **Image Upload**: Supports multiple formats with 5MB size limit
- **Responsive Design**: Preview matches actual home page layout
- **Error Handling**: Graceful fallbacks for API failures
- **Auto-save**: Preserves changes immediately
- **URL Handling**: Supports both uploaded images and external URLs

## Implementation

### Backend Components

#### 1. **Banner Model** (`backend/model/banner.js`)
```javascript
{
  title: String,           // Main banner title
  subtitle: String,        // Highlighted subtitle
  description: String,     // Banner description
  image: String,          // Image URL or path
  buttonText: String,     // Primary button text
  secondaryButtonText: String, // Secondary button text
  stats: {                // Statistics section
    customers: { count, label },
    products: { count, label },
    satisfaction: { count, label }
  },
  isActive: Boolean,      // Banner status
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **Banner API Endpoints** (`backend/controller/banner.js`)
- `GET /api/v2/banner/get-banner` - Public endpoint for frontend
- `GET /api/v2/banner/admin/get-banner` - Admin-only detailed view
- `PUT /api/v2/banner/update-banner` - Update banner (Admin only)
- `POST /api/v2/banner/reset-banner` - Reset to defaults (Admin only)

### Frontend Components

#### 1. **Admin Banner Editor** (`frontend/src/components/Admin/AdminBannerEditor.jsx`)
**Features:**
- Form-based content editing
- Image upload with preview
- Live banner preview mode
- Statistics management
- Save/Reset functionality

#### 2. **Updated Hero Component** (`frontend/src/components/Route/Hero/Hero.jsx`)
**Features:**
- Dynamic content loading from API
- Fallback to default values
- Error handling for images
- Loading states

#### 3. **Admin Dashboard Integration**
- Added "Home Banner" menu item to admin sidebar
- New route `/admin-banner`
- Protected admin-only access

## Usage Guide

### For Administrators

#### **Accessing Banner Management:**
1. Login as admin
2. Navigate to Admin Dashboard
3. Click "Home Banner" in the sidebar

#### **Editing Banner Content:**
1. **Text Content**: Edit title, subtitle, description, and button text
2. **Image Upload**: 
   - Click "Upload New Image"
   - Select image file (max 5MB)
   - Preview shows immediately
3. **Statistics**: Update counts and labels for all three stats
4. **Preview**: Click "Preview" to see live banner appearance
5. **Save**: Click "Save Changes" to apply updates
6. **Reset**: Click "Reset to Default" to restore original content

### For Developers

#### **Adding New Fields:**
1. Update banner model schema
2. Add fields to API endpoints
3. Update admin form interface
4. Modify Hero component to use new fields

#### **Customizing Preview:**
The preview mode in `AdminBannerEditor.jsx` should match the actual `Hero.jsx` styling for accuracy.

## API Endpoints

### Public Endpoints
```javascript
GET /api/v2/banner/get-banner
// Returns active banner data for public use
```

### Admin Endpoints
```javascript
GET /api/v2/banner/admin/get-banner
// Returns detailed banner data for admin editing

PUT /api/v2/banner/update-banner
// Updates banner content (multipart form data for image upload)
// Body: FormData with text fields and optional image file

POST /api/v2/banner/reset-banner
// Resets banner to default values
```

## File Structure
```
backend/
├── model/banner.js              # Banner data model
├── controller/banner.js         # Banner API endpoints
└── uploads/                     # Image upload directory

frontend/
├── components/
│   ├── Admin/
│   │   └── AdminBannerEditor.jsx    # Main admin interface
│   ├── Layout/
│   │   └── AdminSideBar.jsx         # Updated with banner menu
│   └── Route/Hero/
│       └── Hero.jsx                 # Updated to use dynamic content
└── pages/
    └── AdminDashboardBanner.jsx     # Banner management page
```

## Database Schema

The banner collection stores:
- Content fields (title, subtitle, description)
- Button text customizations
- Image URL/path
- Statistics data with counts and labels
- Metadata (active status, timestamps)

## Security Features

- **Admin-only Access**: All banner management requires admin authentication
- **File Validation**: Image uploads validated for type and size
- **Input Sanitization**: All text inputs are sanitized
- **Protected Routes**: Admin routes protected by authentication middleware

## Future Enhancements

### Potential Features:
- **Multiple Banners**: Support for multiple banner layouts
- **Scheduling**: Time-based banner activation
- **A/B Testing**: Multiple banner versions with analytics
- **Template Library**: Pre-designed banner templates
- **Animation Settings**: Customizable banner animations
- **SEO Settings**: Meta tags and alt text management

## Troubleshooting

### Common Issues:

1. **Image Not Displaying**:
   - Check file upload permissions
   - Verify image path in database
   - Ensure image file exists in uploads directory

2. **Changes Not Reflecting**:
   - Clear browser cache
   - Check API response for errors
   - Verify admin authentication

3. **Upload Errors**:
   - Check file size (max 5MB)
   - Verify file type (images only)
   - Ensure uploads directory exists and is writable

## Best Practices

- **Image Optimization**: Compress images before upload for better performance
- **Content Guidelines**: Keep text concise and engaging
- **Regular Backups**: Backup banner configurations before major changes
- **Testing**: Always preview changes before saving
- **Mobile Preview**: Test banner appearance on mobile devices