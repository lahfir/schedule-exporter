"use client";

import { useState } from "react";
import type { ScheduleEvent } from "@/app/api/completion/route";
import { FileUploadForm } from "@/components/file-upload";
import { SchedulePreview } from "@/components/schedule-preview";

export default function Home() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  return (
    <main className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Schedule Extractor</h1>
          <p className="text-muted-foreground">
            Upload your course schedule document and we'll extract the events and convert them to a calendar format.
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <FileUploadForm onScheduleExtracted={setEvents} />
        </div>

        <SchedulePreview events={events} />
      </div>
    </main>
  );
}
