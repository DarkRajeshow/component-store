# Component Model Test Examples

This file contains examples for testing the component model functionality.

## Test Data Examples

### Valid Component Creation
```json
{
  "name": "Main Bearing Housing",
  "description": "Primary bearing housing for engine assembly",
  "componentCode": "MBH-001",
  "issueNumber": "01",
  "latestRevisionNumber": "00",
  "remark": "Initial design for main bearing housing",
  "notifyTo": ["user1", "user2", "user3"]
}
```

### Valid File Names
- `MBH-001_01_00.pdf` ✅
- `ABC123_02_01.pdf` ✅
- `XYZ-456_10_99.pdf` ✅

### Invalid File Names
- `MBH-001_01_00.txt` ❌ (wrong extension)
- `MBH-001_01.pdf` ❌ (missing revision number)
- `MBH-001_01_00_extra.pdf` ❌ (extra parts)
- `mbh-001_01_00.pdf` ❌ (wrong case)

## API Test Examples

### Create Component
```bash
curl -X POST http://localhost:5000/api/components \
  -H "Content-Type: multipart/form-data" \
  -F "name=Test Component" \
  -F "description=Test description" \
  -F "componentCode=TEST-001" \
  -F "issueNumber=01" \
  -F "revisionNumber=00" \
  -F "remark=Initial test revision" \
  -F "date=2024-01-15" \
  -F "notifyTo=[\"user1\",\"user2\"]" \
  -F "file=@test-file.pdf"
```

### Get Components with Filters
```bash
curl -X GET "http://localhost:5000/api/components?componentCode=TEST&page=1&limit=10&sortBy=createdAt&sortOrder=desc"
```

### Upload Revision
```bash
curl -X POST http://localhost:5000/api/components/COMPONENT_ID/revisions \
  -H "Content-Type: multipart/form-data" \
  -F "issueNumber=01" \
  -F "revisionNumber=01" \
  -F "remark=Updated design" \
  -F "date=2024-01-20" \
  -F "componentCode=TEST-001" \
  -F "file=@test-revision.pdf"
```

## Frontend Test Examples

### Test Component Creation
```typescript
// Test the component creation modal
const testComponent = {
  name: "Test Component",
  description: "Test description",
  componentCode: "TEST-001",
  issueNumber: "01",
  latestRevisionNumber: "00",
  remark: "Initial test revision",
  notifyTo: ["user1", "user2"]
};

// Create a test file
const testFile = new File(['test content'], 'TEST-001_01_00.pdf', {
  type: 'application/pdf'
});

// Test form submission
const formData = new FormData();
formData.append('name', testComponent.name);
formData.append('description', testComponent.description);
formData.append('componentCode', testComponent.componentCode);
formData.append('issueNumber', testComponent.issueNumber);
formData.append('revisionNumber', testComponent.latestRevisionNumber);
formData.append('remark', testComponent.remark);
formData.append('date', new Date().toISOString().split('T')[0]);
formData.append('notifyTo', JSON.stringify(testComponent.notifyTo));
formData.append('file', testFile);

await createComponent(formData);
```

### Test Search and Filtering
```typescript
// Test search functionality
const searchFilters = {
  componentCode: 'TEST',
  description: 'test',
  createdBy: 'user1',
  issueNumber: '01',
  latestRevisionNumber: '00',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  page: 1,
  limit: 25,
  sortBy: 'createdAt',
  sortOrder: 'desc' as const
};

const results = await getComponents(searchFilters);
console.log('Search results:', results);
```

### Test Notifications
```typescript
// Test socket connection
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});

socket.on('component-created', (data) => {
  console.log('Component created:', data);
});

socket.on('revision-uploaded', (data) => {
  console.log('Revision uploaded:', data);
});

socket.on('component-updated', (data) => {
  console.log('Component updated:', data);
});

socket.on('component-deleted', (data) => {
  console.log('Component deleted:', data);
});
```

## Manual Testing Checklist

### Component Creation
- [ ] Open component creation modal
- [ ] Fill all required fields
- [ ] Upload file with correct naming convention
- [ ] Submit form
- [ ] Verify component appears in list
- [ ] Check notifications are sent

### Component Editing
- [ ] Open component details
- [ ] Click edit button
- [ ] Modify fields
- [ ] Save changes
- [ ] Verify changes are reflected
- [ ] Check notifications are sent

### Revision Upload
- [ ] Open component details
- [ ] Click upload revision
- [ ] Fill revision form
- [ ] Upload file with correct naming
- [ ] Submit form
- [ ] Verify revision appears in list
- [ ] Check notifications are sent

### Search and Filtering
- [ ] Use search bar
- [ ] Apply filters
- [ ] Sort by different columns
- [ ] Change page size
- [ ] Navigate through pages
- [ ] Clear filters

### File Validation
- [ ] Try uploading non-PDF file
- [ ] Try uploading file with wrong name
- [ ] Try uploading file > 10MB
- [ ] Verify error messages appear

### Notifications
- [ ] Create component
- [ ] Check toast notification appears
- [ ] Check audio plays
- [ ] Check socket events are received
- [ ] Verify notification in notification list

## Performance Testing

### Load Testing
```bash
# Test with many components
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/components \
    -F "name=Test Component $i" \
    -F "description=Test description $i" \
    -F "componentCode=TEST-$i" \
    -F "issueNumber=01" \
    -F "revisionNumber=00" \
    -F "remark=Test revision $i" \
    -F "date=2024-01-15" \
    -F "notifyTo=[\"user1\"]" \
    -F "file=@test-file.pdf"
done
```

### Search Performance
```typescript
// Test search performance with large dataset
const startTime = performance.now();
const results = await getComponents({ componentCode: 'TEST' });
const endTime = performance.now();
console.log(`Search took ${endTime - startTime}ms`);
```

## Error Testing

### Network Errors
```typescript
// Test offline behavior
navigator.onLine = false;
try {
  await createComponent(formData);
} catch (error) {
  console.log('Expected error:', error);
}
```

### Validation Errors
```typescript
// Test invalid data
const invalidData = {
  name: '', // Empty name
  description: 'Test',
  componentCode: 'TEST',
  notifyTo: [] // Empty notifyTo
};

try {
  await createComponent(invalidData);
} catch (error) {
  console.log('Validation error:', error);
}
```

## Browser Testing

### Cross-browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Mobile Testing
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design
- [ ] Touch interactions

### Accessibility Testing
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast
- [ ] Focus indicators 