import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UserScreen({ navigation }: any) {
    // Datos de ejemplo (quemados)
    const usuario = {
        nombre: "Carlos Martínez",
        username: "carlos_gamer",
        edad: 25,
        correo: "carlos.martinez@email.com",
        fechaRegistro: "15/11/2024",
        puntuacionMaxima: 450,
        partidasJugadas: 18,
        nivel: "Experto",
        avatar: "👤"
    };

    return (
        <View style={styles.container}>
            {/* Fondo */}
            <View style={styles.videoBackground}>
                <View style={styles.animatedBackground}>
                    <View style={styles.colorBlob1} />
                    <View style={styles.colorBlob2} />
                    <View style={styles.colorBlob3} />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >

                {/* Título */}
                <Text style={styles.mainTitle}>👤 PERFIL DEL JUGADOR</Text>
                <Text style={styles.subtitle}>Tu información personal</Text>

                {/* Avatar/Círculo de usuario */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{usuario.avatar}</Text>
                    </View>
                    <Text style={styles.userName}>{usuario.nombre}</Text>
                    <Text style={styles.userUsername}>@{usuario.username}</Text>
                </View>

                {/* Tarjeta de información personal */}
                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>📋 Información Personal</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={20} color="#FE7F2D" />
                        <Text style={styles.infoLabel}>Nombre:</Text>
                        <Text style={styles.infoValue}>{usuario.nombre}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={20} color="#FE7F2D" />
                        <Text style={styles.infoLabel}>Edad:</Text>
                        <Text style={styles.infoValue}>{usuario.edad} años</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={20} color="#FE7F2D" />
                        <Text style={styles.infoLabel}>Correo:</Text>
                        <Text style={styles.infoValue}>{usuario.correo}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="at-circle-outline" size={20} color="#FE7F2D" />
                        <Text style={styles.infoLabel}>Usuario:</Text>
                        <Text style={styles.infoValue}>@{usuario.username}</Text>
                    </View>
                </View>

                {/* Tarjeta de estadísticas del juego */}
                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>🎮 Estadísticas de Juego</Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <View style={[styles.statCircle, { backgroundColor: 'rgba(254, 127, 45, 0.2)' }]}>
                                <Text style={styles.statNumber}>{usuario.puntuacionMaxima}</Text>
                            </View>
                            <Text style={styles.statLabel}>Puntuación Máxima</Text>
                        </View>

                        <View style={styles.statItem}>
                            <View style={[styles.statCircle, { backgroundColor: 'rgba(33, 94, 97, 0.2)' }]}>
                                <Text style={styles.statNumber}>{usuario.partidasJugadas}</Text>
                            </View>
                            <Text style={styles.statLabel}>Partidas Jugadas</Text>
                        </View>

                        <View style={styles.statItem}>
                            <View style={[styles.statCircle, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
                                <Text style={styles.statNumber}>{usuario.nivel}</Text>
                            </View>
                            <Text style={styles.statLabel}>Nivel</Text>
                        </View>
                    </View>
                </View>

                {/* Botones de acción */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        activeOpacity={0.8}
                        onPress={() => alert('Funcionalidad de editar pendiente')}
                    >
                        <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>EDITAR PERFIL</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.logoutButton]}
                        activeOpacity={0.8}
                        onPress={() => {
                            // Aquí iría la lógica de cerrar sesión
                            navigation.navigate('Login');
                        }}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>CERRAR SESIÓN</Text>
                    </TouchableOpacity>
                </View>

                {/* Texto decorativo */}
                <View style={styles.decorativeElements}>
                    <View style={styles.decorativeLine} />
                    <Text style={styles.decorativeText}>✦</Text>
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
        paddingTop: 60,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(44, 74, 94, 0.8)',
        borderRadius: 20,
        padding: 8,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#F5FBE6',
        marginTop: 10,
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
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(254, 127, 45, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 4,
        borderColor: '#F5FBE6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    avatarText: {
        fontSize: 60,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F5FBE6',
        marginBottom: 5,
    },
    userUsername: {
        fontSize: 16,
        color: '#A0B3A8',
        fontStyle: 'italic',
    },
    infoCard: {
        backgroundColor: 'rgba(44, 74, 94, 0.8)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(254, 127, 45, 0.3)',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FE7F2D',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(254, 127, 45, 0.3)',
        paddingBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 4,
    },
    infoLabel: {
        fontSize: 14,
        color: '#A0B3A8',
        marginLeft: 10,
        marginRight: 15,
        width: 120,
    },
    infoValue: {
        fontSize: 16,
        color: '#F5FBE6',
        fontWeight: '500',
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F5FBE6',
    },
    statLabel: {
        fontSize: 12,
        color: '#A0B3A8',
        textAlign: 'center',
    },
    actionsContainer: {
        marginTop: 10,
        marginBottom: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 12,
        marginBottom: 12,
    },
    editButton: {
        backgroundColor: '#FE7F2D',
    },
    logoutButton: {
        backgroundColor: '#FF5252',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    decorativeElements: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
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
    footerText: {
        fontSize: 12,
        color: '#A0B3A8',
        textAlign: 'center',
        marginBottom: 20,
        fontStyle: 'italic',
    },
});