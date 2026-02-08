"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "meeting" | "task" | "reminder" | "block";
  description?: string;
  attendees?: string[];
  location?: string;
  color?: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Discovery Call - Acme Corp",
    date: "2026-02-10",
    startTime: "10:00",
    endTime: "10:30",
    type: "meeting",
    description: "Initial discovery call with John Smith",
    attendees: ["John Smith"],
    color: "blue",
  },
  {
    id: "2",
    title: "Team Standup",
    date: "2026-02-10",
    startTime: "09:00",
    endTime: "09:15",
    type: "meeting",
    color: "green",
  },
  {
    id: "3",
    title: "Follow-up: TechStart",
    date: "2026-02-11",
    startTime: "14:00",
    endTime: "14:45",
    type: "meeting",
    attendees: ["Sarah Johnson"],
    color: "blue",
  },
  {
    id: "4",
    title: "Proposal Review",
    date: "2026-02-12",
    startTime: "11:00",
    endTime: "12:00",
    type: "task",
    description: "Review and finalize Q1 proposals",
    color: "purple",
  },
  {
    id: "5",
    title: "Client Demo",
    date: "2026-02-13",
    startTime: "15:00",
    endTime: "16:00",
    type: "meeting",
    attendees: ["David Lee"],
    location: "Zoom",
    color: "blue",
  },
  {
    id: "6",
    title: "Focus Time",
    date: "2026-02-08",
    startTime: "09:00",
    endTime: "12:00",
    type: "block",
    description: "Deep work",
    color: "gray",
  },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events] = useState<CalendarEvent[]>(mockEvents);

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    // Fill empty days before first day
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    // Fill in the days
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Fill remaining days in last week
    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push(null);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [currentYear, currentMonth]);

  const formatDate = (day: number): string => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const getEventsForDate = (date: string): CalendarEvent[] => {
    return events.filter((e) => e.date === date);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(formatDate(today.getDate()));
  };

  const isToday = (day: number): boolean => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const getEventColor = (color?: string): string => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      yellow: "bg-yellow-500",
      gray: "bg-gray-600",
    };
    return colors[color || "blue"] || "bg-blue-500";
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </Link>
          <h1 className="text-white text-xl font-bold">Calendar</h1>
        </div>
        <p className="text-gray-400 text-sm">View and manage your schedule</p>
      </header>

      <main className="p-8">
        <div className="flex gap-6">
          {/* Calendar */}
          <div className="flex-1 rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-white font-semibold text-lg">
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
                >
                  Today
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={goToPreviousMonth} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button onClick={goToNextMonth} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Day headers */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <th key={day} className="py-3 text-center text-gray-400 text-sm font-medium w-[14.28%]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calendarData.map((week, weekIndex) => (
                  <tr key={weekIndex} className="border-b border-gray-800 last:border-b-0">
                    {week.map((day, dayIndex) => {
                      if (day === null) {
                        return (
                          <td key={dayIndex} className="h-28 border-r border-gray-800 last:border-r-0 bg-gray-900/30" />
                        );
                      }

                      const dateStr = formatDate(day);
                      const dayEvents = getEventsForDate(dateStr);
                      const isSelected = selectedDate === dateStr;

                      return (
                        <td
                          key={dayIndex}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`h-28 border-r border-gray-800 last:border-r-0 p-2 align-top cursor-pointer transition-colors ${
                            isSelected ? "bg-gray-800" : "hover:bg-gray-800/50"
                          }`}
                        >
                          <div className="flex flex-col h-full">
                            <span
                              className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                                isToday(day) ? "bg-white text-black" : "text-gray-300"
                              }`}
                            >
                              {day}
                            </span>
                            <div className="flex-1 space-y-1 overflow-hidden">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs px-1.5 py-0.5 rounded truncate text-white ${getEventColor(event.color)}`}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-400 px-1">+{dayEvents.length - 2} more</div>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden sticky top-8">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-semibold">
                  {selectedDate
                    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })
                    : "Select a date"}
                </h3>
              </div>

              <div className="p-4">
                {!selectedDate ? (
                  <p className="text-gray-400 text-sm">Click on a date to view events</p>
                ) : selectedDateEvents.length === 0 ? (
                  <p className="text-gray-400 text-sm">No events scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <div key={event.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <div className="flex items-start gap-3">
                          <div className={`w-1 self-stretch rounded-full ${getEventColor(event.color)}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-medium">{event.title}</h4>
                            <p className="text-gray-400 text-xs mt-1">
                              {event.startTime} - {event.endTime}
                            </p>
                            {event.description && (
                              <p className="text-gray-500 text-xs mt-2">{event.description}</p>
                            )}
                            {event.attendees && event.attendees.length > 0 && (
                              <p className="text-gray-500 text-xs mt-2">
                                With: {event.attendees.join(", ")}
                              </p>
                            )}
                            {event.location && (
                              <p className="text-gray-500 text-xs mt-1">{event.location}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
