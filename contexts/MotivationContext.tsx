import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useMutation } from "@tanstack/react-query";
import { generateText } from "@/lib/rork-toolkit-stub";

export type MotivationPhrase = {
  id: string;
  text: string;
  createdAt: number;
};

const STORAGE_KEYS = {
  seen: "motivation:seen:v1",
} as const;

const FALLBACKS: string[] = [
  "Small steps, big changes.",
  "You showed up. That matters.",
  "Energy follows action.",
  "Consistency beats intensity.",
  "One more rep. One more day.",
  "Future you is proud of this.",
  "Progress > perfection.",
  "Stack wins, not excuses.",
  "Motion creates emotion.",
  "Discipline is a love language to yourself.",
  "You don't need easy, you need possible.",
  "Strong mind. Strong body.",
  "Be the reason future you smiles.",
  "Your pace. Your race.",
  "Less talk, more walk.",
];

function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `h${Math.abs(hash)}`;
}

async function loadSeen(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.seen);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed ?? {};
  } catch (e) {
    console.log("[Motivation] Failed to load seen store", e);
    return {};
  }
}

async function saveSeen(map: Record<string, number>): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.seen, JSON.stringify(map));
  } catch (e) {
    console.log("[Motivation] Failed to save seen store", e);
  }
}

export type MotivationContextType = {
  current?: MotivationPhrase;
  isLoading: boolean;
  error?: string;
  getNext: () => void;
  resetHistory: () => void;
  seenCount: number;
};

export const [MotivationProvider, useMotivation] = createContextHook<MotivationContextType>(() => {
  const [current, setCurrent] = useState<MotivationPhrase | undefined>(undefined);
  const [seen, setSeen] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadSeen().then(setSeen);
  }, []);

  const seenCount = useMemo(() => Object.keys(seen).length, [seen]);

  const genMutation = useMutation({
    mutationFn: async () => {
      console.log("[Motivation] Generating new phrase...");
      const text = await generateText({
        messages: [
          {
            role: "user",
            content:
              "Generate a short, fresh motivational phrase for fitness or wellness. Max 12 words. No hashtags, no emojis, no quotes, no duplicate of common clichés. Vary tone across athletic, calm, witty, and supportive.",
          },
        ],
      });
      return (text ?? "").trim();
    },
  });

  const pickFallback = useCallback((): string => {
    const candidates = [...FALLBACKS];
    for (let i = 0; i < candidates.length; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = candidates[i];
      candidates[i] = candidates[j];
      candidates[j] = tmp;
    }
    const found = candidates.find(c => !seen[hashString(c)]);
    return found ?? candidates[0] ?? "Keep going.";
  }, [seen]);

  const makeUnique = useCallback(
    (raw: string): MotivationPhrase => {
      let text = raw.replace(/^["'\s]+|["'\s]+$/g, "");
      if (text.length === 0) text = pickFallback();
      const id = hashString(text.toLowerCase());
      let attempt = 0;
      while (seen[id] && attempt < 3) {
        text = `${text} .`;
        attempt += 1;
      }
      const finalId = hashString(text.toLowerCase());
      return { id: finalId, text, createdAt: Date.now() };
    },
    [seen, pickFallback]
  );

  const { mutate, isPending } = genMutation;

  const getNext = useCallback(() => {
    setError(undefined);
    mutate(undefined, {
      onSuccess: async (t) => {
        try {
          const phrase = makeUnique(t);
          if (seen[phrase.id]) {
            const altText = pickFallback();
            const altPhrase = makeUnique(altText);
            setCurrent(altPhrase);
            const updated = { ...seen, [altPhrase.id]: Date.now() };
            setSeen(updated);
            await saveSeen(updated);
            return;
          }
          setCurrent(phrase);
          const updated = { ...seen, [phrase.id]: Date.now() };
          setSeen(updated);
          await saveSeen(updated);
        } catch (e) {
          console.log("[Motivation] onSuccess handling failed", e);
          const fb = pickFallback();
          const phrase = makeUnique(fb);
          setCurrent(phrase);
        }
      },
      onError: (e) => {
        console.log("[Motivation] Generation failed, using fallback", e);
        setError("Could not generate a new phrase right now. Showing a fallback.");
        const fb = pickFallback();
        const phrase = makeUnique(fb);
        setCurrent(phrase);
      },
    });
  }, [mutate, makeUnique, pickFallback, seen]);

  const resetHistory = useCallback(() => {
    Alert.alert("Reset Phrase History", "You won't see previously used phrases until they are re-generated.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          try {
            setSeen({});
            await saveSeen({});
          } catch (e) {
            console.log("[Motivation] Failed to reset history", e);
          }
        },
      },
    ]);
  }, []);

  const value = useMemo<MotivationContextType>(() => ({
    current,
    isLoading: isPending,
    error,
    getNext,
    resetHistory,
    seenCount,
  }), [current, isPending, error, getNext, resetHistory, seenCount]);

  return value;
});
