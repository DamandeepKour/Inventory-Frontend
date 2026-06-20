import Button from './Button';
import Modal from './Modal';

export default function ConfirmDeleteModal({
  open,
  title = 'Confirm delete',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  loading = false,
  onClose,
  onConfirm,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-gray-900">{message}</p>
      <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
