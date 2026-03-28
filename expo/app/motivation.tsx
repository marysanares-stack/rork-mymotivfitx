import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { Image } from "expo-image";
import { Sparkles, RefreshCcw } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useMotivation } from "@/contexts/MotivationContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MotivationScreen() {
  const { current, isLoading, error, getNext, resetHistory, seenCount } = useMotivation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!current && !isLoading) {
      console.log("[MotivationScreen] Auto-fetching first phrase");
      getNext();
    }
  }, [current, isLoading, getNext]);

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]} testID="motivation-screen-root">
      <Stack.Screen options={{ title: "Motivation", headerStyle: { backgroundColor: Colors.surface } }} />

      <View style={styles.card} testID="motivation-card">
        <View style={styles.imagesRow}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" }}
            style={styles.motivatorImage}
            contentFit="cover"
          />
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80" }}
            style={styles.motivatorImage}
            contentFit="cover"
          />
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80" }}
            style={styles.motivatorImage}
            contentFit="cover"
          />
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80" }}
            style={styles.motivatorImage}
            contentFit="cover"
          />
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=80" }}
            style={styles.motivatorImage}
            contentFit="cover"
          />
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80" }}
            style={styles.motivatorImage}
            contentFit="cover"
          />
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80" }}
            style={styles.motivatorImage}
            contentFit="cover"
          />
        </View>
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <>
            <Text style={styles.title}>Daily Fuel</Text>
            <Text style={styles.phrase} numberOfLines={3}>
              {current?.text ?? ""}
            </Text>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={getNext}
          style={styles.primaryBtn}
          activeOpacity={0.8}
          testID="motivation-next-btn"
        >
          <Sparkles color={"#fff"} size={18} />
          <Text style={styles.primaryBtnText}>New phrase</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resetHistory}
          style={styles.secondaryBtn}
          activeOpacity={0.8}
          testID="motivation-reset-btn"
        >
          <RefreshCcw color={Colors.primary} size={18} />
          <Text style={styles.secondaryBtnText}>Reset history</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.meta} testID="motivation-seen-count">
        Seen so far: {seenCount} {Platform.OS === "web" ? "(persists in this browser)" : "(persists on device)"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    minHeight: 160,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  imagesRow: {
    flexDirection: "row" as const,
    gap: 12,
    marginBottom: 16,
  },
  motivatorImage: {
    flex: 1,
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
  },
  title: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    fontWeight: "700" as const,
  },
  phrase: {
    fontSize: 24,
    lineHeight: 32,
    color: Colors.text,
    fontWeight: "700" as const,
  },
  errorText: {
    marginTop: 8,
    color: "#B00020",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 16,
  },
  primaryBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700" as const,
  },
  secondaryBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontWeight: "700" as const,
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center" as const,
  },
});
