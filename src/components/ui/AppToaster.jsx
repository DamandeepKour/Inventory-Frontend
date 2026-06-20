import { ToastContainer } from 'react-toastify';

export default function AppToaster() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      toastClassName="!rounded-xl !text-sm !shadow-lg"
    />
  );
}
