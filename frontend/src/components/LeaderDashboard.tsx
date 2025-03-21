/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
          timeZone: "UTC", // Force UTC timezone
        });
  } catch (e) {
    return "Invalid";
  }
};

export default function LeaderDashboard() {
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
        `/api/v1/leader/users?page=${page}&pageSize=${pageSize}`,
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
    // Prevent assigning SUPER_ADMIN role
    if (newRole === "SUPER_ADMIN") {
      showToast("You cannot assign Super Admin role", "error");
      return;
    }

    try {
      const response = await fetch(`/api/v1/leader/users/${userId}/role`, {
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

  const handlePageChange = (page: number) => {
    fetchUsers(page, pagination.pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    // Reset to first page when changing page size
    fetchUsers(1, size);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "GDGC_LEAD":
        return "bg-blue-500";
      case "CORE_TEAM":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleUserClick = (userId: number) => {
    navigate(`/leader/users/${userId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>
            Manage community members and core team roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="container mx-auto p-6 flex items-center justify-center h-[70vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
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
                        {user?.id !== u.id &&
                          u.role !== "GDGC_LEAD" && ( // Can't change own role or another leader's role
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
                                {/* GDG Lead can only assign Core Team, Community or GDGC Lead */}
                                <SelectItem value="CORE_TEAM">
                                  Core Team
                                </SelectItem>
                                <SelectItem value="COMMUNITY">
                                  Community
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        {user?.id !== u.id &&
                          user?.role !== "SUPER_ADMIN" &&
                          u.role === "GDGC_LEAD" && (
                            <span className="text-sm text-muted-foreground">
                              Cannot modify leader role
                            </span>
                          )}
                      </TableCell>
                      <TableCell>{formatDate(u.lastLoginAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <PaginationControls
                currentPage={pagination.currentPage}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                className="mt-4"
                predefinedSizes={[10, 25, 50, 100]}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
