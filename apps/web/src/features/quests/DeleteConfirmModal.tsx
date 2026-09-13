import React from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Quest } from '../../lib/types';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  quest: Quest | null;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  quest,
  isDeleting,
}) => {
  if (!quest) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Purge Quest Scroll" maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start space-x-3 text-coral">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you certain you wish to purge <strong className="text-slate-100">"{quest.title}"</strong> from your quest log? This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} isLoading={isDeleting}>
            Purge Quest
          </Button>
        </div>
      </div>
    </Modal>
  );
};
