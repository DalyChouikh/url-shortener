import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
  predefinedSizes?: number[];
}

export function PaginationControls({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  className = "",
  predefinedSizes = [10, 50, 100],
}: PaginationControlsProps) {
  const [customSize, setCustomSize] = useState<string>("");
  const [showCustomSize, setShowCustomSize] = useState<boolean>(false);

  // Calculate the range of items currently being displayed
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handleCustomSizeSubmit = () => {
    const size = parseInt(customSize);
    if (!isNaN(size) && size > 0 && size <= 1000) {
      onPageSizeChange(size);
      setShowCustomSize(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCustomSizeSubmit();
    }
  };

  return (
    <div className={`${className} space-y-4`}>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
        <div className="text-muted-foreground">
          Showing {startItem}-{endItem} of {totalItems} items
        </div>

        <div className="flex items-center gap-3">
          <span className="text-muted-foreground whitespace-nowrap">
            Items per page:
          </span>

          {showCustomSize ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="1000"
                className="w-20 h-8"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleCustomSizeSubmit}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Select
              value={
                predefinedSizes.includes(pageSize)
                  ? pageSize.toString()
                  : "custom"
              }
              onValueChange={(value) => {
                if (value === "custom") {
                  setCustomSize(pageSize.toString());
                  setShowCustomSize(true);
                } else {
                  onPageSizeChange(parseInt(value));
                }
              }}
            >
              <SelectTrigger className="h-8 w-[80px]">
                <SelectValue>{pageSize}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {predefinedSizes.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
