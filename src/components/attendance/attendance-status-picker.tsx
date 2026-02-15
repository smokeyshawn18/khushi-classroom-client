"use client";

import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused"
  | "holiday";

const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    variant: "default" | "destructive" | "secondary" | "outline";
    icon: string;
    label: string;
  }
> = {
  present: { variant: "default", icon: "✓", label: "Present" },
  absent: { variant: "destructive", icon: "✕", label: "Absent" },
  late: { variant: "secondary", icon: "⏱", label: "Late" },
  excused: { variant: "outline", icon: "📋", label: "Excused" },
  holiday: { variant: "outline", icon: "🎉", label: "Holiday" },
};

const STATUS_ORDER: AttendanceStatus[] = [
  "present",
  "absent",
  "late",
  "excused",
  "holiday",
];

type AttendanceStatusPickerProps = {
  value: AttendanceStatus | null;
  onChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
};

export function AttendanceStatusPicker({
  value,
  onChange,
  disabled = false,
}: AttendanceStatusPickerProps) {
  const config = value ? STATUS_CONFIG[value] : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-8 gap-1.5 px-2.5 text-xs font-normal transition-colors hover:bg-muted/80"
        >
          {config ? (
            <>
              <Badge
                variant={config.variant}
                className="h-5 min-w-5 justify-center px-1 text-[10px]"
              >
                {config.icon}
              </Badge>
              <span className="hidden sm:inline">{config.label}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Mark</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-2">
        <div className="flex flex-col gap-0.5">
          {STATUS_ORDER.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const isSelected = value === status;
            return (
              <Button
                key={status}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 justify-start gap-2 px-2 text-xs",
                  isSelected && "bg-accent"
                )}
                onClick={() => onChange(status)}
              >
                {isSelected ? (
                  <Check className="size-3.5 text-primary" />
                ) : (
                  <span className="size-3.5" />
                )}
                <Badge
                  variant={cfg.variant}
                  className="h-5 min-w-5 justify-center px-1 text-[10px]"
                >
                  {cfg.icon}
                </Badge>
                {cfg.label}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
