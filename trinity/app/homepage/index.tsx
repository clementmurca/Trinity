import { Stack } from 'expo-router';
import { View } from 'react-native';

const HomePage = () => {
    return (
        <View className="flex-1">
            <Stack.Screen
                options={{
                    headerTitle: "Home page",
                    headerTitleAlign: "center",
                }}
            />
        </View>
    );
}

export default HomePage;