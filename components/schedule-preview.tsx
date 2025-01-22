import { format } from "date-fns";
import type { ScheduleEvent } from "@/app/api/completion/route";
import { Button } from "@/components/ui/button";
import { downloadICS } from "@/lib/ics";

interface SchedulePreviewProps {
    events: ScheduleEvent[];
}

export function SchedulePreview({ events }: SchedulePreviewProps) {
    if (!events.length) {
        return null;
    }

    // Function to generate Google Calendar URL for all events
    const generateGoogleCalendarFile = () => {
        let content = "Subject,Start Date,End Date,Description,Location\n";
        events.forEach(event => {
            content += `${event.title},${event.startDate},${event.endDate},${event.description || ""},${event.location || ""}\n`;
        });

        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'google-calendar-events.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Function to generate Outlook CSV
    const generateOutlookCalendarFile = () => {
        let content = "Subject,Start Date,End Date,Description,Location\n";
        events.forEach(event => {
            content += `${event.title},${event.startDate},${event.endDate},${event.description || ""},${event.location || ""}\n`;
        });

        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'outlook-calendar-events.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownload = () => {
        try {
            // Ensure all required fields are present and properly formatted
            const validEvents = events.map(event => ({
                title: event.title || "Untitled Event",
                startDate: new Date(event.startDate).toISOString(),
                endDate: new Date(event.endDate).toISOString(),
                location: event.location || "",
                description: event.description || "",
                recurrence: event.recurrence || ""
            }));

            downloadICS(validEvents);
        } catch (error) {
            console.error("Error generating calendar file:", error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Extracted Schedule</h2>
                <div className="flex gap-2">
                    <Button onClick={handleDownload} variant="outline">
                        Download ICS
                    </Button>
                    <Button onClick={generateGoogleCalendarFile} variant="outline">
                        Download for Google Calendar
                    </Button>
                    <Button onClick={generateOutlookCalendarFile} variant="outline">
                        Download for Outlook
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg">
                <div className="max-h-[600px] overflow-y-auto relative">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-background border-b z-10">
                            <tr className="bg-muted/50">
                                <th className="py-3 px-4 text-left font-medium">Event</th>
                                <th className="py-3 px-4 text-left font-medium">Start</th>
                                <th className="py-3 px-4 text-left font-medium">End</th>
                                <th className="py-3 px-4 text-left font-medium">Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event, index) => (
                                <tr
                                    key={index}
                                    className="border-b last:border-none hover:bg-muted/50"
                                >
                                    <td className="py-3 px-4">
                                        <div>
                                            <div className="font-medium">{event.title}</div>
                                            {event.description && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {event.description}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        {format(new Date(event.startDate), "PPp")}
                                    </td>
                                    <td className="py-3 px-4">
                                        {format(new Date(event.endDate), "PPp")}
                                    </td>
                                    <td className="py-3 px-4">{event.location || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 