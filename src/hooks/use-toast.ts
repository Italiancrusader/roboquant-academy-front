
import { useToast as useToastOriginal } from "@/components/ui/toast"

// Re-export the useToast hook
export const useToast = useToastOriginal;

// Re-export the toast function
export { toast } from "@/components/ui/toast";
