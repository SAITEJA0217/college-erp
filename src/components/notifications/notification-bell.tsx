"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/features/notifications/actions";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const [{ count }, { data }] = await Promise.all([
      getUnreadCount(userId),
      getNotifications(userId)
    ]);
    
    setUnreadCount(count);
    setNotifications(data || []);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();

    if (!userId) return;

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications, supabase]);

  const handleMarkAsRead = async (id: string, link?: string) => {
    await markAsRead(id);
    setUnreadCount(prev => Math.max(0, prev - 1));
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    if (link) {
      router.push(link);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(userId);
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  if (!userId) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-auto px-2 py-1 text-xs">
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-1 p-2">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`flex flex-col gap-1 rounded-md p-3 text-sm transition-colors cursor-pointer hover:bg-muted ${!notification.is_read ? 'bg-muted/50 font-medium' : ''}`}
                onClick={() => handleMarkAsRead(notification.id, notification.link)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold">{notification.title}</span>
                  {!notification.is_read && <span className="flex h-2 w-2 mt-1.5 rounded-full bg-primary shrink-0" />}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">{notification.body}</span>
                <span className="text-[10px] text-muted-foreground/80 mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
