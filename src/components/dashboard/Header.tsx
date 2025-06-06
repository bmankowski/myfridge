import { useCallback, useState } from "react";
import { LogOut, Plus, Search, User } from "lucide-react";

import type { CreateContainerCommandDTO } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CommandInput } from "./CommandInput";

interface HeaderProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  searchQuery: string;
  onContainerCreate: (data: CreateContainerCommandDTO) => Promise<void>;
  onToast: (message: string, type?: "success" | "error") => void;
}

export function Header({ onSearch, isSearching, searchQuery, onContainerCreate, onToast }: HeaderProps) {
  const [isContainerDialogOpen, setIsContainerDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"freezer" | "fridge">("freezer");

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      console.log("🚪 Logging out...");

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        console.log("✅ Logout successful");
        onToast("Logout successful", "success");

        // Small delay to show success message before redirect
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Logout failed" }));
        throw new Error(errorData.error || "Logout failed");
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Logout failed";
      onToast(errorMessage, "error");

      // Even if logout fails, redirect to login for security
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } finally {
      setIsLoggingOut(false);
    }
  }, [onToast]);

  const handleContainerCreate = async () => {
    if (!name.trim()) return;

    try {
      await onContainerCreate({ name: name.trim(), type });
      setName("");
      setType("freezer");
      setIsContainerDialogOpen(false);
      onToast("Container created successfully", "success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create container";
      onToast(errorMessage, "error");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">My Freezer</h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 w-80"
              disabled={isSearching}
            />
          </div>

          {/* Command Input */}
          <CommandInput onToast={onToast} />
        </div>

        <div className="flex items-center space-x-3">
          {/* Add Container Button */}
          <Dialog open={isContainerDialogOpen} onOpenChange={setIsContainerDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Container
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Container</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Container name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={(value: "freezer" | "fridge") => setType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freezer">❄️ Freezer</SelectItem>
                      <SelectItem value="fridge">🧊 Fridge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsContainerDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleContainerCreate} disabled={!name.trim()}>
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} disabled={isLoggingOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
