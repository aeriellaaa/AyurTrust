import React from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Fraunces_600SemiBold, Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import { SessionProvider } from "./context/SessionContext";
import { colors, fonts } from "./theme";

import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import CaptureHerbScreen from "./screens/CaptureHerbScreen";
import AIVerificationScreen from "./screens/AIVerificationScreen";
import QRCodeScreen from "./screens/QRCodeScreen";

const Stack = createNativeStackNavigator();

// Navigation paints its own background behind screens. Set it to our
// paper colour so there's never a white flash mid-transition.
const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.paper, card: colors.paper },
};

const headerStyles = {
  headerStyle: { backgroundColor: colors.paper },
  headerShadowVisible: false,
  headerTintColor: colors.leafDark,
  headerTitleStyle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: fonts.display ? undefined : "700",
    color: colors.ink,
  },
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: colors.paper },
};

export default function App() {
  // If the font fails for any reason we still render — the app falls
  // back to the system face rather than hanging on a blank screen.
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.paper }} />;
  }

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator initialRouteName="Login" screenOptions={headerStyles}>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "My collections" }}
            />
            <Stack.Screen
              name="CaptureHerb"
              component={CaptureHerbScreen}
              options={{ title: "New collection" }}
            />
            <Stack.Screen
              name="AIVerification"
              component={AIVerificationScreen}
              options={{ title: "Checking batch" }}
            />
            <Stack.Screen
              name="QRCode"
              component={QRCodeScreen}
              options={{ title: "Batch passport" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SessionProvider>
    </SafeAreaProvider>
  );
}