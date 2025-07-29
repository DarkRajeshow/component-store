import { useState } from 'react';
import { ComponentTable } from '../components/ComponentTable';
import { ComponentCreateModal } from '../components/ComponentCreateModal';
import { useComponentNotifications } from '../hooks/useComponentNotifications';

// Assume userId is available from auth context or similar
const userId = localStorage.getItem('userId') || '';

export function ComponentListPage() {
  useComponentNotifications(userId);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateSuccess = () => {
    // Refresh the table data
    // The ComponentTable will automatically refetch due to its useEffect
  };

  return (
    <>
      <div className="mx-auto p-6">
        <ComponentTable
          onCreate={() => setShowCreateModal(true)}
        />
      </div>
      <ComponentCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
} 