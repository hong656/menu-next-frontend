import { Check, CheckCheck, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon: "orderPlaced" | "itemAdded";
  onPrimaryAction: () => void;
  primaryActionText: string;
  onSecondaryAction?: () => void;
  secondaryActionText?: ReactNode;
}

const StatusDialog = ({
  open,
  onOpenChange,
  title,
  description,
  icon,
  onPrimaryAction,
  primaryActionText,
  onSecondaryAction,
  secondaryActionText,
}: StatusDialogProps) => {
  const IconComponent =
    icon === "orderPlaced" ? (
      <div className="relative p-4 rounded-full">
        <FileText className="text-teal-500 !h-19 !w-19" />
        <CheckCheck className="text-teal-500 border-2 border-teal-500 border-solid absolute bottom-4 right-2 !h-8 !w-8 bg-white rounded-full" />
      </div>
    ) : (
      <div className="border-10 border-teal-500 border-solid p-4 rounded-full bg-green-100 dark:bg-green-900">
        <CheckCheck className="h-16 w-16 text-teal-500" />
      </div>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] text-center p-8">
        <DialogHeader className="items-center">
          {IconComponent}
          <DialogTitle className="mt-4 text-2xl font-bold">
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="block gap-2 space-y-2">
          {secondaryActionText && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              className="hover:text-green-700 rounded-full cursor-pointer hover:bg-teal-500 bg-teal-500/20 w-full text-green-700 border-green-600"
            >
              {secondaryActionText}
            </Button>
          )}
          <Button onClick={onPrimaryAction} className="cursor-pointer rounded-full w-full bg-teal-500 hover:bg-teal-600">
            {primaryActionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusDialog;