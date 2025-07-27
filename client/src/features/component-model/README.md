# Component Model Management System

This module provides a comprehensive engineering drawing version management system for managing component models and their file revisions.

## Features

### 🧩 Component Management
- **Create Components**: Create new component designs with metadata and initial revision
- **Edit Components**: Update component information and notification settings
- **Delete Components**: Safely delete components with all associated files
- **View Details**: Comprehensive component details with revision history

### 🔄 Revision Management
- **Upload Revisions**: Upload new revision files with validation
- **File Naming Convention**: Strict validation for filename format: `<ComponentCode>_<IssueNumber>_<RevisionNumber>.pdf`
- **Revision History**: Track all revisions with metadata and file access
- **PDF Viewer**: Direct access to revision files

### 🔍 Advanced Search & Filtering
- **Real-time Search**: Search by component code, name, or description
- **Advanced Filters**: Filter by issue number, revision number, creator, date range
- **Sorting**: Sort by any field in ascending or descending order
- **Pagination**: Efficient pagination with configurable page sizes

### 🔔 Real-time Notifications
- **Socket.IO Integration**: Real-time notifications for component events
- **Audio Alerts**: Notification sounds for important events
- **Toast Notifications**: User-friendly toast messages
- **Event Types**:
  - Component Created
  - Component Updated
  - Component Deleted
  - Revision Uploaded

### 📁 File Management
- **Secure Storage**: Files stored with UUID names for security
- **PDF Validation**: Only PDF files accepted
- **File Size Limits**: 10MB maximum file size
- **Automatic Cleanup**: Old files removed when components are deleted

## File Structure

```
component-model/
├── components/
│   ├── ComponentCreateModal.tsx    # Component creation/editing modal
│   ├── ComponentDetailsPage.tsx    # Component details view
│   ├── ComponentTable.tsx          # Main component listing table
│   └── RevisionUploadModal.tsx     # Revision upload modal
├── hooks/
│   ├── useComponentNotifications.ts # Socket.IO notification handling
│   └── useComponentStore.ts        # Zustand state management
├── pages/
│   ├── ComponentDetailsPage.tsx    # Page wrapper for details
│   └── ComponentListPage.tsx       # Main listing page
├── services/
│   └── api.ts                      # API service functions
├── types/
│   └── index.ts                    # TypeScript type definitions
└── README.md                       # This file
```

## API Endpoints

### Components
- `POST /api/components` - Create component with initial revision
- `GET /api/components` - Get components with filtering
- `GET /api/components/:id` - Get component details
- `PUT /api/components/:id` - Update component
- `DELETE /api/components/:id` - Delete component

### Revisions
- `POST /api/components/:id/revisions` - Upload new revision

## Usage Examples

### Creating a Component
```typescript
// The ComponentCreateModal handles this automatically
const formData = new FormData();
formData.append('name', 'Main Bearing Housing');
formData.append('description', 'Primary bearing housing for engine');
formData.append('componentCode', 'MBH-001');
formData.append('issueNumber', '01');
formData.append('revisionNumber', '00');
formData.append('remark', 'Initial design');
formData.append('date', '2024-01-15');
formData.append('notifyTo', JSON.stringify(['user1', 'user2']));
formData.append('file', fileInput.files[0]);

await createComponent(formData);
```

### Searching Components
```typescript
const filters = {
  componentCode: 'MBH',
  description: 'bearing',
  createdBy: 'user123',
  issueNumber: '01',
  latestRevisionNumber: '00',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  page: 1,
  limit: 25,
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

const result = await getComponents(filters);
```

### Uploading a Revision
```typescript
const formData = new FormData();
formData.append('issueNumber', '01');
formData.append('revisionNumber', '01');
formData.append('remark', 'Updated dimensions');
formData.append('date', '2024-01-20');
formData.append('componentCode', 'MBH-001');
formData.append('file', fileInput.files[0]);

await uploadRevision(componentId, formData);
```

## File Naming Convention

All revision files must follow this strict naming convention:
```
<ComponentCode>_<IssueNumber>_<RevisionNumber>.pdf
```

**Examples:**
- `MBH-001_01_00.pdf` - Initial revision
- `MBH-001_01_01.pdf` - First revision
- `MBH-001_02_00.pdf` - New issue

## Notification Events

The system emits the following Socket.IO events:

### Component Events
- `component-created` - New component created
- `component-updated` - Component metadata updated
- `component-deleted` - Component deleted

### Revision Events
- `revision-uploaded` - New revision uploaded

### General Events
- `new-notification` - Any notification (includes component events)

## State Management

Uses Zustand for state management with the following store structure:

```typescript
interface ComponentStoreState {
  // Filter fields
  componentCode: string;
  description: string;
  createdBy: string;
  issueNumber: string;
  latestRevisionNumber: string;
  startDate: string;
  endDate: string;
  
  // Pagination
  page: number;
  limit: number;
  
  // Sorting
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setFilter: (filter: Partial<ComponentFilterParams>) => void;
  reset: () => void;
}
```

## Error Handling

The system includes comprehensive error handling:

- **File Validation**: Filename format validation
- **File Type**: Only PDF files accepted
- **File Size**: 10MB maximum
- **Required Fields**: All required fields validated
- **User Permissions**: Authentication required
- **Network Errors**: Graceful error handling with user feedback

## Security Features

- **File Isolation**: Files stored with UUID names
- **Authentication**: JWT-based authentication required
- **Input Validation**: Server-side validation for all inputs
- **File Type Restriction**: Only PDF files allowed
- **Size Limits**: Prevents large file uploads

## Performance Optimizations

- **Debounced Search**: 400ms debounce on search inputs
- **Pagination**: Efficient pagination to handle large datasets
- **Lazy Loading**: Components loaded on demand
- **Caching**: Zustand store for client-side caching
- **File Streaming**: Efficient file upload/download

## Dependencies

### Frontend
- React + TypeScript
- Zustand (state management)
- Socket.IO Client (real-time notifications)
- React Hook Form + Zod (form validation)
- Shadcn UI (components)
- Lucide React (icons)
- Sonner (toast notifications)

### Backend
- Express.js + TypeScript
- Multer (file uploads)
- Mongoose (MongoDB ODM)
- Socket.IO (real-time notifications)
- UUID (file naming)
- fs-extra (file operations)

## Best Practices

1. **File Naming**: Always follow the strict naming convention
2. **Validation**: Validate files on both client and server
3. **Error Handling**: Provide clear error messages to users
4. **Notifications**: Use appropriate notification types
5. **Performance**: Use debounced search and pagination
6. **Security**: Validate all inputs and file types
7. **UX**: Provide clear feedback for all actions

## Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check file name format
   - Ensure file is PDF
   - Verify file size < 10MB

2. **Notifications Not Working**
   - Check Socket.IO connection
   - Verify authentication token
   - Check browser console for errors

3. **Search Not Working**
   - Check network connection
   - Verify API endpoint
   - Check filter parameters

4. **Component Not Found**
   - Verify component ID
   - Check user permissions
   - Ensure component exists

### Debug Mode

Enable debug logging by setting:
```typescript
localStorage.setItem('debug', 'component-model:*');
```

## Contributing

When contributing to this module:

1. Follow TypeScript best practices
2. Add proper error handling
3. Include unit tests
4. Update documentation
5. Follow the existing code style
6. Test file upload functionality
7. Verify notification system

## License

This module is part of the larger component store application. 