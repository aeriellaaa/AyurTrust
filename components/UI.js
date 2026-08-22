// ---------------------------------------------------------------
// AyurTrust — shared building blocks
// Screens describe WHAT is on them. Everything visual lives here.
// ---------------------------------------------------------------
import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ActivityIndicator, Pressable,
  Animated, Easing, AccessibilityInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { colors, gradients, type, space, radius, shadow, shadowLift, motion } from "../theme";

// Respect the phone's "reduce motion" setting. Read once at startup.
let reduceMotion = false;
AccessibilityInfo.isReduceMotionEnabled?.().then((v) => { reduceMotion = !!v; }).catch(() => {});

// ---------------------------------------------------------------
// Screen — warm gradient wash + two very soft ambient glows.
// The glows are what stop a flat colour from looking like a form.
// ---------------------------------------------------------------
export function Screen({ children, style }) {
  return (
    <View style={styles.screenRoot}>
      <LinearGradient
        colors={gradients.page}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="glowLeaf" cx="12%" cy="8%" r="62%">
            <Stop offset="0" stopColor={colors.leaf} stopOpacity="0.10" />
            <Stop offset="1" stopColor={colors.leaf} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="glowGold" cx="95%" cy="72%" r="58%">
            <Stop offset="0" stopColor={colors.turmeric} stopOpacity="0.11" />
            <Stop offset="1" stopColor={colors.turmeric} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glowLeaf)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glowGold)" />
      </Svg>
      <SafeAreaView style={[styles.screenBody, style]} edges={["bottom"]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

// ---------------------------------------------------------------
// Rise — fade and lift on mount. Stagger with `delay` so a screen
// assembles itself instead of appearing all at once.
// ---------------------------------------------------------------
export function Rise({ children, delay = 0, style }) {
  const a = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    if (reduceMotion) return;
    Animated.timing(a, {
      toValue: 1,
      duration: motion.enter,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: a,
          transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// ---------------------------------------------------------------
// The leaf mark
// ---------------------------------------------------------------
export function LeafMark({ size = 56 }) {
  return (
    <LinearGradient
      colors={[colors.leafSoft, "#D8E8DA"]}
      style={[styles.mark, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Ionicons name="leaf" size={size * 0.46} color={colors.leaf} />
    </LinearGradient>
  );
}

// ---------------------------------------------------------------
// Buttons — 60pt tall, and they physically respond to a press.
// The scale-down is the whole interaction: it confirms the tap
// registered before the screen has time to change.
// ---------------------------------------------------------------
function usePressScale() {
  const s = useRef(new Animated.Value(1)).current;
  const to = (v) =>
    Animated.timing(s, {
      toValue: v,
      duration: motion.press,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  return { s, onPressIn: () => to(0.965), onPressOut: () => to(1) };
}

export function PrimaryButton({ label, onPress, disabled, loading, icon }) {
  const { s, onPressIn, onPressOut } = usePressScale();
  const off = disabled || loading;
  return (
    <Animated.View style={{ transform: [{ scale: s }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={off}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!off }}
      >
        <LinearGradient
          colors={gradients.leafWash}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, styles.btnPrimary, off && styles.btnDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              {icon ? (
                <Ionicons name={icon} size={21} color="#fff" style={{ marginRight: 9 }} />
              ) : null}
              <Text style={styles.btnPrimaryText}>{label}</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export function SecondaryButton({ label, onPress, icon }) {
  const { s, onPressIn, onPressOut } = usePressScale();
  return (
    <Animated.View style={{ transform: [{ scale: s }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.btn, styles.btnSecondary]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {icon ? (
          <Ionicons name={icon} size={20} color={colors.leaf} style={{ marginRight: 8 }} />
        ) : null}
        <Text style={styles.btnSecondaryText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// A whole row that presses like a button — used for list items.
export function PressCard({ children, onPress, style }) {
  const { s, onPressIn, onPressOut } = usePressScale();
  return (
    <Animated.View style={{ transform: [{ scale: s }] }}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={style}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------
// Card — a sheet of paper with a faint warm sheen down the top edge
// ---------------------------------------------------------------
export function Card({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.9)", "rgba(250,246,236,0.55)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
}

export function Label({ children }) {
  return <Text style={type.label}>{children}</Text>;
}

// A hairline rule with a small leaf at its centre — used sparingly.
export function Divider() {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Ionicons name="leaf-outline" size={13} color={colors.inkFaint} />
      <View style={styles.dividerLine} />
    </View>
  );
}

// ---------------------------------------------------------------
// StepRail — Capture, Verify, Passport. The active dot breathes so
// your eye lands on where you actually are.
// ---------------------------------------------------------------
export function StepRail({ current }) {
  const steps = [
    { n: 1, label: "Capture", icon: "camera" },
    { n: 2, label: "Verify", icon: "shield-checkmark" },
    { n: 3, label: "Passport", icon: "ribbon" },
  ];
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });

  return (
    <View style={styles.rail}>
      {steps.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        const Dot = active ? Animated.View : View;
        return (
          <React.Fragment key={s.n}>
            <View style={styles.railItem}>
              <Dot
                style={[
                  styles.railDot,
                  done && styles.railDotDone,
                  active && styles.railDotActive,
                  active ? { transform: [{ scale }] } : null,
                ]}
              >
                <Ionicons
                  name={done ? "checkmark" : s.icon}
                  size={17}
                  color={done || active ? "#fff" : colors.inkFaint}
                />
              </Dot>
              <Text style={[styles.railLabel, active && styles.railLabelActive]}>{s.label}</Text>
            </View>
            {i < steps.length - 1 ? (
              <View style={[styles.railLine, done && styles.railLineDone]} />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------
// Pill — colour AND icon AND words. Never colour alone.
// ---------------------------------------------------------------
export function Pill({ tone = "neutral", icon, children }) {
  const map = {
    good: { bg: colors.leafSoft, fg: colors.leafDark, br: "#CFE2D2" },
    warn: { bg: colors.dangerSoft, fg: colors.danger, br: "#EFD0C4" },
    gold: { bg: colors.turmericSoft, fg: "#87620F", br: "#EBDCB2" },
    neutral: { bg: colors.surfaceAlt, fg: colors.inkMuted, br: colors.line },
  };
  const c = map[tone] || map.neutral;
  return (
    <View style={[styles.pill, { backgroundColor: c.bg, borderColor: c.br }]}>
      {icon ? <Ionicons name={icon} size={15} color={c.fg} style={{ marginRight: 6 }} /> : null}
      <Text style={[styles.pillText, { color: c.fg }]}>{children}</Text>
    </View>
  );
}

// A slowly expanding halo. Used only while the AI check is running,
// so waiting feels like something is happening.
export function PulseHalo({ size = 88, color = colors.leaf, children }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(a, { toValue: 1, duration: 1900, easing: Easing.out(Easing.quad), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={{
          position: "absolute",
          width: size, height: size, borderRadius: size / 2,
          borderWidth: 2, borderColor: color,
          opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
          transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
        }}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: { flex: 1, backgroundColor: colors.paper },
  screenBody: { flex: 1 },

  mark: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(46,107,67,0.22)",
  },

  btn: {
    minHeight: 60,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: space.lg,
  },
  btnPrimary: { ...shadowLift },
  btnPrimaryText: { color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: 0.2 },
  btnSecondary: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  btnSecondaryText: { color: colors.leaf, fontSize: 17, fontWeight: "600" },
  btnDisabled: { opacity: 0.42 },

  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: "hidden",
    ...shadow,
  },
  cardInner: { padding: space.lg },

  divider: { flexDirection: "row", alignItems: "center", gap: space.sm, marginVertical: space.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },

  rail: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
  },
  railItem: { alignItems: "center", width: 76 },
  railDot: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.line,
  },
  railDotActive: { backgroundColor: colors.leaf, borderColor: colors.leaf, ...shadowLift },
  railDotDone: { backgroundColor: colors.turmeric, borderColor: colors.turmeric },
  railLabel: { marginTop: 6, fontSize: 12.5, color: colors.inkFaint, fontWeight: "600" },
  railLabelActive: { color: colors.ink },
  railLine: { flex: 1, height: 2, backgroundColor: colors.line, marginBottom: 22, borderRadius: 1 },
  railLineDone: { backgroundColor: colors.turmeric },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pillText: { fontSize: 14, fontWeight: "600" },
});