import { toast } from "react-toastify";

export function useToast() {
  return {
    showErrorToast: (message: string) => {
      toast.error(message);
    },
  };
}
