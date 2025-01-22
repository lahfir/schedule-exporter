import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

// Define the schedule event schema
const ScheduleEventSchema = z.object({
    title: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string().optional(),
    description: z.string().optional(),
    recurrence: z.string().optional(), // e.g., "FREQ=WEEKLY;UNTIL=20240531"
});

export type ScheduleEvent = z.infer<typeof ScheduleEventSchema>;

const ScheduleResponseSchema = z.array(ScheduleEventSchema);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful assistant that extracts schedule information from text. 
You will receive text that may be extracted from a PDF or text file containing course schedules.
Your task is to identify and extract all course/class events and format them as a JSON array.

For each event, extract:
1. Title (course name/code)
2. Start date and time
3. End date and time
4. Location (if available)
5. Description (additional details about the course)
6. Recurrence pattern (if it's a recurring class)

Guidelines:
- If a specific time isn't mentioned, use 00:00:00
- Convert all dates to ISO 8601 format
- If a course repeats weekly, include the recurrence rule
- Clean up any PDF extraction artifacts or unnecessary whitespace
- Ignore headers, footers, and other non-schedule content
- If multiple sections or times are listed for a course, create separate events

Return the events in this structure:
{
  "events": [
    {
      "title": "Course name/code",
      "startDate": "ISO 8601 date string",
      "endDate": "ISO 8601 date string",
      "location": "Room/Building",
      "description": "Additional course details",
      "recurrence": "FREQ=WEEKLY;UNTIL=20240531"
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
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
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
