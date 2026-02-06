"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TimelineConfig {
  startHour: number;
  endHour: number;
  snapIntervalMinutes: number;
  columnWidth: number;
}

export interface TimelineSlotData {
  id: string;
  rowId: string;
  startTime: string;
  duration: number;
  title: string;
  type: string;
  attendees: number;
}

export interface TimelineRowData {
  id: string;
  label: string;
  capacity: number;
}

interface TimelineContextType {
  config: TimelineConfig;
  percentageInView: number;
  onSlotPositionChange?: (
    slotId: string,
    newTime: string,
    newRowId: string,
  ) => Promise<boolean>;
  onValidateDrop?: (
    slotId: string,
    newTime: string,
    newRowId: string,
  ) => boolean;
  onSlotClick?: (slotId: string) => void;
}

const TimelineContext = React.createContext<TimelineContextType | null>(null);

export function TimelineProvider({
  children,
  config,
  percentageInView,
  onSlotPositionChange,
  onValidateDrop,
  onSlotClick,
  className,
}: {
  children: React.ReactNode;
  config: TimelineConfig;
  percentageInView: number;
  onSlotPositionChange?: (
    slotId: string,
    newTime: string,
    newRowId: string,
  ) => Promise<boolean>;
  onValidateDrop?: (
    slotId: string,
    newTime: string,
    newRowId: string,
  ) => boolean;
  onSlotClick?: (slotId: string) => void;
  className?: string;
}) {
  return (
    <TimelineContext.Provider
      value={{
        config,
        percentageInView,
        onSlotPositionChange,
        onValidateDrop,
        onSlotClick,
      }}
    >
      <div className={cn("relative overflow-auto", className)}>{children}</div>
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  const context = React.useContext(TimelineContext);
  if (!context)
    throw new Error("useTimeline must be used within a TimelineProvider");
  return context;
}

export function Timeline({
  children,
  slots,
  rows,
}: {
  children: React.ReactNode;
  slots: TimelineSlotData[];
  rows: TimelineRowData[];
}) {
  return <div className="min-w-max">{children}</div>;
}

export function TimelineGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="border rounded-md divide-y overflow-hidden">{children}</div>
  );
}

export function TimelineHeader({
  columnLabel,
  className,
}: {
  columnLabel: string;
  className?: string;
}) {
  const { config } = useTimeline();
  const hours = Array.from(
    { length: config.endHour - config.startHour + 1 },
    (_, i) => config.startHour + i,
  );

  return (
    <div className={cn("flex divide-x", className)}>
      <div className="w-48 p-3 font-medium bg-muted/50">{columnLabel}</div>
      <div className="flex flex-1">
        {hours.map((hour) => (
          <div
            key={hour}
            className="p-2 text-center border-r last:border-r-0"
            style={{ width: config.columnWidth }}
          >
            <span className="text-xs font-semibold text-muted-foreground">
              {hour}:00
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimelineRow({
  row,
  slots,
  className,
  renderRowHeader,
  children,
}: {
  row: TimelineRowData;
  slots: TimelineSlotData[];
  className?: string;
  renderRowHeader: (row: TimelineRowData) => React.ReactNode;
  children: (slot: TimelineSlotData) => React.ReactNode;
}) {
  const { config } = useTimeline();
  const rowSlots = slots.filter((s) => s.rowId === row.id);

  return (
    <div className={cn("flex divide-x min-h-[80px]", className)}>
      <div className="w-48 p-3 bg-muted/30">{renderRowHeader(row)}</div>
      <div className="flex-1 relative bg-background/50">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex pointer-events-none divide-x">
          {Array.from({ length: config.endHour - config.startHour + 1 }).map(
            (_, i) => (
              <div key={i} style={{ width: config.columnWidth }} />
            ),
          )}
        </div>
        {/* Slots Overlay */}
        <div className="relative h-full">
          {rowSlots.map((slot) => (
            <div
              key={slot.id}
              className="absolute top-2 bottom-2"
              style={getSlotStyle(slot, config)}
            >
              {children(slot)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getSlotStyle(slot: TimelineSlotData, config: TimelineConfig) {
  const [hours, minutes] = slot.startTime.split(":").map(Number);
  const startMinutes = (hours - config.startHour) * 60 + minutes;
  const left = (startMinutes / 60) * config.columnWidth;
  const width = (slot.duration / 60) * config.columnWidth;

  return {
    left: `${left}px`,
    width: `${width}px`,
  };
}

export function TimelineSlot({
  slot,
  className,
  children,
}: {
  slot: TimelineSlotData;
  className?: string;
  children: React.ReactNode;
}) {
  const { onSlotClick } = useTimeline();
  return (
    <div
      onClick={() => onSlotClick?.(slot.id)}
      className={cn(
        "h-full rounded-md border shadow-sm relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TimelineSlotLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-xs font-bold truncate", className)}>
      {children}
    </div>
  );
}

export function TimelineSlotContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("text-[10px] text-muted-foreground truncate", className)}
    >
      {children}
    </div>
  );
}

export function TimelineCurrentTime() {
  const { config } = useTimeline();
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  if (currentHour < config.startHour || currentHour >= config.endHour) {
    return null;
  }

  const offsetMinutes = (currentHour - config.startHour) * 60 + currentMinutes;
  const left = (offsetMinutes / 60) * config.columnWidth + 192; // 192px is header width (w-48)

  return (
    <div
      className="absolute top-0 bottom-0 w-px bg-red-500 z-10 pointer-events-none"
      style={{ left: `${left}px` }}
    >
      <div className="absolute top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500" />
    </div>
  );
}
