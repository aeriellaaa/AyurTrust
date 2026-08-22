import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getBatchStatus } from "../api/client";
import {
  Screen, PrimaryButton, SecondaryButton, Card, Label, StepRail, Rise, PulseHalo,
} from "../components/UI";
import { colors, gradients, type, space, radius } from "../theme";

export default function AIVerificationScreen({ route, navigation }) {
  const { batchId } = route.params;
  const [status, setStatus] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, []);

  async function poll() {
    try {
      const data = await getBatchStatus(batchId);
      setStatus(data);
      if (data.status === "verified" || data.status === "flagged") {
        clearInterval(pollRef.current);
      }
    } catch (err) {
      // A dropped packet shouldn't interrupt the collector. Keep asking.
    }
  }

  const state = !status || status.status === "pending" ? "pending" : status.status;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <StepRail current={2} />

        <Rise>
          <Text style={styles.batchId}>{batchId}</Text>
        </Rise>

        {state === "pending" ? (
          <Rise delay={80}>
            <Card style={styles.stateCard}>
              <PulseHalo size={92}>
                <View style={styles.iconCircleNeutral}>
                  <ActivityIndicator size="large" color={colors.leaf} />
                </View>
              </PulseHalo>
              <Text style={styles.stateTitle}>Checking your batch</Text>
              <Text style={styles.stateBody}>
                We're matching the photo against known species and confirming the collection
                point. This usually takes a few seconds.
              </Text>
              <View style={styles.checkList}>
                <CheckRow label="Photo received" done />
                <CheckRow label="Location confirmed" done />
                <CheckRow label="Species identification" />
              </View>
            </Card>
          </Rise>
        ) : state === "verified" ? (
          <Rise delay={80}>
            <Card style={styles.stateCard}>
              <LinearGradient colors={gradients.leafWash} style={styles.iconCircleGood}>
                <Ionicons name="checkmark" size={42} color="#fff" />
              </LinearGradient>
              <Text style={styles.stateTitle}>Batch verified</Text>
              <Text style={styles.stateBody}>
                This collection has been accepted and recorded.
              </Text>

              <View style={styles.factGrid}>
                <Fact label="Species" value={status.species} icon="leaf-outline" />
                <Fact
                  label="Confidence"
                  value={`${(status.confidence * 100).toFixed(0)}%`}
                  icon="analytics-outline"
                />
                {status.geofence ? (
                  <Fact label="Harvest zone" value={status.geofence} icon="map-outline" />
                ) : null}
              </View>

              <View style={{ height: space.lg, width: "100%" }} />
              <View style={{ width: "100%" }}>
                <PrimaryButton
                  label="View batch passport"
                  icon="ribbon"
                  onPress={() => navigation.replace("QRCode", { batchId })}
                />
              </View>
            </Card>
          </Rise>
        ) : (
          <Rise delay={80}>
            <Card style={styles.stateCard}>
              <View style={styles.iconCircleWarn}>
                <Ionicons name="alert" size={38} color="#fff" />
              </View>
              <Text style={styles.stateTitle}>Sent for review</Text>
              <Text style={styles.stateBody}>
                Something didn't match, so a person will look at this batch before it goes
                further. Nothing is lost — you'll be told the outcome.
              </Text>
              {status.reason ? (
                <View style={styles.reasonBox}>
                  <Label>Reason</Label>
                  <Text style={styles.reasonText}>{status.reason}</Text>
                </View>
              ) : null}
              <View style={{ height: space.lg, width: "100%" }} />
              <View style={{ width: "100%" }}>
                <SecondaryButton
                  label="Back to my batches"
                  icon="arrow-back"
                  onPress={() => navigation.popToTop()}
                />
              </View>
            </Card>
          </Rise>
        )}
      </ScrollView>
    </Screen>
  );
}

function CheckRow({ label, done }) {
  return (
    <View style={styles.checkRow}>
      <Ionicons
        name={done ? "checkmark-circle" : "ellipse-outline"}
        size={21}
        color={done ? colors.leaf : colors.inkFaint}
      />
      <Text style={[styles.checkLabel, done && { color: colors.ink, fontWeight: "600" }]}>
        {label}
      </Text>
    </View>
  );
}

function Fact({ label, value, icon }) {
  return (
    <View style={styles.fact}>
      <View style={styles.factIcon}>
        <Ionicons name={icon} size={18} color={colors.leaf} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.factLabel}>{label}</Text>
        <Text style={styles.factValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: space.lg, paddingTop: 0, paddingBottom: space.xl },
  batchId: {
    ...type.mono,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: space.md,
  },
  stateCard: { alignItems: "center" },

  iconCircleNeutral: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: "rgba(245,241,230,0.9)",
    borderWidth: 1, borderColor: colors.lineSoft,
    alignItems: "center", justifyContent: "center",
  },
  iconCircleGood: {
    width: 92, height: 92, borderRadius: 46,
    alignItems: "center", justifyContent: "center",
  },
  iconCircleWarn: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: colors.danger,
    alignItems: "center", justifyContent: "center",
  },

  stateTitle: { ...type.title, marginTop: space.md, textAlign: "center" },
  stateBody: { ...type.body, textAlign: "center", marginTop: space.xs },

  checkList: { marginTop: space.lg, alignSelf: "stretch", gap: space.sm },
  checkRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  checkLabel: { fontSize: 16, color: colors.inkFaint },

  factGrid: { alignSelf: "stretch", marginTop: space.lg, gap: space.sm },
  fact: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: "rgba(245,241,230,0.75)",
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.md,
    padding: space.md,
  },
  factIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.leafSoft,
    alignItems: "center", justifyContent: "center",
  },
  factLabel: { ...type.label, color: colors.inkFaint, letterSpacing: 1.2 },
  factValue: { fontSize: 17.5, fontWeight: "700", color: colors.ink, marginTop: 3 },

  reasonBox: {
    alignSelf: "stretch",
    marginTop: space.lg,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: space.md,
  },
  reasonText: { fontSize: 16, color: colors.danger, marginTop: 4, lineHeight: 23 },
});