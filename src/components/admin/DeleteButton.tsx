import React, { useState } from 'react';
import ConfirmationModal from '../ui/ConfirmationModal';

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  itemName?: string;
  className?: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ 
  onDelete, 
  itemName = 'item',
  className = "text-red-600 hover:text-red-900 ml-2" 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmDelete = async () => {
    await onDelete();
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        Delete
      </button>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this ${itemName}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default DeleteButton;
