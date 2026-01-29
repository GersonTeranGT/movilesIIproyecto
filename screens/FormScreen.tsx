import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, Vibration, View, Image, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { supabase } from '../service/supabase/config'
import AlertPersonalizado from '../components/AlertPersonalizado'
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';

export default function FormScreen({ navigation }: any) {
  const [nombre, setNombre] = useState("")
  const [edad, setEdad] = useState(0)
  const [correo, setCorreo] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  //funcion para seleccionar imagen de galeria
  const seleccionarDeGaleria = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      mostrarAlerta("Permiso requerido", "Se requiere permiso para acceder a la galería.", 'error');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1], //cuadrado
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  //funcion para tomar foto con camara
  const tomarFoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!cameraPermission.granted || !mediaPermission.granted) {
      mostrarAlerta("Permisos requeridos", "Se requieren permisos de cámara y almacenamiento", 'error');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  //subir imagen a storage
  const subirImagen = async (uid: string): Promise<string | null> => {
    if (!image) return null;

    try {
      const file = new File(image);
      const matrizBits = await file.bytes();
      
      //usamos el uid del usuario como nombre del archivo
      const fileName = `avatar_${uid}.png`;
      const filePath = `avatar/${fileName}`;
      
      const { data, error } = await supabase
        .storage
        .from('users')
        .upload(filePath, matrizBits, {
          contentType: 'image/png',
          upsert: true //sobreescribir si ya existe
        });

      if (error) {
        console.error('Error subiendo imagen:', error);
        return null;
      }

      //obtenems la url publicca
      const { data: urlData } = supabase.storage
        .from('users')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
      
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  async function guardarUsuario() {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: password,
    })

    if (data.user != null) {
      //quitamos los guiones del id para evitar problemas con la base de datos
      let id = data.user.id.replace(/-/g, "") //expresion que quita todos los guiones

      //pasamos limpio id a registrarUser
      await registrarUser(id, username)

      //mover la navegacion dentro del bloque de exito de registrarUser
      //la navegacion se hara en registrarUser despuus de mostrar la alerta
    } else {
      setLoading(false);
      mostrarAlerta("Error", error?.message || "Error al crear usuario", 'error');
    }
  }

  async function registrarUser(uid: string, username: string) {
    try {
      console.log("ID a insertar:", uid);     //depuracion

      // 1. subir imagen si existe
      let avatarUrl = null;
      if (image) {
        avatarUrl = await subirImagen(uid);
      }

      // 2. guardar usuario en la tabla
      const { error } = await supabase
        .from('users')
        .insert({
          id: uid,  //usamos el id limpio
          username: username,
          nombre: nombre,
          edad: edad,
          correo: correo,
          avatar_url: avatarUrl, // agregar url de la imagen
        });

      if (error) {
        console.error("Error Supabase:", error);    //depuracion
        setLoading(false);
        mostrarAlerta("Error", `No se pudo registrar: ${error.message}`, 'error');
      } else {
        setLoading(false);
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
      console.error("Error catch:", error);   //depuracion
      setLoading(false);
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

    //validaciones
    if (!correo || !password || !username || !nombre) {
      mostrarAlerta(
        "Campos incompletos",
        "Por favor completa todos los campos.",
        'warning'
      );
      return;
    }

    //validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      mostrarAlerta(
        "Email inválido",
        "Por favor ingresa un email válido.",
        'warning'
      );
      return;
    }

    //validar contraseña minima
    if (password.length < 6) {
      mostrarAlerta(
        "Contraseña débil",
        "La contraseña debe tener al menos 6 caracteres.",
        'warning'
      );
      return;
    }

    guardarUsuario()
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

        {/**seccion de imagen de perfil*/}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>Foto</Text>
              </View>
            )}
          </View>
          
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={seleccionarDeGaleria}
              activeOpacity={0.7}
            >
              <Text style={styles.imageButtonText}>Galería</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={tomarFoto}
              activeOpacity={0.7}
            >
              <Text style={styles.imageButtonText}>Cámara</Text>
            </TouchableOpacity>
          </View>
          
          {image && (
            <TouchableOpacity 
              style={styles.removeImageButton} 
              onPress={() => setImage(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.removeImageButtonText}>❌ Eliminar foto</Text>
            </TouchableOpacity>
          )}
        </View>

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
          style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          activeOpacity={0.8}
          onPress={() => register()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#233D4D" size="small" />
          ) : (
            <>
              <Text style={styles.registerButtonText}>COMENZAR AVENTURA</Text>
              <View style={styles.buttonGlow} />
            </>
          )}
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
          type={'info'}
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
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#F5FBE6',
    marginTop: 40,
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
    marginBottom: 20,
    fontWeight: "500",
  },
  // Estilos para la sección de avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarContainer: {
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FE7F2D',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 251, 230, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#215E61',
    borderStyle: 'dashed',
  },
  avatarPlaceholderText: {
    fontSize: 16,
    color: '#A0B3A8',
    fontWeight: '600',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: '#215E61',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FE7F2D',
  },
  imageButtonText: {
    color: '#F5FBE6',
    fontWeight: '600',
    fontSize: 14,
  },
  removeImageButton: {
    backgroundColor: 'rgba(254, 127, 45, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FE7F2D',
  },
  removeImageButtonText: {
    color: '#FE7F2D',
    fontWeight: '600',
    fontSize: 12,
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
    paddingVertical: 16,
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
  registerButtonDisabled: {
    backgroundColor: '#A0B3A8',
    opacity: 0.7,
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