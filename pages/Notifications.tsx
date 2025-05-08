import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeProvider } from "@/components/theme-provider";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
  read: boolean;
}

export default function Notifications() {
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      return response.json();
    }
  });

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="container max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-3">
            {notifications?.map((notification) => (
              <Card 
                key={notification.id} 
                className={`p-4 relative ${!notification.read ? 'border-l-4 border-primary' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary"/>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </ThemeProvider>
  );
}