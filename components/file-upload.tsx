"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import type { ScheduleEvent } from "@/app/api/completion/route";

interface FileUploadFormProps {
    onScheduleExtracted: (events: ScheduleEvent[]) => void;
}

interface FormValues {
    text: string;
}

export function FileUploadForm({ onScheduleExtracted }: FileUploadFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>();
    const { toast } = useToast();
    const textContent = watch("text");

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 500);

            return () => {
                clearInterval(interval);
                setProgress(0);
            };
        }
    }, [isLoading]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const text = await file.text();
                setValue('text', text);
            } catch (error) {
                console.error('Error reading file:', error);
                toast({
                    title: "Error",
                    description: "Failed to read file",
                    variant: "destructive",
                });
            }
        }
    };

    const onSubmit = async (data: FormValues) => {
        try {
            setIsLoading(true);
            setProgress(0);

            if (!data.text.trim()) {
                toast({
                    title: "Error",
                    description: "Please enter or upload schedule text",
                    variant: "destructive",
                });
                return;
            }

            const response = await fetch("/api/completion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: data.text }),
            });

            if (!response.ok) {
                throw new Error("Failed to process schedule");
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            setProgress(100);
            onScheduleExtracted(result.events);
            reset();

            toast({
                title: "Success",
                description: "Schedule extracted successfully",
            });
        } catch (error) {
            console.error("Error processing schedule:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to process schedule",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6 bg-card rounded-lg border">
            <div>
                <h2 className="text-lg font-semibold mb-2">Upload Schedule</h2>
                <p className="text-sm text-muted-foreground">
                    Upload a file or paste your schedule text below to extract events.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="file">Upload Schedule File</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".txt,.pdf"
                            onChange={handleFileChange}
                            disabled={isLoading}
                            className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                            Supported formats: PDF, TXT
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="text">Or Paste Schedule Text</Label>
                        <textarea
                            id="text"
                            className="w-full min-h-[200px] p-3 rounded-md border bg-background text-sm resize-y"
                            placeholder="Copy and paste your schedule text here..."
                            disabled={isLoading}
                            {...register("text")}
                        />
                        <p className="text-xs text-muted-foreground">
                            For PDF schedules: Open the PDF, select all text (Ctrl+A/Cmd+A), copy (Ctrl+C/Cmd+C), and paste here (Ctrl+V/Cmd+V)
                        </p>
                    </div>
                </div>

                {isLoading && (
                    <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-muted-foreground text-center">
                            Extracting schedule...
                        </p>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isLoading || !textContent?.trim()}
                    className="w-full"
                >
                    {isLoading ? "Processing..." : "Extract Schedule"}
                </Button>
            </form>
        </div>
    );
} 