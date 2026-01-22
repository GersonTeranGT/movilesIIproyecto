import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Vibration } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../service/supabase/config';

export default function JuegoScreen({ navigation }: any) {
  const [userName, setUserName] = useState('Jugador');
  const [loading, setLoading] = useState(true);

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

  const iniciarJuego = () => {
    navigation.navigate("Juego", { nombreUsuario: userName });
  };

  const verPuntuaciones = () => {
    navigation.navigate("Puntuacion");
    Vibration.vibrate(100);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <Text style={styles.title}>🦗CAZA INSECTOS🐞</Text>
        
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>¡Bienvenido,</Text>
          <Text style={styles.userName}>{userName}!</Text>
        </View>
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>📋 INSTRUCCIONES:</Text>
          <Text style={styles.instruction}>• Toca los insectos para ganar puntos</Text>
          <Text style={styles.instruction}>• Tienes 30 segundos por partida</Text>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#233D4D',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FE7F2D',
    marginBottom: 30,
    textShadowColor: 'rgba(254, 127, 45, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    color: '#F5FBE6',
    textAlign: 'center',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FE7F2D',
    textAlign: 'center',
    marginTop: 5,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(44, 74, 94, 0.8)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#215E61',
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
    paddingLeft: 10,
  },
  startButton: {
    backgroundColor: '#FE7F2D',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#FE7F2D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#233D4D',
    letterSpacing: 1,
  },
  scoresButton: {
    backgroundColor: '#215E61',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#FE7F2D',
  },
  scoresButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F5FBE6',
    letterSpacing: 1,
  },
});