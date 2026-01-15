import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FormScreen from "../screens/FormScreen";
import LoginScreen from "../screens/LoginScreen";
import JuegoScreen from "../screens/JuegoScreen";
import UserScreen from "../screens/UserScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import { NavigationContainer } from "@react-navigation/native";
import GameScreen from "../screens/GamesScreen";
import PuntuacionesScreen from "../screens/PuntuacionesScreen";

//icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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
            <Stack.Screen name="Formulario" component={FormScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Tab" component={MyTab} options={{ headerShown: false }}/>
        </Stack.Navigator>
    )
}

function MyTab() {
    return (
        <Tab.Navigator
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
            <Tab.Screen name="Menú" component={JuegoScreen}
                options={{ tabBarIcon: () => <MaterialIcons name="menu" size={28} color="#0059ff" /> }}
            />
            <Tab.Screen name="Juego" component={GameScreen}
                options={{ tabBarIcon: () => <MaterialIcons name="sports-esports" size={28} color="#5B23FF" /> }}
            />
            <Tab.Screen name="Puntuacion" component={PuntuacionesScreen}
                options={{ tabBarIcon: () => <MaterialIcons name="leaderboard" size={28} color="#44ff00" /> }}
            />
            <Tab.Screen name="Perfil" component={UserScreen} 
             options={{tabBarIcon: ()=> <MaterialIcons name="person" size={24} color="#3700ff" /> }}
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
