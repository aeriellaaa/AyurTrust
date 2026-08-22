import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Animated, Easing } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getBatchQr } from "../api/client";
import { Screen, PrimaryButton, Label, StepRail, Rise } from "../components/UI";
import { colors, gradients, type, space, radius, shadow } from "../theme";

export default function QRCodeScreen({ route, navigation }) {
  const { batchId } = route.params;
  const [qrValue, setQrValue] = useState(null);

  // The stamp presses down onto the passport once the code arrives.
  const stamp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getBatchQr(batchId).then((data) => setQrValue(data.qrValue));
  }, [batchId]);

  useEffect(() => {
    if (!qrValue) return;
    Animated.sequence([
      Animated.delay(220),
      Animated.timing(stamp, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [qrValue]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <StepRail current={3} />

        {/* The signature element: a batch passport styled as a
            certificate — notched tear line, sealed QR, pressed stamp. */}
        <Rise>
          <View style={styles.passport}>
            <LinearGradient colors={gradients.passportHead} style={styles.passportHead}>
              <Ionicons name="leaf" size={18} color={colors.leaf} />
              <Text style={styles.passportBrand}>AyurTrust</Text>
              <Text style={styles.passportKind}>Batch passport</Text>
            </LinearGradient>

            <View style={styles.perforation}>
              <View style={styles.notchLeft} />
              <View style={styles.dashes} />
              <View style={styles.notchRight} />
            </View>

            <View style={styles.qrArea}>
              {qrValue ? (
                <View style={styles.qrPad}>
                  <QRCode value={qrValue} size={198} backgroundColor="#FFFFFF" color={colors.ink} />
                </View>
              ) : (
                <View style={[styles.qrPad, styles.qrLoading]}>
                  <ActivityIndicator color={colors.leaf} />
                </View>
              )}
              <Text style={styles.batchId}>{batchId}</Text>
            </View>

            <View style={styles.stampRow}>
              <Animated.View
                style={[
                  styles.stamp,
                  {
                    opacity: stamp,
                    transform: [
                      { rotate: "-3.5deg" },
                      { scale: stamp.interpolate({ inputRange: [0, 1], outputRange: [1.5, 1] }) },
                    ],
                  },
                ]}
              >
                <Ionicons name="shield-checkmark" size={16} color={colors.leafDark} />
                <Text style={styles.stampText}>Verified collection</Text>
              </Animated.View>
            </View>
          </View>
        </Rise>

        <Rise delay={140}>
          <View style={styles.explain}>
            <Label>What this is</Label>
            <Text style={styles.explainBody}>
              This code travels with your batch. Anyone who buys the finished product can scan it
              and see where the herb came from, when it was collected, and that it was checked.
            </Text>
          </View>

          <View style={{ height: space.lg }} />
          <PrimaryButton label="Done" icon="checkmark" onPress={() => navigation.popToTop()} />
        </Rise>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: space.lg, paddingTop: 0, paddingBottom: space.xl },

  passport: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: "hidden",
    ...shadow,
  },
  passportHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    padding: space.md,
  },
  passportBrand: { fontSize: 16, fontWeight: "800", color: colors.leafDark, letterSpacing: 0.3 },
  passportKind: {
    marginLeft: "auto",
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.leafDark,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  perforation: { flexDirection: "row", alignItems: "center", height: 20 },
  notchLeft: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.paper, marginLeft: -9 },
  notchRight: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.paper, marginRight: -9 },
  dashes: {
    flex: 1,
    height: 1,
    borderTopWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.line,
    marginHorizontal: space.xs,
  },

  qrArea: { alignItems: "center", paddingHorizontal: space.lg, paddingBottom: space.md },
  qrPad: {
    padding: space.md,
    backgroundColor: "#fff",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  qrLoading: { width: 230, height: 230, alignItems: "center", justifyContent: "center" },
  batchId: { ...type.mono, fontSize: 16, letterSpacing: 2.2, color: colors.ink, marginTop: space.md },

  stampRow: { alignItems: "center", paddingBottom: space.lg, minHeight: 46 },
  stamp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "rgba(46,107,67,0.45)",
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  stampText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: colors.leafDark,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },

  explain: { marginTop: space.lg },
  explainBody: { ...type.body, marginTop: space.xs },
});