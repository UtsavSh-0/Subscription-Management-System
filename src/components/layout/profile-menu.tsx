"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL } from "@/lib/nav";
import { initials } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function ProfileMenu() {
  const { user, logout } = useAppStore();
  const router = useRouter();

  async function signOut() {
    if (!user) return;
    logout();
    router.replace(`/${user.role}/login`);
  }

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 pr-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-medium text-primary-foreground">{initials(user.name)}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-medium">{user.name}</span>
          <span className="block text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</span>
        </span>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-2">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <Badge variant="info" className="mt-2">{ROLE_LABEL[user.role]}</Badge>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${user.role}/profile`}><User /> Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={signOut}><LogOut /> Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
