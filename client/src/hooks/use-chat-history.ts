import { useState, useEffect } from "react";
import { type Match } from "@shared/schema";

export type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    matches?: Match[];
    image?: string;
};

export type Conversation = {
    id: string;
    title: string;
    messages: Message[];
    updatedAt: number;
};

export function useChatHistory() {
    const [history, setHistory] = useState<Conversation[]>(() => {
        const saved = localStorage.getItem("chat_history");
        return saved ? JSON.parse(saved) : [];
    });

    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem("chat_history", JSON.stringify(history));
    }, [history]);

    const saveConversation = (messages: Message[], id?: string) => {
        if (messages.length === 0) return null;

        const convId = id || Date.now().toString();
        const title = messages.find(m => m.role === 'user')?.content.substring(0, 30) || "New Conversation";

        const newConv: Conversation = {
            id: convId,
            title: title.endsWith('...') ? title : title + (title.length >= 30 ? '...' : ''),
            messages,
            updatedAt: Date.now(),
        };

        setHistory(prev => {
            const filtered = prev.filter(c => c.id !== convId);
            return [newConv, ...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
        });

        return convId;
    };

    const deleteConversation = (id: string) => {
        setHistory(prev => prev.filter(c => c.id !== id));
        if (activeId === id) setActiveId(null);
    };

    const getConversation = (id: string) => {
        return history.find(c => c.id === id);
    };

    return {
        history,
        activeId,
        setActiveId,
        saveConversation,
        deleteConversation,
        getConversation,
    };
}
