import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Event {
  id: string;
  title: string;
  time: string;
  location?: string;
  color: string;
}

const events: Record<string, Event[]> = {
  "2024-01-15": [
    { id: "1", title: "Team Standup", time: "09:00", location: "Conference Room A", color: "bg-blue-500" },
    { id: "2", title: "Project Review", time: "14:00", location: "Virtual", color: "bg-purple-500" },
  ],
  "2024-01-16": [
    { id: "3", title: "Client Meeting", time: "10:30", location: "Office", color: "bg-green-500" },
  ],
  "2024-01-17": [
    { id: "4", title: "Design Workshop", time: "13:00", location: "Studio B", color: "bg-pink-500" },
    { id: "5", title: "Code Review", time: "16:00", color: "bg-cyan-500" },
  ],
  "2024-01-18": [
    { id: "6", title: "Sprint Planning", time: "09:30", location: "Main Hall", color: "bg-amber-500" },
  ],
  "2024-01-20": [
    { id: "7", title: "Team Lunch", time: "12:00", location: "Cafe Galaxy", color: "bg-rose-500" },
  ],
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 15)); // January 2024
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2024, 0, 15));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedEvents = events[selectedDateKey] || [];

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="h-full flex bg-background/50">
      {/* Calendar */}
      <div className="flex-1 flex flex-col border-r border-border/50">
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground min-w-[160px] text-center">
              {months[month]} {year}
            </h2>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button size="sm" className="bg-gradient-to-r from-violet-500 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-px bg-border/50">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground bg-background/50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 gap-px bg-border/30">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="bg-background/30 p-2" />;
            }

            const date = new Date(year, month, day);
            const dateKey = formatDateKey(date);
            const dayEvents = events[dateKey] || [];
            const isSelected = dateKey === selectedDateKey;
            const isToday = dateKey === "2024-01-15"; // Mock today

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(date)}
                className={`p-2 text-left transition-colors bg-background/50 hover:bg-white/5 ${
                  isSelected ? "ring-2 ring-primary ring-inset" : ""
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : isSelected
                      ? "bg-primary/20 text-primary"
                      : "text-foreground"
                  }`}
                >
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-[10px] px-1 py-0.5 rounded truncate text-white ${event.color}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Panel */}
      <div className="w-72 flex flex-col">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-foreground">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          {selectedEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border-l-4 glass ${event.color.replace("bg-", "border-")}`}
                >
                  <h4 className="font-medium text-foreground">{event.title}</h4>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p className="text-sm">No events</p>
              <Button variant="ghost" size="sm" className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add event
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default CalendarApp;
