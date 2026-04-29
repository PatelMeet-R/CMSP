import { Award, Mail, Phone, MapPin } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useHodProfileViewModel } from "../viewModel/useHodProfileViewModel";

interface HodProfileModalProps {
  branchId?: string;
  branchName?: string;
  hodRoleId?: string;
}

export function HodProfileModal({
  branchId,
  branchName,
  hodRoleId,
}: HodProfileModalProps) {
  const vm = useHodProfileViewModel({ branchId, hodRoleId });

  return (
    <Dialog open={vm.isOpen} onOpenChange={vm.setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 shadow-sm hover:bg-primary/5 hover:text-primary transition-colors"
        >
          <Award className="w-4 h-4" />
          View Department Head
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Department Head Profile</DialogTitle>
          <DialogDescription className="sr-only">
            Contact and profile details for the Head of Department.
          </DialogDescription>
        </DialogHeader>

        {vm.isLoading ? (
          <div className="flex flex-col items-center text-center space-y-4 py-4 animate-pulse">
            <Skeleton className="h-24 w-24 rounded-full border-2 border-primary/20" />
            <div className="space-y-2 w-full flex flex-col items-center">
              <Skeleton className="h-7 w-48 rounded-md" />
              <Skeleton className="h-5 w-32 rounded-full" />
            </div>
            <div className="w-full bg-muted/30 rounded-lg p-4 space-y-4 mt-4 border border-transparent">
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded-sm shrink-0" />
                <Skeleton className="h-4 w-3/4 rounded-sm" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded-sm shrink-0" />
                <Skeleton className="h-4 w-1/2 rounded-sm" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded-sm shrink-0" />
                <Skeleton className="h-4 w-2/3 rounded-sm" />
              </div>
            </div>
          </div>
        ) : !vm.hodDetails ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              No Department Head assigned yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-200">
            <Avatar className="h-24 w-24 border-2 border-primary shadow-sm">
              <AvatarImage
                src={
                  vm.hodDetails?.profileImageUrl ||
                  vm.hodDetails?.profileImage?.url
                }
                alt="HOD Profile"
              />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {vm.hodDetails?.firstName?.[0]}
                {vm.hodDetails?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h3 className="text-xl font-bold">
                {vm.hodDetails.firstName} {vm.hodDetails.lastName}
              </h3>
              <Badge
                variant="secondary"
                className="font-medium bg-primary/10 text-primary"
              >
                Head of {branchName || "Department"}
              </Badge>
            </div>

            <div className="w-full bg-muted/30 rounded-lg p-4 space-y-3 mt-4 text-sm text-left border">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {vm.hodDetails.email || "No email provided"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>
                  {vm.hodDetails.primaryMobileNumber || "No phone provided"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>
                  {vm.hodDetails.city
                    ? `${vm.hodDetails.city}, ${vm.hodDetails.state}`
                    : "Location not provided"}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
