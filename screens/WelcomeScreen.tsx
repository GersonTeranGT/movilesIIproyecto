import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    Formulario: undefined;
    Login: undefined;
};

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    // Usamos el hook useNavigation y le asignamos el tipo que creamos arriba
    const navigation = useNavigation<WelcomeScreenNavigationProp>();

    return (
        <ImageBackground
            source={require('../../movilesIIproyecto/img/fondo_plata.jpg')}
            style={styles.container}
            resizeMode="cover" // Esto hace que la imagen cubra toda la pantalla sin deformarse
        >
            <View style={styles.container}>

                {/* PARTE SUPERIOR: Textos */}
                <View style={styles.topContainer}>
                    <Text style={styles.title}>¡BIENVENIDO!</Text>
                    <Text style={styles.subtitle}>Ingresa a tu cuenta o únete a nosotros</Text>
                </View>

                {/* Fondo de los botones */}
                <View style={styles.bottomContainer}>
                    {/* El "globo" que simula la onda */}
                    <View style={styles.pinkBackground} />

                    <View style={styles.buttonsContainer}>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigation.navigate('Formulario')}
                        >
                            <Text style={styles.buttonText}>REGISTRARSE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topContainer: {
        flex: 0.50, // Ocupa el 50% superior de la pantalla
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 25,
    },
    title: {
        fontSize: 51,
        fontWeight: 'bold',
        color: '#FFF5F2',
        marginBottom: 10,
        marginTop: 150,
    },
    subtitle: {
        fontSize: 16,
        color: '#2D3C59',
        fontWeight: 'bold',

    },
    bottomContainer: {
        flex: 0.51, // Ocupa el 51% inferior
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative', // Necesario para posicionar el fondo redondeado
    },
    // Este es el truco para el fondo redondeado
    pinkBackground: {
        position: 'absolute',
        top: 50,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#568F87', // Color rosa similar al de la imagen
        borderTopLeftRadius: width * 0.3, // Redondea la esquina superior izquierda
        borderTopRightRadius: width * 0.3, // Redondea la esquina superior derecha
        zIndex: 0, // Asegura que el fondo esté detrás de los botones
    },
    buttonsContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 45,
        zIndex: 1, // Asegura que los botones estén sobre el fondo rosa
    },
    button: {
        backgroundColor: '#ffffff',
        width: '90%',
        paddingVertical: 15,
        borderRadius: 30, // Bordes muy redondeados
        alignItems: 'center',
        marginTop: 18,
        marginBottom: 15,
        // Sombras para darle relieve
        shadowColor: "#2D3C59",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 9, // Sombra para Android
    },
    buttonText: {
        color: '#2D3C59',
        fontWeight: 'bold',
        fontSize: 18,

    },
});