import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FormScreen from "../screens/FormScreen";
import LoginScreen from "../screens/LoginScreen";
import JuegoScreen from "../screens/JuegoScreen";
import { NavigationContainer } from "@react-navigation/native";
import GameScreen from "../screens/GamesScreen";
import PuntuacionesScreen from "../screens/PuntuacionesScreen";

//icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import WelcomeScreen from "../screens/WelcomeScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MyStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#233D4D",
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Formulario" component={FormScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Tab" component={MyTab} options={{ headerShown: false }}/>
        </Stack.Navigator>
    )
}

function MyTab() {
    return (
        <Tab.Navigator >
            <Tab.Screen name="Menú" component={JuegoScreen} 
                options={{ tabBarIcon: () => <MaterialIcons name="menu" size={28} color="#0059ff" /> } }
            />
            <Tab.Screen name="Juego" component={GameScreen}
                options={{ tabBarIcon: () => <MaterialIcons name="sports-esports" size={28} color="#5B23FF" /> }}
            />
            <Tab.Screen name="Puntuación" component={PuntuacionesScreen}
                options={{ tabBarIcon: () => <MaterialIcons name="leaderboard" size={28} color="#44ff00" /> }}
            />
        </Tab.Navigator>
    )
}

export default function MainNav() {
    return (
        <NavigationContainer>
            <MyStack />
        </NavigationContainer>
    )
}
