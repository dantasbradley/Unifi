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
        <Stack.Screen
           name="screens/Verification"
          options={{
            title: "Verification Page",
            headerStyle: { backgroundColor: "#344E41" }, // Dark green background
            headerTintColor: "#fff", // White back arrow + title text
            headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
          name="screens/resetPassword"
          options={{
            title: "Change Password",
            headerStyle: { backgroundColor: "#344E41" }, // Dark green
            headerTintColor: "#fff", // White back arrow & text
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <Stack.Screen
          name="screens/resetEmail"
          options={{
            title: "Reset Password",
            headerStyle: { backgroundColor: "#344E41" }, // Dark green
            headerTintColor: "#fff", // White back arrow & text
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
      </Stack>
    </HamburgerProvider>
  );
}
