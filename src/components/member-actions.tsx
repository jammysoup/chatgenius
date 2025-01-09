import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Shield, UserX } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

type MemberActionsProps = {
  member: {
    id: string;
    name: string | null;
    email: string | null;
    role: string | null;
  };
  onUpdate?: () => void;
};

export function MemberActions({ member, onUpdate }: MemberActionsProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Only workspace owners can manage members
  if (session?.user?.role !== "owner" || member.role === "owner") {
    return null;
  }

  const handlePromoteToAdmin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workspace/members/${member.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update member role");
      }

      onUpdate?.();
    } catch (error) {
      console.error("Error updating member role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workspace/members/${member.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove member");
      }

      onUpdate?.();
    } catch (error) {
      console.error("Error removing member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-900"
          disabled={isLoading}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {member.role !== "admin" && (
          <DropdownMenuItem
            onClick={handlePromoteToAdmin}
            className="text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <Shield className="h-4 w-4 mr-2" />
            Make Admin
          </DropdownMenuItem>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-red-600 hover:text-red-700 cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <UserX className="h-4 w-4 mr-2" />
              Remove Member
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {member.name || member.email} from the workspace?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveMember}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 