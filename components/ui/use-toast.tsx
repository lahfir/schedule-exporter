"use client";

import { useState } from "react";

interface Toast {
    title: string;
    description?: string;
    variant?: "default" | "destructive";
}

interface ToastState {
    toasts: Toast[];
}

export function useToast() {
    const [state, setState] = useState<ToastState>({ toasts: [] });

    const toast = (props: Toast) => {
        setState((prev) => ({
            toasts: [...prev.toasts, props],
        }));

        // Remove toast after 3 seconds
        setTimeout(() => {
            setState((prev) => ({
                toasts: prev.toasts.filter((t) => t !== props),
            }));
        }, 3000);
    };

    return {
        toast,
        toasts: state.toasts,
    };
} 