import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native'
import React, { useState } from 'react'
import AlertPersonalizado from '../components/AlertPersonalizado'

export default function LoginScreen({ navigation }: any) {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")


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
  function login() {
    // if (username.trim() === '') {
    //   mostrarAlerta("Campo vacío", "Por favor ingresa tu nombre de usuario", 'warning')
    //   return
    // }
    //mostramos primero la alerta
    mostrarAlerta("¡Bienvenido!", `Has iniciado sesión, bienvenido de nuevo: ${username}`)

  }
  //funicon para cerrar el alert
  const cierreAlerta = () => {
    setShowAlert(false)

    //se navega si el login es verdadero o exitoso--- && username.trim() !== ''
    if (alertType === 'success') {
      navigation.navigate("Tab")
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
          />
          <View style={styles.inputUnderline} />
        </View>
      </View>
      {/**boton para inresar*/}
      <TouchableOpacity
        style={styles.loginButton}
        activeOpacity={0.8}
        onPress={() => login()}
      >
        <Text style={styles.loginButtonText}>INGRESAR</Text>
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
    zIndex: 1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FE7F2D',
    marginBottom: 30,
    fontWeight: '500',
    zIndex: 1,
  },
  inputsContainer: {
    width: '90%',
    marginBottom: 20,
    zIndex: 1,
  },
  inputWrapper: {
    marginBottom: 25,
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
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#FE7F2D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
    zIndex: 1,
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
    marginBottom: 20,
    zIndex: 1,
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
    marginVertical: 20,
    zIndex: 1,
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
    zIndex: 1,
  }
})