"use client";

import { Menu } from "lucide-react";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { SearchBox } from "@/components/layout/search-box";
import { Button } from "@/components/ui/button";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu />
      </Button>
      <SearchBox />
      <div className="ml-auto flex items-center gap-1">
        <NotificationsMenu />
        <ProfileMenu />
      </div>
    </header>
  );
}
