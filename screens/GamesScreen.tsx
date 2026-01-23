import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { ref, set, push } from "firebase/database";
import { db } from '../firebase/Config';
import { supabase } from '../service/supabase/config';

// Configuración
const TIEMPO_JUEGO = 30;
const PUNTOS_POR_INSECTO = 10;
const MAX_INSECTOS = 10;
const TAMANO_INSECTO = 70;

export default function GameScreen({ navigation }: any) {
    // Recibir nombre de usuario de supabase
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    // Estados del juego
    const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_JUEGO);
    const [puntuacion, setPuntuacion] = useState(0);
    const [juegoActivo, setJuegoActivo] = useState(true);
    const [insectos, setInsectos] = useState<Array<{ id: number, x: string, y: string }>>([]);

    //Funcion para buscar el usuario en supabase
    useEffect(() => {
        loadUserName();
    }, []);

    const loadUserName = async () => {
        try {
            // Obtener usuario autenticado
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Buscar el nombre de usuario
                const { data, error } = await supabase
                    .from('users')
                    .select('username')
                    .eq('id', user.id.replace(/-/g, ""))
                    .single();

                if (data && !error) {
                    setUserName(data.username);
                }
            }
        } catch (error) {
            console.error("Error cargando nombre:", error);
        } finally {
            setLoading(false);
        }
    };

    // Función para guardar puntuación
    const guardarPuntuacionEnFirebase = async (puntuacion: number, usuario: string) => {
        try {
            // Usar push() para generar ID automático
            const nuevaPuntuacionRef = push(ref(db, 'puntuaciones/'));

            await set(nuevaPuntuacionRef, {
                usuario: usuario,
                puntuacion: puntuacion,
                fecha: new Date().toISOString()
            });

            console.log('✅ Puntuación guardada correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error guardando puntuación:', error);
            return false;
        }
    };

    // Función de reinicio completo
    const reiniciarJuegoCompleto = useCallback(() => {
        setJuegoActivo(false);
        setTiempoRestante(TIEMPO_JUEGO);
        setPuntuacion(0);
        setInsectos([]);
        juegoTerminadoRef.current = false;
        insectoCounter.current = 0;
        posicionesUsadas.current.clear();
    }, []);

    // Efecto para reiniciar cuando se desmonta o sale de la pantalla
    useEffect(() => {
        return () => {
            // Esto se ejecuta cuando el componente se desmonta
            reiniciarJuegoCompleto();
        };
    }, []);

    // Efecto para escuchar cuando la pantalla pierde el foco
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            // Cuando la pantalla pierde el foco (navegamos a otra)
            reiniciarJuegoCompleto();
        });

        return unsubscribe;
    }, [navigation]);



    // Referencias
    const insectoCounter = useRef(0);
    const juegoTerminadoRef = useRef(false);
    const posicionesUsadas = useRef<Set<number>>(new Set());

    // Posiciones predefinidas (más alejadas de los bordes)
    const posicionesPredefinidas = [
        // Centro - área segura
        { x: '25%', y: '30%' },
        { x: '50%', y: '25%' },
        { x: '75%', y: '30%' },
        { x: '20%', y: '50%' },
        { x: '45%', y: '45%' },
        { x: '70%', y: '50%' },
        { x: '35%', y: '65%' },
        { x: '60%', y: '70%' },
        { x: '80%', y: '65%' },
        { x: '30%', y: '40%' },
        { x: '55%', y: '35%' },
        { x: '65%', y: '40%' },
        { x: '40%', y: '55%' },
        { x: '25%', y: '60%' },
        { x: '70%', y: '60%' },
    ];

    // Obtener posición aleatoria
    const obtenerPosicionAleatoria = () => {
        if (posicionesUsadas.current.size >= posicionesPredefinidas.length) {
            posicionesUsadas.current.clear();
        }

        let index;
        let intentos = 0;

        do {
            index = Math.floor(Math.random() * posicionesPredefinidas.length);
            intentos++;
        } while (posicionesUsadas.current.has(index) && intentos < 20);

        posicionesUsadas.current.add(index);
        return posicionesPredefinidas[index];
    };

    // Efecto temporizador
    useEffect(() => {
        if (tiempoRestante > 0 && juegoActivo) {
            const timer = setTimeout(() => {
                setTiempoRestante(tiempoRestante - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (tiempoRestante === 0 && juegoActivo && !juegoTerminadoRef.current) {
            terminarJuego();
        }
    }, [tiempoRestante, juegoActivo]);

    // Crear insecto
    const crearInsecto = () => {
        if (!juegoActivo || insectos.length >= MAX_INSECTOS) return;

        const posicion = obtenerPosicionAleatoria();
        const nuevoInsecto = {
            id: ++insectoCounter.current,
            x: posicion.x,
            y: posicion.y,
        };

        setInsectos(prev => [...prev, nuevoInsecto]);
    };

    // Eliminar insecto
    const eliminarInsecto = (id: number) => {
        if (!juegoActivo) return;

        Vibration.vibrate(50);
        setInsectos(prev => prev.filter(insecto => insecto.id !== id));
        setPuntuacion(prev => prev + PUNTOS_POR_INSECTO);

        setTimeout(() => {
            if (juegoActivo) crearInsecto();
        }, 300);
    };

    // Inicializar juego
    useEffect(() => {
        // Crear primeros insectos
        setTimeout(() => crearInsecto(), 300);
        setTimeout(() => crearInsecto(), 600);
        setTimeout(() => crearInsecto(), 900);
    }, []);

    // Crear insectos periódicamente
    useEffect(() => {
        if (juegoActivo && insectos.length < MAX_INSECTOS) {
            const intervalo = setInterval(() => {
                if (Math.random() < 0.4) crearInsecto();
            }, 2000);
            return () => clearInterval(intervalo);
        }
    }, [juegoActivo, insectos.length]);

    // Terminar juego
    const terminarJuego = async () => {
        juegoTerminadoRef.current = true;
        setJuegoActivo(false);
        Vibration.vibrate(200);

        // Si el usuario está logueado, usar su nombre, sino usar "Jugador"
        const nombreUsuario = userName || 'Jugador';

        // GUARDAR EN FIREBASE
        const resultado = await guardarPuntuacionEnFirebase(puntuacion, nombreUsuario);

        Alert.alert(
            '🎯 ¡Juego Terminado!',
            `Puntuación: ${puntuacion} puntos\n\nJugador: ${nombreUsuario}\n${resultado ? '✅ Puntuación guardada' : '⚠️ Error guardando'}`,
            [
                {
                    text: 'Jugar otra vez',
                    onPress: () => {
                        reiniciarJuegoCompleto();
                        setJuegoActivo(true);

                        setTimeout(() => crearInsecto(), 300);
                        setTimeout(() => crearInsecto(), 600);
                        setTimeout(() => crearInsecto(), 900);
                    }
                },
                {
                    text: 'Volver al menú',
                    onPress: () => {
                        navigation.goBack();
                    }
                },
                {
                    text: 'Ver puntuaciones',
                    onPress: () => {
                        navigation.navigate('Puntuacion');
                    }
                }
            ]
        );
    };

    // Volver al menú
    const volverAlMenu = () => {
        Alert.alert(
            'Salir del juego',
            '¿Estás seguro de que quieres salir? Se perderá el progreso actual.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Salir',
                    onPress: () => navigation.goBack(),
                    style: 'destructive'
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="#233D4D" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FE7F2D" />
                    <Text style={styles.loadingText}>Cargando datos del jugador...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#233D4D" />

            {/* HEADER DEL JUEGO */}
            <View style={styles.header}>
                <View style={styles.playerInfo}>
                    <Text style={styles.playerLabel}>JUGADOR</Text>
                    <Text style={styles.playerName}>{userName || 'Jugador'}</Text>
                </View>

                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>PUNTUACIÓN</Text>
                    <Text style={styles.scoreValue}>{puntuacion}</Text>
                </View>

                <View style={styles.timerContainer}>
                    <Text style={styles.timerLabel}>TIEMPO</Text>
                    <Text style={[
                        styles.timerValue,
                        tiempoRestante <= 10 && { color: '#FF5252' }
                    ]}>
                        {tiempoRestante}s
                    </Text>
                </View>
            </View>

            {/* ÁREA DE JUEGO (OCUPA LA MAYOR PARTE) */}
            <View style={styles.gameArea}>
                {insectos.map(insecto => (
                    <TouchableOpacity
                        key={insecto.id}
                        style={[
                            styles.insecto,
                            {
                                left: insecto.x as any,
                                top: insecto.y as any
                            }
                        ]}
                        onPress={() => eliminarInsecto(insecto.id)}
                        activeOpacity={0.7}
                        disabled={!juegoActivo}
                    >
                        <Text style={styles.insectoText}>
                            {Math.random() > 0.5 ? '🦗' : '🐞'}
                        </Text>
                    </TouchableOpacity>
                ))}

                {/* CONTADOR DE INSECTOS */}
                <View style={styles.insectCounter}>
                    <Text style={styles.insectCounterText}>
                        Insectos: {insectos.length}/{MAX_INSECTOS}
                    </Text>
                </View>
            </View>

            {/* CONTROLES */}
            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlButton, styles.exitButton]}
                    onPress={volverAlMenu}
                    activeOpacity={0.8}
                >
                    <Text style={styles.controlButtonText}>SALIR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton,
                    juegoActivo ? styles.pauseButton : styles.resumeButton
                    ]}
                    onPress={() => setJuegoActivo(!juegoActivo)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.controlButtonText}>
                        {juegoActivo ? 'PAUSAR' : 'CONTINUAR'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#233D4D',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#2C4A5E',
        borderBottomWidth: 2,
        borderBottomColor: '#FE7F2D',
        height: 100,
    },
    playerInfo: {
        alignItems: 'center',
        flex: 1,
    },
    playerLabel: {
        color: '#A0B3A8',
        fontSize: 12,
        fontWeight: '600',
    },
    playerName: {
        color: '#F5FBE6',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },
    scoreContainer: {
        alignItems: 'center',
        flex: 1,
    },
    scoreLabel: {
        color: '#A0B3A8',
        fontSize: 12,
        fontWeight: '600',
    },
    scoreValue: {
        color: '#F5FBE6',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 5,
    },
    timerContainer: {
        alignItems: 'center',
        flex: 1,
    },
    timerLabel: {
        color: '#A0B3A8',
        fontSize: 12,
        fontWeight: '600',
    },
    timerValue: {
        color: '#4CAF50',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 5,
    },
    gameArea: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#1A2F3C',
    },
    insecto: {
        position: 'absolute',
        width: TAMANO_INSECTO,
        height: TAMANO_INSECTO,
        borderRadius: TAMANO_INSECTO / 2,
        backgroundColor: 'rgba(254, 127, 45, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    insectoText: {
        fontSize: 36,
    },
    insectCounter: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    insectCounterText: {
        color: '#A0B3A8',
        fontSize: 14,
        backgroundColor: 'rgba(44, 74, 94, 0.8)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    controls: {
        flexDirection: 'row',
        height: 80,
        paddingHorizontal: 15,
        backgroundColor: '#2C4A5E',
        borderTopWidth: 2,
        borderTopColor: '#FE7F2D',
        gap: 10,
        alignItems: 'center',
    },
    controlButton: {
        flex: 1,
        height: 50,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    exitButton: {
        backgroundColor: '#FF5252',
    },
    pauseButton: {
        backgroundColor: '#FE7F2D',
    },
    resumeButton: {
        backgroundColor: '#4CAF50',
    },
    controlButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#233D4D',
    },
    loadingText: {
        color: '#F5FBE6',
        fontSize: 16,
        marginTop: 20,
    },
});