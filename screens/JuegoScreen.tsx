// screens/JuegoScreen.tsx (renombrar a MenuScreen.tsx o modificar)
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';

export default function JuegoScreen({ navigation, route }: any) {
  // Obtener nombre de usuario del login
  const nombreUsuario = route.params?.nombreUsuario || 'Jugador';

  const iniciarJuego = () => {
    navigation.navigate('GameScreen', { nombreUsuario });
  };

  const verPuntuaciones = () => {
    navigation.navigate('Puntuaciones');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🦗 CAZA INSECTOS 🐞</Text>
      
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>¡Bienvenido,</Text>
        <Text style={styles.userName}>{nombreUsuario}!</Text>
      </View>
      
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>📋 INSTRUCCIONES:</Text>
        <Text style={styles.instruction}>• Toca los insectos para ganar puntos</Text>
        <Text style={styles.instruction}>• Tienes 60 segundos por partida</Text>
        <Text style={styles.instruction}>• Cada insecto vale 10 puntos</Text>
        <Text style={styles.instruction}>• ¡No dejes que se escapen!</Text>
        <Text style={styles.instruction}>• Pausa el juego si necesitas un descanso</Text>
      </View>
      
      <TouchableOpacity
        style={styles.startButton}
        onPress={iniciarJuego}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>🎮 EMPEZAR JUEGO</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.scoresButton}
        onPress={verPuntuaciones}
        activeOpacity={0.8}
      >
        <Text style={styles.scoresButtonText}>🏆 VER PUNTUACIONES</Text>
      </TouchableOpacity>
      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#233D4D',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FE7F2D',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 20,
    color: '#F5FBE6',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FE7F2D',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(44, 74, 94, 0.8)',
    padding: 25,
    borderRadius: 15,
    width: '100%',
    marginBottom: 40,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FE7F2D',
    marginBottom: 15,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#F5FBE6',
    marginBottom: 10,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#FE7F2D',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  scoresButton: {
    backgroundColor: '#2C4A5E',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#FE7F2D',
  },
  scoresButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  footerText: {
    color: '#A0B3A8',
    fontSize: 14,
    marginTop: 'auto',
    textAlign: 'center',
  },
});