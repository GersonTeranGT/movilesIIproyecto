import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../service/supabase/config';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';

export default function UserScreen({ navigation }: any) {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            // Obtener usuario autenticado
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Buscar datos del usuario en la tabla 'users'
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id.replace(/-/g, ""))
                    .single();

                if (data && !error) {
                    setUserData(data);
                } else {
                    console.error("Error al obtener datos:", error);
                }
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        await SecureStore.deleteItemAsync('token')
        navigation.navigate('Welcome');
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.videoBackground}>
                    <View style={styles.animatedBackground}>
                        <View style={styles.colorBlob1} />
                        <View style={styles.colorBlob2} />
                        <View style={styles.colorBlob3} />
                    </View>
                </View>
                <View style={styles.centeredContent}>
                    <ActivityIndicator size="large" color="#FE7F2D" />
                    <Text style={styles.loadingText}>Cargando datos...</Text>
                </View>
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={styles.container}>
                <View style={styles.videoBackground}>
                    <View style={styles.animatedBackground}>
                        <View style={styles.colorBlob1} />
                        <View style={styles.colorBlob2} />
                        <View style={styles.colorBlob3} />
                    </View>
                </View>
                <View style={styles.centeredContent}>
                    <Text style={styles.errorText}>No se encontraron datos del usuario</Text>
                    <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.videoBackground}>
                <View style={styles.animatedBackground}>
                    <View style={styles.colorBlob1} />
                    <View style={styles.colorBlob2} />
                    <View style={styles.colorBlob3} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.mainTitle}>Perfil de Usuario</Text>
                <Text style={styles.subtitle}>Tus datos registrados</Text>

                <View style={styles.profileCard}>
                    <View style={styles.infoSection}>
                        <MaterialIcons name="person" size={24} color="#FE7F2D" style={styles.icon} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Nombre completo</Text>
                            <Text style={styles.infoValue}>{userData.nombre || 'No especificado'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <MaterialIcons name="person-outline" size={24} color="#FE7F2D" style={styles.icon} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Nombre de usuario</Text>
                            <Text style={styles.infoValue}>{userData.username || 'No especificado'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <MaterialIcons name="email" size={24} color="#FE7F2D" style={styles.icon} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Correo electrónico</Text>
                            <Text style={styles.infoValue}>{userData.correo || 'No especificado'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <MaterialIcons name="cake" size={24} color="#FE7F2D" style={styles.icon} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Edad</Text>
                            <Text style={styles.infoValue}>{userData.edad || 'No especificado'} años</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                    <MaterialIcons name="logout" size={20} color="#F5FBE6" />
                </TouchableOpacity>

                <View style={styles.decorativeElements}>
                    <View style={styles.decorativeLine} />
                    <Text style={styles.decorativeText}>👤</Text>
                    <View style={styles.decorativeLine} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#233D4D',
    },
    videoBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
    },
    animatedBackground: {
        flex: 1,
        backgroundColor: '#233D4D',
        overflow: 'hidden',
    },
    colorBlob1: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#215E61',
        opacity: 0.6,
    },
    colorBlob2: {
        position: 'absolute',
        bottom: -100,
        left: -50,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#FE7F2D',
        opacity: 0.4,
    },
    colorBlob3: {
        position: 'absolute',
        top: '40%',
        left: '20%',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#F5FBE6',
        opacity: 0.2,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 40,
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#F5FBE6',
        marginBottom: 10,
        letterSpacing: 1.5,
        textShadowColor: 'rgba(254, 127, 45, 0.7)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#FE7F2D',
        marginBottom: 30,
        fontWeight: "500",
    },
    profileCard: {
        backgroundColor: 'rgba(35, 61, 77, 0.85)',
        borderRadius: 20,
        padding: 25,
        borderWidth: 2,
        borderColor: '#215E61',
        shadowColor: '#FE7F2D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 30,
    },
    infoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(245, 251, 230, 0.1)',
    },
    icon: {
        marginRight: 15,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#A0B3A8',
        marginBottom: 5,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 18,
        color: '#F5FBE6',
        fontWeight: '500',
    },
    logoutButton: {
        backgroundColor: '#215E61',
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 30,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginBottom: 20,
        shadowColor: '#FE7F2D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F5FBE6',
        marginRight: 10,
    },
    loadingText: {
        color: '#F5FBE6',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    errorText: {
        color: '#FE7F2D',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#FE7F2D',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 25,
    },
    loginButtonText: {
        color: '#233D4D',
        fontSize: 16,
        fontWeight: 'bold',
    },
    decorativeElements: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 15,
    },
    decorativeLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#215E61',
    },
    decorativeText: {
        color: '#F5FBE6',
        fontSize: 24,
        marginHorizontal: 15,
    },
});