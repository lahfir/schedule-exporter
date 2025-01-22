import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { date, z } from "zod";

// Define the schedule event schema
const ScheduleEventSchema = z.object({
    title: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string().optional(),
    description: z.string().optional(),
    recurrence: z.string().optional(),
});

export type ScheduleEvent = z.infer<typeof ScheduleEventSchema>;

const ScheduleResponseSchema = z.array(ScheduleEventSchema);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful assistant that extracts schedule information from text. 
You will receive text that may be extracted from a PDF or text file containing course schedules, syllabi, or other academic schedules.
Your task is to identify and extract all schedule-related events (classes, assignments, exams, etc.) and format them as a JSON array. All the evenets should be in the year of ${new Date().getFullYear()} if not specified.

For each event, extract:
1. Title - This can be:
   - Course name/code for classes (e.g., "Database Systems")
   - Assignment name (e.g., "Project 1 Part 1")
   - Quiz/Exam name (e.g., "Quiz 1", "Midterm Exam")
2. Start date and time
   - For classes: Use the date from the schedule
   - For assignments: Use the due date as both start and end date
   - If only date is provided (no time):
     - For classes: Use 00:00:00
     - For assignments/due dates: Use 23:59:59
3. End date and time
   - For classes: Add 1 hour to start time if not specified
   - For assignments: Same as start date (due date)
4. Location (if available)
   - Room number/building for classes
   - "Online" for virtual submissions
   - Leave empty if not specified
5. Description - Include:
   - For classes: Topic/lecture content
   - For assignments: "Due: [date]" and any additional details
   - For exams: Type of exam and covered material
6. Recurrence pattern
   - For weekly classes: Use "FREQ=WEEKLY;UNTIL=[last_day_of_semester]"
   - For one-time events (assignments/exams): Leave empty

Guidelines:
- Convert all dates to ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
- Create separate events for:
  - Each class session
  - Each assignment (both assigned date and due date if provided)
  - Each quiz/exam
- For assignments:
  - Title should be descriptive (e.g., "Project 1 Part 1 Due")
  - Description should include "Assigned: [date]" if available
- Clean up any PDF extraction artifacts or unnecessary whitespace
- Ignore headers, footers, and other non-schedule content

Return the events in this structure:
{
  "events": [
    {
      "title": "string",
      "startDate": "ISO 8601 date string",
      "endDate": "ISO 8601 date string",
      "location": "string (optional)",
      "description": "string (optional)",
      "recurrence": "string (optional)"
    }
  ]
}

Example input:
"Week 1 (1/23): Introduction to Databases
Lecture 1: DBMS architectures
Project 1 Part 1 assigned"

Example output:
{
  "events": [
    {
      "title": "Introduction to Databases",
      "startDate": "2024-01-23T00:00:00",
      "endDate": "2024-01-23T01:00:00",
      "description": "Lecture 1: DBMS architectures",
      "recurrence": "FREQ=WEEKLY;UNTIL=20240531"
    },
    {
      "title": "Project 1 Part 1 Assigned",
      "startDate": "2024-01-23T00:00:00",
      "endDate": "2024-01-23T23:59:59",
      "description": "Assignment start date"
    }
  ]
}`;

export async function POST(request: NextRequest) {
    try {
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json(
                { error: "No content provided" },
                { status: 400 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "system", content: "Today's Date: " + new Date().toISOString() },
                { role: "user", content: `Extract schedule information from this text: ${content}` }
            ],
            response_format: { type: "json_object" },
        });

        const rawResponse = completion.choices[0].message.content;
        if (!rawResponse) {
            throw new Error("No response from OpenAI");
        }

        const parsedResponse = JSON.parse(rawResponse);
        const events = ScheduleResponseSchema.parse(parsedResponse.events || []);

        return NextResponse.json({ events });
    } catch (error) {
        console.error("Error processing schedule:", error);
        return NextResponse.json(
            { error: "Failed to process schedule" },
            { status: 500 }
        );
    }
}
