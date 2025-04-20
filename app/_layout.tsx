import { Stack } from "expo-router";
import { HamburgerProvider } from "./components/Hamburger"; 

export default function Layout() {
  return (
    <HamburgerProvider> 
      <Stack>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="screens/AuthScreen" options={{ headerShown: false }} />

        <Stack.Screen
          name="screens/Login"
          options={{
            title: "Login",
            headerStyle: { backgroundColor: "#344E41" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="screens/SignUp"
          options={{
            title: "Sign Up",
            headerStyle: { backgroundColor: "#344E41" },
            headerTintColor: "#fff",
          }}
        />

        <Stack.Screen name="screens/Verification" options={{ title: "Verification" }} />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
      </Stack>
    </HamburgerProvider>
  );
}
