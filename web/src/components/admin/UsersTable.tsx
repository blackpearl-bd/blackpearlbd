import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, getTierColor } from '@/lib/utils';
import { useAdminUsers } from '@/hooks/useAdmin';

export function UsersTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { users, total, totalPages, isLoading } = useAdminUsers(page, search);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            Users ({total})
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Pearls</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                              <Users className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{user.full_name || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground truncate sm:hidden">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-sm text-muted-foreground hidden sm:table-cell">{user.email}</td>
                      <td className="py-3 px-3">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-sm text-foreground hidden md:table-cell">{user.pearls}</td>
                      <td className="py-3 px-3">
                        <Badge className={cn('text-xs', getTierColor(user.status))}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-sm text-muted-foreground hidden lg:table-cell">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
