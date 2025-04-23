import { Stack } from "expo-router";

export default function RecommandProductsLayout() {
    return(
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title:"Recommandations Products",
                    headerShown: false
                }}
            />
        </Stack>
    )
}
