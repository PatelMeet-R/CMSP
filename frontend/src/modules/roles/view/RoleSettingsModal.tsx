import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import RolePermissionMatrixView from "./RolePermissionMatrixView";

export function RoleSettingsModal({
  roleId,
  roleName,
}: {
  roleId: string;
  roleName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <ShieldCheck className="w-4 h-4 mr-2" />
        Manage Base Permissions
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Global Permissions: {roleName}</DialogTitle>
          </DialogHeader>

          {isOpen && <RolePermissionMatrixView roleId={roleId} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
