import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  Pressable, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSession } from "../context/SessionContext";
import { Screen, PrimaryButton, LeafMark, Rise, Divider } from "../components/UI";
import { colors, type, space, radius } from "../theme";

// Roles as tappable cards, not a dropdown. A dropdown hides the
// options until tapped; a collector should see all three at once.
const ROLES = [
  { key: "Farmer / Collector", icon: "leaf-outline", hint: "I harvest herbs" },
  { key: "Aggregator", icon: "cube-outline", hint: "I collect from farmers" },
  { key: "Processor", icon: "flask-outline", hint: "I dry, grind or pack" },
];

export default function LoginScreen({ navigation }) {
  const { login } = useSession();
  const [id, setId] = useState("");
  const [role, setRole] = useState(ROLES[0].key);
  const [focused, setFocused] = useState(false);

  async function handleContinue() {
    if (!id.trim()) return;
    await login(id.trim(), role);
    navigation.replace("Home");
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Rise>
            <View style={styles.brand}>
              <LeafMark size={68} />
              <Text style={styles.wordmark}>AyurTrust</Text>
              <Text style={styles.tagline}>Proof of origin, from the field forward</Text>
            </View>
          </Rise>

          <Rise delay={90}>
            <Divider />
            <Text style={styles.question}>Who is collecting today?</Text>
          </Rise>

          <View style={styles.roles}>
            {ROLES.map((r, i) => {
              const selected = role === r.key;
              return (
                <Rise key={r.key} delay={150 + i * 70}>
                  <Pressable
                    style={[styles.roleCard, selected && styles.roleCardOn]}
                    onPress={() => setRole(r.key)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    {selected ? (
                      <LinearGradient
                        colors={["#EDF5EE", "#E2EFE4"]}
                        style={StyleSheet.absoluteFill}
                      />
                    ) : null}
                    <View style={styles.roleRow}>
                      <View style={[styles.roleIcon, selected && styles.roleIconOn]}>
                        <Ionicons name={r.icon} size={23} color={selected ? "#fff" : colors.leaf} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.roleName, selected && styles.roleNameOn]}>{r.key}</Text>
                        <Text style={styles.roleHint}>{r.hint}</Text>
                      </View>
                      {selected ? (
                        <Ionicons name="checkmark-circle" size={25} color={colors.leaf} />
                      ) : (
                        <View style={styles.emptyCheck} />
                      )}
                    </View>
                  </Pressable>
                </Rise>
              );
            })}
          </View>

          <Rise delay={380}>
            <Text style={styles.fieldLabel}>Your collector ID</Text>
            <TextInput
              style={[styles.input, focused && styles.inputOn]}
              placeholder="COL-1042"
              placeholderTextColor={colors.inkFaint}
              value={id}
              onChangeText={setId}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Text style={styles.helper}>Printed on your AyurTrust registration card.</Text>

            <View style={{ height: space.lg }} />
            <PrimaryButton
              label="Start collecting"
              icon="arrow-forward"
              onPress={handleContinue}
              disabled={!id.trim()}
            />
          </Rise>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: space.lg, paddingTop: space.xl, paddingBottom: space.xl },
  brand: { alignItems: "center" },
  wordmark: { ...type.display, marginTop: space.md },
  tagline: { ...type.caption, marginTop: 5, letterSpacing: 0.2 },

  question: { ...type.title, marginBottom: space.md },

  roles: { gap: space.sm, marginBottom: space.xl },
  roleCard: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    overflow: "hidden",
    minHeight: 78,
    justifyContent: "center",
  },
  roleCardOn: { borderColor: colors.leaf },
  roleRow: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.md },
  roleIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.leafSoft,
    alignItems: "center", justifyContent: "center",
  },
  roleIconOn: { backgroundColor: colors.leaf },
  roleName: { fontSize: 17, fontWeight: "700", color: colors.ink },
  roleNameOn: { color: colors.leafDark },
  roleHint: { fontSize: 14, color: colors.inkFaint, marginTop: 2 },
  emptyCheck: { width: 25, height: 25, borderRadius: 13, borderWidth: 2, borderColor: colors.line },

  fieldLabel: { ...type.bodyStrong, marginBottom: space.sm },
  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    minHeight: 60,
    fontSize: 20,
    letterSpacing: 1.2,
    color: colors.ink,
  },
  inputOn: { borderColor: colors.leaf, backgroundColor: "#fff" },
  helper: { ...type.caption, marginTop: space.sm },
});