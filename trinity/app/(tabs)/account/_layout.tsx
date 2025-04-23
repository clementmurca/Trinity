import { Stack } from "expo-router";
import { Provider } from "react-redux";
import store from "../../../redux/store"; // ✅ Ensure correct store path
import { View, ActivityIndicator } from "react-native"; // ✅ Import necessary components

export default function AccountLayout() {
    return (
        <Provider store={store}> 
            <View style={{ flex: 1, backgroundColor: "#fff" }}> 
                <Stack>
                    <Stack.Screen
                        name="index"
                        options={{
                            title: "Account",
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="login"
                        options={{
                            title: "Login",
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="signup"
                        options={{
                            title: "Sign Up",
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="profile"
                        options={{
                            title: "Profile",
                            headerShown: true, // ✅ Show header on profile page
                        }}
                    />
                </Stack>
            </View>
        </Provider>
    );
}
