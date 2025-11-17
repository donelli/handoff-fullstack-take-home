import { toast } from "react-toastify";

export function useToast() {
  return {
    showErrorToast: (message: string) => {
      toast.error(message);
    },
    showSuccessToast: (message: string) => {
      toast.success(message);
    },
  };
}
