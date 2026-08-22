import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../context/SessionContext";
import {
  Screen, PrimaryButton, Card, Label, LeafMark, Pill, Rise, PressCard,
} from "../components/UI";
import { colors, type, space, radius, shadow } from "../theme";

export default function HomeScreen({ navigation }) {
  const { collectorId, role, batches } = useSession();

  return (
    <Screen>
      <FlatList
        data={batches}
        keyExtractor={(item) => item.batchId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Rise>
              <View style={styles.idRow}>
                <LeafMark size={50} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.hello}>{collectorId}</Text>
                  <Text style={type.caption}>{role}</Text>
                </View>
                <Pill tone="good" icon="shield-checkmark">Registered</Pill>
              </View>
            </Rise>

            <Rise delay={110}>
              <Card style={styles.heroCard}>
                <Label>Start here</Label>
                <Text style={styles.heroTitle}>Log a new collection</Text>
                <Text style={styles.heroBody}>
                  Take one live photo of the herb where you harvested it. The app records the
                  place and time for you.
                </Text>
                <View style={{ height: space.md }} />
                <PrimaryButton
                  label="New collection"
                  icon="camera"
                  onPress={() => navigation.navigate("CaptureHerb")}
                />
              </Card>
            </Rise>

            <Rise delay={200}>
              <View style={styles.sectionHead}>
                <Label>Your batches</Label>
                <Text style={type.caption}>
                  {batches.length} {batches.length === 1 ? "collection" : "collections"}
                </Text>
              </View>
            </Rise>
          </View>
        }
        ListEmptyComponent={
          <Rise delay={260}>
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="basket-outline" size={32} color={colors.inkFaint} />
              </View>
              <Text style={styles.emptyTitle}>No collections yet</Text>
              <Text style={styles.emptyBody}>
                Your first batch will appear here once you submit it.
              </Text>
            </View>
          </Rise>
        }
        renderItem={({ item, index }) => (
          <Rise delay={260 + Math.min(index, 6) * 55}>
            <PressCard
              style={styles.row}
              onPress={() => navigation.navigate("AIVerification", { batchId: item.batchId })}
            >
              <View style={styles.rowIcon}>
                <Ionicons name="leaf" size={20} color={colors.leaf} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowId}>{item.batchId}</Text>
                <Text style={type.caption}>{new Date(item.timestamp).toLocaleString()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.inkFaint} />
            </PressCard>
          </Rise>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: space.lg, paddingBottom: space.xl },

  idRow: { flexDirection: "row", alignItems: "center", gap: space.md, marginBottom: space.lg },
  hello: { fontSize: 20, fontWeight: "700", color: colors.ink, letterSpacing: 0.3 },

  heroCard: { marginBottom: space.xl },
  heroTitle: { ...type.title, marginTop: space.sm },
  heroBody: { ...type.body, marginTop: space.xs },

  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.sm,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    minHeight: 74,
    ...shadow,
  },
  rowIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.leafSoft,
    alignItems: "center", justifyContent: "center",
  },
  rowId: { fontSize: 16.5, fontWeight: "700", color: colors.ink, letterSpacing: 0.5 },

  empty: { alignItems: "center", paddingVertical: space.xl },
  emptyIcon: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1, borderColor: colors.lineSoft,
    alignItems: "center", justifyContent: "center",
    marginBottom: space.md,
  },
  emptyTitle: { ...type.bodyStrong },
  emptyBody: { ...type.caption, textAlign: "center", marginTop: 4, maxWidth: 260 },
});