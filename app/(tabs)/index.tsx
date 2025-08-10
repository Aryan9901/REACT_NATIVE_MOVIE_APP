import { Text, View } from "react-native";

export default function Index() {
	return (
		<View className="flex-1 items-center justify-center bg-secondary">
			<Text className="text-accent text-2xl">Hello, World!</Text>
			<Text className="text-light-300 text-lg">Welcome to the app!</Text>
			<Text className="text-white text-sm">This is a simple React Native app.</Text>
			<Text className="text-white text-xs">Enjoy your stay!</Text>
		</View>
	);
}
