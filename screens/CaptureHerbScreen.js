import React, { useRef, useState } from "react";
import {
  View, Text, Pressable, StyleSheet,
  ActivityIndicator, Alert, Image, ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSession } from "../context/SessionContext";
import { submitBatch } from "../api/client";
import {
  Screen, PrimaryButton, SecondaryButton, Card, Label, StepRail, Pill, Rise,
} from "../components/UI";
import { colors, type, space, radius, shadow } from "../theme";

export default function CaptureHerbScreen({ navigation }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { collectorId, addBatch } = useSession();

  const [cameraReady, setCameraReady] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!permission) {
    return (
      <Screen>
        <View style={styles.center}><ActivityIndicator color={colors.leaf} /></View>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen>
        <View style={styles.center}>
          <Rise>
            <View style={styles.permIcon}>
              <Ionicons name="camera-outline" size={34} color={colors.leaf} />
            </View>
          </Rise>
          <Rise delay={90}>
            <Text style={styles.permTitle}>Camera access needed</Text>
            <Text style={styles.permBody}>
              AyurTrust records a live photo at the place you harvest. Photos from your gallery
              can't be used, so the camera is the only way to log a batch.
            </Text>
            <View style={{ height: space.lg }} />
            <PrimaryButton label="Allow camera" icon="camera" onPress={requestPermission} />
          </Rise>
        </View>
      </Screen>
    );
  }

  async function lockLocation() {
    setLocating(true);
    try {
      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) {
        Alert.alert("Location is switched off", "Turn on Location in your phone settings, then tap Retake.");
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location needed", "AyurTrust records where the herb was collected.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        mocked: pos.mocked === true,
        gpsTimestamp: new Date(pos.timestamp).toISOString(),
      });
    } catch (err) {
      Alert.alert("Could not find your location", "Step into open ground and tap Retake.");
    } finally {
      setLocating(false);
    }
  }

  async function takePhoto() {
    if (!cameraRef.current || !cameraReady) return;
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      setPhoto(result);
      await lockLocation();
    } catch (err) {
      Alert.alert("Photo failed", "Please try again.");
    }
  }

  function retake() {
    setPhoto(null);
    setLocation(null);
  }

  async function handleSubmit() {
    if (!photo || !location || submitting) return;

    if (location.mocked) {
      Alert.alert(
        "Fake location detected",
        "This phone is reporting a false location. AyurTrust cannot accept the batch. Turn off any location-changing app and try again."
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        collectorId: collectorId || "UNKNOWN",
        photoUri: photo.uri,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        mocked: location.mocked,
        gpsTimestamp: location.gpsTimestamp,
        timestamp: new Date().toISOString(),
      };
      const response = await submitBatch(payload);
      await addBatch({ batchId: response.batchId, timestamp: payload.timestamp });
      navigation.replace("AIVerification", { batchId: response.batchId });
    } catch (err) {
      Alert.alert("Could not send", "Check your signal and try again. Your photo is safe.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------- Review state ----------------
  if (photo) {
    const weak = location && location.accuracy > 50;
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.reviewScroll} showsVerticalScrollIndicator={false}>
          <StepRail current={1} />

          <Rise>
            <View style={styles.photoFrame}>
              <Image source={{ uri: photo.uri }} style={styles.photo} />
              <LinearGradient
                colors={["rgba(14,24,17,0.5)", "transparent"]}
                style={styles.photoScrim}
              />
              <View style={styles.photoBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.photoBadgeText}>Live photo</Text>
              </View>
            </View>
          </Rise>

          <Rise delay={110}>
            <Card style={{ marginTop: space.md }}>
              <Label>Where this was collected</Label>

              {locating ? (
                <View style={styles.gpsRow}>
                  <ActivityIndicator color={colors.leaf} />
                  <Text style={styles.gpsWait}>Finding your location…</Text>
                </View>
              ) : location ? (
                <View>
                  <Text style={styles.coords}>
                    {location.latitude.toFixed(5)}°N, {location.longitude.toFixed(5)}°E
                  </Text>
                  <View style={styles.pillRow}>
                    <Pill tone={weak ? "gold" : "good"} icon="locate">
                      ±{Math.round(location.accuracy)} m
                    </Pill>
                    {location.mocked ? (
                      <Pill tone="warn" icon="alert-circle">Fake location</Pill>
                    ) : (
                      <Pill tone="good" icon="shield-checkmark">Genuine signal</Pill>
                    )}
                  </View>
                  {weak ? (
                    <Text style={styles.weakNote}>
                      Signal is weak here. Move to open ground and tap Retake for a sharper location.
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text style={styles.gpsWait}>No location yet — tap Retake to try again.</Text>
              )}
            </Card>
          </Rise>

          <Rise delay={200}>
            <View style={{ height: space.lg }} />
            <PrimaryButton
              label="Submit batch"
              icon="checkmark"
              onPress={handleSubmit}
              disabled={!location}
              loading={submitting}
            />
            <View style={{ height: space.sm }} />
            <SecondaryButton label="Retake photo" icon="refresh" onPress={retake} />
          </Rise>
        </ScrollView>
      </Screen>
    );
  }

  // ---------------- Camera state ----------------
  // Deliberately dark: a viewfinder should disappear so the plant is
  // the only thing you look at. Scrims keep the text legible over
  // whatever the camera happens to be pointing at.
  return (
    <View style={styles.cameraScreen}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setCameraReady(true)}
      />

      <LinearGradient
        colors={["rgba(14,24,17,0.72)", "transparent"]}
        style={styles.topScrim}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", "rgba(14,24,17,0.82)"]}
        style={styles.bottomScrim}
        pointerEvents="none"
      />

      <View style={styles.topBar}>
        <View style={styles.instructionPill}>
          <Ionicons name="leaf" size={16} color="#fff" />
          <Text style={styles.instructionText}>Fill the frame with the herb</Text>
        </View>
      </View>

      {/* Corner guides — shows where to aim without covering the plant */}
      <View style={styles.guide} pointerEvents="none">
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
      </View>

      <View style={styles.bottomBar}>
        <Text style={styles.camHint}>
          {cameraReady ? "Live camera only — gallery photos are not accepted" : "Starting camera…"}
        </Text>
        <Pressable
          onPress={takePhoto}
          disabled={!cameraReady}
          accessibilityRole="button"
          accessibilityLabel="Take photo"
          style={({ pressed }) => [
            styles.shutter,
            !cameraReady && styles.shutterOff,
            pressed && { transform: [{ scale: 0.93 }] },
          ]}
        >
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: space.lg },
  permIcon: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: colors.leafSoft,
    alignItems: "center", justifyContent: "center",
    alignSelf: "center",
  },
  permTitle: { ...type.title, marginTop: space.md, textAlign: "center" },
  permBody: { ...type.body, textAlign: "center", marginTop: space.sm },

  reviewScroll: { padding: space.lg, paddingTop: 0, paddingBottom: space.xl },
  photoFrame: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.lineSoft,
    backgroundColor: colors.surfaceAlt,
    ...shadow,
  },
  photo: { width: "100%", height: 300 },
  photoScrim: { position: "absolute", top: 0, left: 0, right: 0, height: 80 },
  photoBadge: {
    position: "absolute", top: space.sm, left: space.sm,
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(30,74,44,0.9)",
    paddingVertical: 6, paddingHorizontal: 11,
    borderRadius: radius.pill,
  },
  photoBadgeText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  gpsRow: { flexDirection: "row", alignItems: "center", gap: space.sm, marginTop: space.sm },
  gpsWait: { ...type.body, marginTop: space.xs },
  coords: { fontSize: 19, fontWeight: "700", color: colors.ink, marginTop: space.sm, letterSpacing: 0.3 },
  pillRow: { flexDirection: "row", gap: space.sm, marginTop: space.sm, flexWrap: "wrap" },
  weakNote: { ...type.caption, color: "#87620F", marginTop: space.sm, lineHeight: 20 },

  cameraScreen: { flex: 1, backgroundColor: colors.night },
  topScrim: { position: "absolute", top: 0, left: 0, right: 0, height: 150 },
  bottomScrim: { position: "absolute", bottom: 0, left: 0, right: 0, height: 220 },

  topBar: { position: "absolute", top: 56, left: 0, right: 0, alignItems: "center" },
  instructionPill: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: "rgba(14,24,17,0.55)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
    paddingVertical: 9, paddingHorizontal: 16,
    borderRadius: radius.pill,
  },
  instructionText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  guide: { position: "absolute", top: "22%", left: "10%", right: "10%", height: "42%" },
  corner: { position: "absolute", width: 36, height: 36, borderColor: "rgba(255,255,255,0.9)" },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },

  bottomBar: { position: "absolute", bottom: 46, left: 0, right: 0, alignItems: "center" },
  camHint: { color: "rgba(255,255,255,0.85)", fontSize: 13.5, marginBottom: space.md },
  shutter: {
    width: 84, height: 84, borderRadius: 42,
    borderWidth: 4, borderColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  shutterOff: { opacity: 0.4 },
  shutterInner: { width: 66, height: 66, borderRadius: 33, backgroundColor: "#fff" },
});