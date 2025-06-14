import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateShelfCommandDTO } from "@/types";

interface AddShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPositions: number[];
  onAdd: (data: CreateShelfCommandDTO) => void;
}

export function AddShelfModal({ isOpen, onClose, existingPositions, onAdd }: AddShelfModalProps) {
  const [formData, setFormData] = useState<CreateShelfCommandDTO>({
    name: "",
    position: Math.max(0, ...existingPositions) + 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update position when existingPositions changes (after adding a shelf)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      position: Math.max(0, ...existingPositions) + 1,
    }));
  }, [existingPositions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(formData);
      // Reset form
      setFormData({
        name: "",
        position: Math.max(0, ...existingPositions) + 1,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: "",
        position: Math.max(0, ...existingPositions) + 1,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj nową półkę</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nazwa półki</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Top Shelf, Drawer 1"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Pozycja</Label>
            <Input
              id="position"
              type="number"
              min="1"
              value={formData.position}
              onChange={(e) => setFormData((prev) => ({ ...prev, position: parseInt(e.target.value) || 1 }))}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">Pozycja określa kolejność półek (1 = górna)</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
              {isSubmitting ? "Dodawanie..." : "Dodaj"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
