"use client"

import { useLogout } from "@/hooks/useLogout";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useGetMyProfile } from "@/hooks/useGetMyProfile";
import { Skeleton } from "./ui/skeleton";

export default function Header() {
  return (
    <header className="w-full mt-2">
      <div className="max-w-screen-2xl w-full mx-auto py-2 bg-orange-200/50 rounded-xl px-4 border border-border">
        <div className="grid grid-cols-2 items-center">
          <div className="text-2xl font-bold">Quản lý chi tiêu</div>
          <div className="flex justify-end">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}

function UserMenu() {
  const { userProfile, isLoading } = useGetMyProfile();
  const { logout, isPending } = useLogout()

  return (
    <>
      {
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              {isLoading ? (
                <Skeleton className="size-8 rounded-full" />
              ) : (
                <AvatarFallback>
                  {userProfile?.displayName?.charAt(0).toUpperCase() || userProfile?.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {isLoading ? (
              <DropdownSkeleton />
            ) : (
              <>
                <DropdownMenuGroup>
                  <div className="grid grid-cols-4 w-full p-0.5">
                    <Avatar className="size-10">
                      <AvatarFallback>
                        {userProfile?.displayName?.charAt(0).toUpperCase() || userProfile?.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="col-span-3">
                      <p className="font-medium truncate">{userProfile?.displayName || userProfile?.email}</p>
                      <p className="text-sm text-muted-foreground truncate">{userProfile?.email}</p>
                    </div>
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    disabled={isPending}
                    onClick={() => logout()}
                  >
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      }
    </>

  )
}

function DropdownSkeleton() {
  return (
    <>
      <DropdownMenuGroup>
        <div className="grid grid-cols-4 w-full p-0.5">
          <Avatar className="size-10">
            <Skeleton className="size-10 rounded-full" />
          </Avatar>
          <div className="col-span-3 space-y-1">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
          </div>
        </div>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Skeleton className="w-full h-4" />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Skeleton className="w-full h-4" />
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Skeleton className="w-full h-4" />
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  )
}