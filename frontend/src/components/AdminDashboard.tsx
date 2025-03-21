/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/utils/toast";
import { Loader2 } from "lucide-react";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
  picture: string;
  createdAt: string;
  lastLoginAt: string;
  role: string;
}

interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Helper function to format role name (remove underscores and capitalize)
const formatRoleName = (role: string) => {
  return role.replace(/_/g, " ");
};

// Helper function to safely format date
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Never";

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid"
      : new Date(date.getTime()).toLocaleString(undefined, {
          timeZone: "UTC",
        });
  } catch (e) {
    return "Invalid";
  }
};

const UserCard = ({
  user: u,
  currentUser,
  onRoleChange,
  onUserClick,
  getRoleBadgeColor,
  formatRoleName,
  formatDate,
}: {
  user: User;
  currentUser: User | null;
  onRoleChange: (userId: number, newRole: string) => void;
  onUserClick: (userId: number) => void;
  getRoleBadgeColor: (role: string) => string;
  formatRoleName: (role: string) => string;
  formatDate: (date: string | null | undefined) => string;
}) => (
  <Card className="mb-4" onClick={() => onUserClick(u.id)}>
    <CardContent className="pt-6 space-y-4">
      {/* User header with image and name */}
      <div className="flex items-center gap-3">
        <img src={u.picture} alt={u.name} className="w-10 h-10 rounded-full" />
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{u.name}</p>
          <p className="text-sm text-muted-foreground truncate">{u.email}</p>
        </div>
      </div>

      {/* Role information */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Current Role</p>
          <Badge className={getRoleBadgeColor(u.role)}>
            {formatRoleName(u.role)}
          </Badge>
        </div>
        {currentUser?.id !== u.id && (
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              value={u.role}
              onValueChange={(value) => onRoleChange(u.id, value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {/* Super admin can assign any role */}
                {currentUser?.role === "SUPER_ADMIN" && (
                  <>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="GDGC_LEAD">GDGC Lead</SelectItem>
                    <SelectItem value="CORE_TEAM">Core Team</SelectItem>
                    <SelectItem value="COMMUNITY">Community</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Last login info */}
      <div>
        <p className="text-sm text-muted-foreground">Last Login</p>
        <p className="text-sm">{formatDate(u.lastLoginAt)}</p>
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const navigate = useNavigate();

  const fetchUsers = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/admin/users?page=${page}&pageSize=${pageSize}`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        showToast("Failed to fetch users", "error");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("Error loading users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        showToast("User role updated successfully", "success");
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        showToast("Failed to update user role", "error");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      showToast("Error updating user role", "error");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-500";
      case "GDGC_LEAD":
        return "bg-blue-500";
      case "CORE_TEAM":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, pagination.pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    // Reset to first page when changing page size
    fetchUsers(1, size);
  };

  const handleUserClick = (userId: number) => {
    navigate(`/admin/users/${userId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="container mx-auto p-6 flex items-center justify-center h-[70vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Change Role</TableHead>
                      <TableHead>Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow
                        key={u.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleUserClick(u.id)}
                      >
                        <TableCell className="flex items-center gap-2">
                          <img
                            src={u.picture}
                            alt={u.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <span>{u.name}</span>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(u.role)}>
                            {formatRoleName(u.role)}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {user?.id !== u.id && (
                            <Select
                              value={u.role}
                              onValueChange={(value) =>
                                handleRoleChange(u.id, value)
                              }
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                {/* Super admin can assign any role */}
                                {user?.role === "SUPER_ADMIN" && (
                                  <>
                                    <SelectItem value="SUPER_ADMIN">
                                      Super Admin
                                    </SelectItem>
                                    <SelectItem value="GDGC_LEAD">
                                      GDGC Lead
                                    </SelectItem>
                                    <SelectItem value="CORE_TEAM">
                                      Core Team
                                    </SelectItem>
                                    <SelectItem value="COMMUNITY">
                                      Community
                                    </SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(u.lastLoginAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {users.map((u) => (
                  <UserCard
                    key={u.id}
                    user={u}
                    currentUser={user}
                    onRoleChange={handleRoleChange}
                    onUserClick={handleUserClick}
                    getRoleBadgeColor={getRoleBadgeColor}
                    formatRoleName={formatRoleName}
                    formatDate={formatDate}
                  />
                ))}
              </div>

              <div className="mt-4">
                <PaginationControls
                  currentPage={pagination.currentPage}
                  pageSize={pagination.pageSize}
                  totalItems={pagination.totalItems}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  predefinedSizes={[10, 50, 100]}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
