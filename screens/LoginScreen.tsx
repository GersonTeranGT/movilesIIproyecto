import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AlertPersonalizado from '../components/AlertPersonalizado'
import { supabase } from '../service/supabase/config'
//Biometria
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ navigation }: any) {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    revisarBiometria()
  }, [])
  
  //estados para el modal de alerta personalizado
  const [showAlert, setShowAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState("")
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState("success")

  //mostraAlerta personalizada
  const mostrarAlerta = (titulo: string, mensaje: string, tipo = 'success') => {
    setAlertTitle(titulo)
    setAlertMessage(mensaje)
    setAlertType(tipo)
    setShowAlert(true)
    Vibration.vibrate(100)
  }

  async function login() {
    if (username.trim() === '') {
      mostrarAlerta("Campo vacío", "Por favor ingresa tu nombre de usuario", 'warning')
      return
    }

    if (password.trim() === '') {
      mostrarAlerta("Campo vacío", "Por favor ingresa tu contraseña", 'warning')
      return
    }

    try {
      //paso 1: buscamos el email asociado al username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('correo')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        mostrarAlerta("Error", "Usuario no encontrado", 'error');
        return;
      }

      //paso 2: hacer login con el email encontrado
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userData.correo,
        password: password,
      });

      console.log("Auth data:", authData);
      console.log("Auth error:", authError);

      if (authError) {
        mostrarAlerta("Error", "Contraseña incorrecta", 'error');
        return;
      }

      if (authData.session != null) {
        mostrarAlerta("¡Bienvenido!", `Has iniciado sesión, bienvenido de nuevo: ${username}`, 'success');
        
        // CORRECCIÓN: Usar authData en lugar de data
        // Guardar el access_token en SecureStore
        await loginExitoso(authData.session.access_token);
      }

    } catch (error) {
      console.error("Login error:", error);
      mostrarAlerta("Error", "Ocurrió un error al iniciar sesión", 'error');
    }
  }

  //funcion para cerrar el alert
  const cierreAlerta = () => {
    setShowAlert(false);

    //navegar si el login fue exitoso
    if (alertType === 'success') {
      navigation.navigate("Tab");
    }
  }

  async function biometria(){
    const authResultado = await LocalAuthentication.authenticateAsync({
      promptMessage: "Iniciar con biometria"
    })
    if (authResultado.success){
      console.log("Login Exitoso con biometría");
      //si biometria es exitosa verificar el token y navegar
      const tokenValido = await verificarToken();
      if (tokenValido) {
        navigation.navigate("Tab");
      } else {
        mostrarAlerta("Error", "Sesión expirada. Por favor inicia sesión con tus credenciales nuevamente.", 'error');
      }
    } else {
      mostrarAlerta("Error", "Autenticación biométrica fallida", 'error');
    }
  }

  //1. guardar token al hacer login exitoso
  async function loginExitoso(accessToken: string){
    try {
      await SecureStore.setItemAsync("access_token", accessToken);
      console.log("Token guardado exitosamente");
    } catch (error) {
      console.error("Error al guardar token:", error);
    }
  }

  //3. verifica si el token es valido
  async function verificarToken() {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        return false;
      }
      
      //verificamos con supabase si el token es valido
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        //token invalido o expirado
        await SecureStore.deleteItemAsync('access_token');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error al verificar token:", error);
      return false;
    }
  }

  //2. revisar biometria al cargar la pantalla
  async function revisarBiometria(){
    try {
      //verificar si hay un lector de huella digital antes de perdir biometria
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!compatible || !enrolled) {
        console.log("Biometría no disponible o no configurada");
        return;
      }
      
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        console.log("No hay token guardado");
        return;
      }
      
      //verificamos si el token es valido amntes de pedir la biometria
      const tokenValido = await verificarToken();
      if (tokenValido) {
        console.log("Token válido, solicitando biometría...");
        //podemos pedir biometria automaticamente o mostrar un boton
        //biometria();
      } else {
        console.log("Token inválido o expirado");
        await SecureStore.deleteItemAsync('access_token');
      }
    } catch (error) {
      console.error("Error en revisarBiometria:", error);
    }
  }

  return (
    <View style={styles.container}>
      {/**fondo de la pantalla*/}
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
        keyboardShouldPersistTaps="handled"
      >
        {/**titulo y subtitulo*/}
        <Text style={styles.mainTitle}>Login</Text>
        <Text style={styles.subtitle}>Ingresa tus datos para empezar</Text>

        {/**contenedros de inputs*/}
        <View style={styles.inputsContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Nombre de usuario</Text>
            <TextInput
              placeholder='Nombre de usuario'
              placeholderTextColor="#A0B3A8"
              style={styles.textInput}
              onChangeText={(texto) => setUsername(texto)}
            />
            <View style={styles.inputUnderline} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              placeholder='Contraseña'
              placeholderTextColor="#A0B3A8"
              secureTextEntry={true}
              style={styles.textInput}
              onChangeText={(texto) => setPassword(texto)}
            />
            <View style={styles.inputUnderline} />
          </View>
        </View>
        
        {/**boton para ingresar*/}
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.8}
          onPress={() => login()}
        >
          <Text style={styles.loginButtonText}>INGRESAR</Text>
        </TouchableOpacity>
        <Text style={styles.decorativeText}>o</Text>
        {/**boton para biometría (opcional)*/}
        <TouchableOpacity
          style={styles.biometricButton}
          activeOpacity={0.8}
          onPress={() => biometria()}
        >
          <Text style={styles.biometricButtonText}>Ingresar con huella</Text>
        </TouchableOpacity>

        {/**decoracion*/}
        <View style={styles.decorativeElements}>
          <View style={styles.decorativeLine} />
          <Text style={styles.decorativeText}>⚔️</Text>
          <View style={styles.decorativeLine} />
        </View>
        
        {/**texto adicional*/}
        <Text style={styles.footerText}>
          Al iniciar sesión, aceptas los términos y condiciones del juego
        </Text>
      </ScrollView>

      {/**alertPersonalizado */}
      <AlertPersonalizado
        visible={showAlert}
        onClose={cierreAlerta}
        title={alertTitle}
        message={alertMessage}
        type={'info'}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#233D4D',
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  formContainer: {
    backgroundColor: 'rgba(35, 61, 77, 0.85)',
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: '#215E61',
    shadowColor: '#FE7F2D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
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
    fontWeight: '500',
  },
  inputsContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#F5FBE6',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: 'rgba(245, 251, 230, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F5FBE6',
    borderWidth: 1,
    borderColor: 'rgba(33, 94, 97, 0.5)',
  },
  inputUnderline: {
    height: 2,
    backgroundColor: '#FE7F2D',
    marginTop: 5,
    width: '100%',
    borderRadius: 1,
  },
  loginButton: {
    backgroundColor: '#FE7F2D',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#FE7F2D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#233D4D',
    letterSpacing: 1,
  },
  buttonGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(254, 127, 45, 0.3)',
    borderRadius: 20,
    zIndex: -1,
  },
  registerLink: {
    alignItems: 'center',
    marginBottom: 15,
  },
  registerLinkText: {
    fontSize: 14,
    color: '#F5FBE6',
    textDecorationLine: 'underline',
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
  footerText: {
    fontSize: 12,
    color: '#A0B3A8',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
    marginBottom: 10,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: -5,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#FE7F2D',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  biometricButton: {
    backgroundColor: '#2D5B6B',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  biometricButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
})