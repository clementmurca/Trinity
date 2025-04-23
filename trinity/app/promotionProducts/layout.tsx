import { Stack } from "expo-router";

export default function PromotionLayout() {
    return(
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title:"Promotion Products",
                    headerShown: false
                }}
            />
        </Stack>
    )
}
