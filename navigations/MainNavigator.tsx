import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FormScreen from "../screens/FormScreen";
import LoginScreen from "../screens/LoginScreen";
import JuegoScreen from "../screens/JuegoScreen";
import { NavigationContainer } from "@react-navigation/native";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MyStack(){
    return(
        <Stack.Navigator
        screenOptions={{
            headerStyle:{
                backgroundColor: "#233D4D",
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        }}
        >
            <Stack.Screen name="Formulario" component={FormScreen}/>
            <Stack.Screen name="Login" component={LoginScreen}/>
            <Stack.Screen name="Tab" component={MyTab}/>
        </Stack.Navigator>
    )
}

function MyTab(){
    return(
        <Tab.Navigator>
            <Tab.Screen name="Juego" component={JuegoScreen}/>
        </Tab.Navigator>
    )
}

export default function MainNav(){
    return (
        <NavigationContainer>
            <MyStack/>
        </NavigationContainer>
    )
}