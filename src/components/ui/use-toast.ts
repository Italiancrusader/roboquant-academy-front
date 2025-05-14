
// Re-export hooks from the correct location
import { useToast as useToastHook, toast as toastFunction } from "@/hooks/use-toast";

// Re-export with the correct names
export const useToast = useToastHook;
export const toast = toastFunction;
