import { toast } from "@/hooks/useToast";

type ToastType = "success" | "error" | "info" | "warning";

export const showToast = (message: string, type: ToastType = "info") => {
  switch (type) {
    case "success":
      toast({
        title: "Success",
        description: message,
        variant: "default",
      });
      break;
    case "error":
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      break;
    case "warning":
      toast({
        title: "Warning",
        description: message,
        variant: "default",
      });
      break;
    case "info":
    default:
      toast({
        title: "Info",
        description: message,
        variant: "default",
      });
      break;
  }
};
