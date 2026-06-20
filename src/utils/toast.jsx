import { toast } from 'react-toastify';
import { collectErrorMessages } from './validation';

const defaultOptions = {
  position: 'top-right',
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export function notifySuccess(message) {
  toast.success(message, { ...defaultOptions, autoClose: 3000 });
}

export function notifyError(message) {
  toast.error(message, { ...defaultOptions, autoClose: 4000 });
}

export function notifyValidationErrors(errors) {
  const messages = collectErrorMessages(errors);

  if (messages.length === 0) {
    notifyError('Please fix the errors in the form.');
    return;
  }

  if (messages.length === 1) {
    notifyError(messages[0]);
    return;
  }

  toast.error(
    () => (
      <div>
        <p className="mb-1 font-semibold">Please fix the following:</p>
        <ul className="list-disc space-y-0.5 pl-4 text-sm">
          {messages.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      </div>
    ),
    { ...defaultOptions, autoClose: 5000 },
  );
}
