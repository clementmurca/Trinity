import { Stack } from "expo-router";

export default function PurchaseHistoryLayout() {
    return(
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title:"Purchase history",
                    headerShown: false
                }}
            />
        </Stack>
    )
}
