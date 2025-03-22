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
import { Loader2, Search, Filter } from "lucide-react";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

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
        {currentUser?.id !== u.id && u.role !== "GDGC_LEAD" && (
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              value={u.role}
              onValueChange={(value) => onRoleChange(u.id, value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CORE_TEAM">Core Team</SelectItem>
                <SelectItem value="COMMUNITY">Community</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {currentUser?.id !== u.id &&
          currentUser?.role !== "SUPER_ADMIN" &&
          u.role === "GDGC_LEAD" && (
            <span className="text-sm text-muted-foreground">
              Cannot modify leader role
            </span>
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
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
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

  // Filter users based on search term and role filter
  const filteredUsers = users.filter((u) => {
    // Role filter
    if (roleFilter !== "ALL" && u.role !== roleFilter) {
      return false;
    }

    // Search filter - check if name or email contains the search term
    if (
      searchTerm &&
      !u.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !u.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

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
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Roles</SelectItem>
                      <SelectItem value="GDGC_LEAD">GDGC Lead</SelectItem>
                      <SelectItem value="CORE_TEAM">Core Team</SelectItem>
                      <SelectItem value="COMMUNITY">Community</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center h-24 text-muted-foreground"
                        >
                          No users found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u) => (
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria
                  </div>
                ) : (
                  filteredUsers.map((u) => (
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
                  ))
                )}
              </div>

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
