import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native'
import React, { useState } from 'react'
import { supabase } from '../service/supabase/config'
import AlertPersonalizado from '../components/AlertPersonalizado'

export default function FormScreen({ navigation }: any) {

  const [nombre, setNombre] = useState("")
  const [edad, setEdad] = useState(0)
  const [correo, setCorreo] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)

  //estados para el modal de alerta personalizado
  const [showAlert, setShowAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState("")
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState("warning")


  //funcion mostrarAlerta
  const mostrarAlerta = (titulo: string, mensaje: string, tipo = "warning") => {
    setAlertTitle(titulo);
    setAlertMessage(mensaje);
    setAlertType(tipo);
    setShowAlert(true);
    Vibration.vibrate(100);
  }

  async function registrarUser() {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          nombre: nombre,
          edad: edad,
          correo: correo,
          username: username,
        });

      if (error) {
        mostrarAlerta("Error", `No se pudo registrar: ${error.message}`, 'error');
      } else {
        mostrarAlerta(
          "¡Registro Exitoso!",
          `Usuario: ${username}\nHa sido registrado correctamente.`,
          'success'
        );

        //navegar despues de dos segundos
        setTimeout(() => {
          navigation.navigate("Login");
        }, 2000);
      }
    } catch (error) {
      mostrarAlerta("Error", "Ocurrió un error inesperado", 'error');
    }
  }

  function register() {

    if (!acceptTerms) {
      mostrarAlerta(
        "Advertencia",
        "Debe aceptar los términos y condiciones.",
        'warning'
      );
      return;
    }
    // if (username.trim() === '' || password.trim() === '') {
    //   mostrarAlerta(
    //     "Campos incompletos", 
    //     "Por favor completa todos los campos.", 
    //     'warning'
    //   );
    //   return;
    // }
    registrarUser()
  }

  return (
    <View style={styles.container}>
      {/**fondo de la pantalla */}
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

        {/**titulos de la ventana*/}
        <Text style={styles.mainTitle}>Formulario de registro</Text>
        <Text style={styles.subtitle}>Ingresa tus datos!!!</Text>

        {/**contenedor de los inputs*/}
        <View style={styles.inputsContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.textInput}
              placeholder='Ingresa tu nombre'
              placeholderTextColor="#A0B3A8"
              value={nombre}
              onChangeText={(texto) => setNombre(texto)}
            />
            <View style={styles.inputUnderline} />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Edad</Text>
            <TextInput
              style={styles.textInput}
              placeholder='Ingresa tu edad'
              placeholderTextColor="#A0B3A8"
              value={edad.toString()}
              onChangeText={(texto) => setEdad(+texto)}
              keyboardType='numeric'
            />
            <View style={styles.inputUnderline} />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <TextInput
              style={styles.textInput}
              placeholder='Ingresa tu correo'
              placeholderTextColor="#A0B3A8"
              value={correo}
              onChangeText={(texto) => setCorreo(texto)}
              keyboardType='email-address'
            />
            <View style={styles.inputUnderline} />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Nombre de usuario</Text>
            <TextInput
              style={styles.textInput}
              placeholder='Crea tu nombre de usuario'
              placeholderTextColor="#A0B3A8"
              value={username}
              onChangeText={(texto) => setUsername(texto)}
            />
            <View style={styles.inputUnderline} />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.textInput}
              placeholder='Ingresa tu contraseña'
              placeholderTextColor="#A0B3A8"
              secureTextEntry={true}
              value={password}
              onChangeText={(texto) => setPassword(texto)}
            />
            <View style={styles.inputUnderline} />
          </View>
        </View>

        {/**switch para terminos y condidciones*/}
        <View style={styles.termsContainer}>
          <Switch
            value={acceptTerms}
            onValueChange={setAcceptTerms}
            trackColor={{ false: '#A0B3A8', true: '#FE7F2D' }}
            thumbColor={acceptTerms ? '#F5FBE6' : '#F5FBE6'}
            ios_backgroundColor="#A0B3A8"
            style={styles.termsSwitch}
          />
          <Text style={styles.termsText}>
            Acepto los{' '}
            <Text style={styles.termsLink}>términos y condiciones</Text>
          </Text>
        </View>

        {/**boton para registar se */}
        <TouchableOpacity
          style={styles.registerButton}
          activeOpacity={0.8}
          onPress={() => register()}
        >
          <Text style={styles.registerButtonText}>COMENZAR AVENTURA</Text>
          <View style={styles.buttonGlow} />
        </TouchableOpacity>

        {/*decoracion*/}
        <View style={styles.decorativeElements}>
          <View style={styles.decorativeLine} />
          <Text style={styles.decorativeText}>✦</Text>
          <View style={styles.decorativeLine} />
        </View>
        {/* Texto adicional */}
        <Text style={styles.footerText}>
          Al registrarte, aceptas los términos y condiciones del juego
        </Text>

        <AlertPersonalizado
          visible={showAlert}
          onClose={() => setShowAlert(false)}
          title={alertTitle}
          message={alertMessage}
          type={"info"}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#233D4D',
    justifyContent: 'center',
    alignItems: 'center'
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
  },
  formContainer: {
    backgroundColor: 'rgba(35, 61, 77, 0.85)',
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 20,
    marginVertical: 30,
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
    marginTop: 19,
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
    marginBottom: 16,
    fontWeight: "500",
  },
  inputsContainer: {
    width: "100%",
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  termsSwitch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
    marginRight: 12,
  },
  termsText: {
    fontSize: 14,
    color: '#F5FBE6',
    flex: 1,
    flexWrap: 'wrap',
  },
  termsLink: {
    color: '#FE7F2D',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: '#FE7F2D',
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#FE7F2D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
  },
  registerButtonText: {
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
    marginBottom: 60,
  },
})