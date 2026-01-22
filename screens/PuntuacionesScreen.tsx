import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../service/supabase/config';
import { ref, onValue, query, orderByChild, limitToLast } from "firebase/database";
import { db } from '../firebase/Config';

export default function PuntuacionesScreen({ navigation }: any) {
  const [puntuaciones, setPuntuaciones] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [combinedData, setCombinedData] = useState<any[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Cargar datos en paralelo
      await Promise.all([
        loadUsersFromSupabase(),
        loadScoresFromFirebase()
      ]);

      // Combinar los datos después de cargar ambos
      combineData();
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsersFromSupabase = async () => {
    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id.replace(/-/g, ""))
          .single();

        if (userData && !userError) {
          setCurrentUser(userData);
        }
      }

      // Obtener todos los usuarios
      const { data: allUsers, error: allError } = await supabase
        .from('users')
        .select('id, username, nombre')
        .order('username', { ascending: true });

      if (allUsers && !allError) {
        setUsers(allUsers);
        return allUsers;
      }
    } catch (error) {
      console.error("Error cargando usuarios de Supabase:", error);
    }
    return [];
  };

  const loadScoresFromFirebase = () => {
    return new Promise((resolve) => {
      const puntuacionesRef = ref(db, 'puntuaciones/');
      const consulta = query(puntuacionesRef, orderByChild('puntuacion'), limitToLast(50));

      onValue(consulta, (snapshot) => {
        const data = snapshot.val();

        if (data) {
          // Convertir objeto a array
          let arrayData: any[] = Object.keys(data).map(id => ({
            id, ...data[id]
          }));

          // Ordenar por puntuación descendente
          arrayData.sort((a, b) => b.puntuacion - a.puntuacion);

          setPuntuaciones(arrayData);
          resolve(arrayData);
        } else {
          setPuntuaciones([]);
          resolve([]);
        }
      }, (error) => {
        console.error('Error leyendo puntuaciones de Firebase:', error);
        setPuntuaciones([]);
        resolve([]);
      });
    });
  };

  const combineData = () => {
    if (puntuaciones.length === 0 || users.length === 0) {
      setCombinedData([]);
      return;
    }

    // Crear un mapa de usuarios por username
    const usersMap = new Map();
    users.forEach(user => {
      usersMap.set(user.username, {
        nombre: user.username,
        id: user.id
      });
    });

    // Combinar datos
    const combined = puntuaciones.map(puntuacion => {
      const usuario = puntuacion.usuario;
      const userInfo = usersMap.get(usuario) || { nombre: usuario, id: null };

      return {
        ...puntuacion,
        nombreCompleto: userInfo.nombre || usuario,
        userId: userInfo.id,
        esUsuarioActual: currentUser && currentUser.username === usuario
      };
    });

    // Ordenar por puntuación descendente
    combined.sort((a, b) => b.puntuacion - a.puntuacion);
    setCombinedData(combined);
  };

  useEffect(() => {
    if (puntuaciones.length > 0 && users.length > 0) {
      combineData();
    }
  }, [puntuaciones, users, currentUser]);

  const formatearFecha = (fechaISO: string) => {
    try {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Fecha desconocida';
    }
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <View style={[
      styles.puntuacionItem,
      index < 3 && styles.topTres,
      item.esUsuarioActual && styles.currentUserItem
    ]}>
      <View style={styles.posicionContainer}>
        <Text style={styles.posicion}>#{index + 1}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.usuario} numberOfLines={1}>
          {item.nombreCompleto || item.usuario}
        </Text>
        <Text style={styles.fecha}>
          {formatearFecha(item.fecha)}
        </Text>
      </View>

      <View style={styles.puntosContainer}>
        <Text style={styles.puntos}>{item.puntuacion}</Text>
        <Text style={styles.puntosLabel}>pts</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>🏆 MEJORES PUNTUACIONES</Text>
          <Text style={styles.subtitulo}>
            Cargando información...
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FE7F2D" />
          <Text style={styles.loadingText}>Cargando puntuaciones...</Text>
        </View>
      </View>
    );
  }

  const displayData = combinedData.length > 0 ? combinedData : puntuaciones;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>🏆 MEJORES PUNTUACIONES</Text>
        <Text style={styles.subtitulo}>
          {currentUser
            ? `Tú eres: ${currentUser.username}`
            : 'Inicia sesión para ver tu perfil'}
        </Text>
        <Text style={styles.subtitulo}>
          Total: {displayData.length} puntuaciones
        </Text>
      </View>

      {displayData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📭 No hay puntuaciones aún</Text>
          <Text style={styles.emptySubtext}>
            ¡Sé el primero en jugar!
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>← VOLVER</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={loadAllData}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>🔄 ACTUALIZAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#233D4D',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: '#2C4A5E',
    borderBottomWidth: 2,
    borderBottomColor: '#FE7F2D',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FE7F2D',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: '#A0B3A8',
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#A0B3A8',
    fontSize: 16,
    marginTop: 15,
  },
  listContent: {
    padding: 15,
    paddingBottom: 20,
  },
  puntuacionItem: {
    flexDirection: 'row',
    backgroundColor: '#2C4A5E',
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  topTres: {
    backgroundColor: 'rgba(254, 127, 45, 0.1)',
    borderWidth: 1,
    borderColor: '#FE7F2D',
  },
  currentUserItem: {
    backgroundColor: 'rgba(33, 94, 97, 0.3)',
    borderWidth: 2,
    borderColor: '#215E61',
  },
  posicionContainer: {
    width: 50,
    alignItems: 'center',
  },
  posicion: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F5FBE6',
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  usuario: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F5FBE6',
    marginBottom: 4,
  },
  fecha: {
    fontSize: 12,
    color: '#A0B3A8',
  },
  puntosContainer: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  puntos: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FE7F2D',
  },
  puntosLabel: {
    fontSize: 12,
    color: '#A0B3A8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    color: '#A0B3A8',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#7A8D8A',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#2C4A5E',
    borderTopWidth: 2,
    borderTopColor: '#FE7F2D',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#233D4D',
    borderWidth: 1,
    borderColor: '#FE7F2D',
  },
  refreshButton: {
    backgroundColor: '#FE7F2D',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});