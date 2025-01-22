import ics from "ics-js";
import type { ScheduleEvent } from "@/app/api/completion/route";

interface ICSEvent {
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    description?: string;
    recurrence?: string;
}

function formatDateForICS(dateStr: string): Date {
    const date = new Date(dateStr);
    // Ensure the date is valid
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateStr}`);
    }
    return date;
}

export function generateICSFile(events: ICSEvent[]): string {
    const calendar = new ics.VCALENDAR();
    calendar.addProp("VERSION", 2.0);
    calendar.addProp("PRODID", "Schedule-ICS-Generator");
    calendar.addProp("CALSCALE", "GREGORIAN");
    calendar.addProp("METHOD", "PUBLISH");

    events.forEach((event) => {
        try {
            const vevent = new ics.VEVENT();

            // Required properties
            vevent.addProp("SUMMARY", event.title);
            vevent.addProp("DTSTART", formatDateForICS(event.startDate));
            vevent.addProp("DTEND", formatDateForICS(event.endDate));
            vevent.addProp("DTSTAMP", new Date());
            vevent.addProp("UID", `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

            // Optional properties
            if (event.location) {
                vevent.addProp("LOCATION", event.location);
            }
            if (event.description) {
                vevent.addProp("DESCRIPTION", event.description);
            }
            if (event.recurrence) {
                vevent.addProp("RRULE", event.recurrence);
            }

            calendar.addComponent(vevent);
        } catch (error) {
            console.error(`Error adding event to calendar: ${event.title}`, error);
        }
    });

    return calendar.toString();
}

export function downloadICS(events: ICSEvent[]) {
    try {
        const icsContent = generateICSFile(events);
        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "schedule.ics");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error generating ICS file:", error);
        throw error;
    }
} 