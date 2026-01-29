import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Modal, Pressable, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../service/supabase/config';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';

export default function UserScreen({ navigation }: any) {
    //estados para los datos del usuario
    const [nombre, setNombre] = useState("");
    const [username, setUsername] = useState("");
    const [correo, setCorreo] = useState("");
    const [edad, setEdad] = useState<number | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [userId, setUserId] = useState("");

    //estados para control
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    //estados para datos originales (para comparar cambios)
    const [originalNombre, setOriginalNombre] = useState("");
    const [originalUsername, setOriginalUsername] = useState("");
    const [originalEdad, setOriginalEdad] = useState<number | null>(null);

    useEffect(() => {
        loadUserData();
    }, []);

    //verificamos si hay cambios
    const hasChanges =
        nombre !== originalNombre ||
        username !== originalUsername ||
        edad !== originalEdad;

    const loadUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                //guardar userId sin guiones para el nombre del archivo
                setUserId(user.id.replace(/-/g, ""));

                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id.replace(/-/g, ""))  //buscamos sin guiomnes
                    .single();

                if (data && !error) {
                    setNombre(data.nombre || "");
                    setUsername(data.username || "");
                    setCorreo(data.correo || "");
                    setEdad(data.edad || null);

                    //timestamp aleatorio para evitar cache
                    if (data.avatar_url) {
                        const cacheBuster = `?t=${Date.now()}`;
                        setAvatarUrl(data.avatar_url + cacheBuster);
                    } else {
                        setAvatarUrl(null);
                    }

                    setOriginalNombre(data.nombre || "");
                    setOriginalUsername(data.username || "");
                    setOriginalEdad(data.edad || null);
                }
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    //funcion para subir/actualizar imagen
    const subirImagen = async (imageUri: string) => {
        if (!userId) return;

        setUploading(true);
        try {
            const file = new File(imageUri);
            const matrizBits = await file.bytes();

            //nombre de archivo simple pero constante
            const fileName = `avatar_${userId}.png`;
            const filePath = `avatar/${fileName}`;

            console.log('Subiendo a:', filePath);

            //subir con upsert: true para reemplazar
            const { error: uploadError } = await supabase
                .storage
                .from('users')
                .upload(filePath, matrizBits, {
                    contentType: 'image/png',
                    upsert: true //true para reemplazar
                });

            if (uploadError) {
                throw uploadError;
            }

            //obtener url publica
            const { data: urlData } = supabase.storage
                .from('users')
                .getPublicUrl(filePath);

            //actualizar la base con la url SIN parametros de cache
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    avatar_url: urlData.publicUrl
                })
                .eq('id', userId.replace(/-/g, ""));

            if (updateError) {
                throw updateError;
            }

            //actualizar estado local con parametro de cache para forzar recarga
            const newUrlWithCacheBust = `${urlData.publicUrl}?t=${Date.now()}`;
            setAvatarUrl(newUrlWithCacheBust);

            console.log('Nueva URL guardada:', urlData.publicUrl);
            console.log('URL con cache bust:', newUrlWithCacheBust);

            Alert.alert('✅ Éxito', 'Foto de perfil actualizada');

        } catch (error: any) {
            console.error('Error subiendo imagen:', error);
            Alert.alert('❌ Error', error.message || 'Error al actualizar la foto');
        } finally {
            setUploading(false);
            setShowImageOptions(false);
        }
    };

    //funcion para eliminar imagen
    const eliminarImagen = async () => {
        if (!userId || !avatarUrl) return;

        try {
            //1. extraer nombre del archivo correctammente
            const urlParts = avatarUrl.split('/');
            const fileNameWithParams = urlParts[urlParts.length - 1];
            const fileName = fileNameWithParams.split('?')[0]; //solo el nombre del archivo
            const filePath = `avatar/${fileName}`;

            console.log('Eliminando archivo path:', filePath); //depuracion

            //2. eliminar del storage
            const { error: storageError } = await supabase
                .storage
                .from('users')
                .remove([filePath]);

            if (storageError) {
                console.log('Error eliminando de storage:', storageError);
                //continuar para actualizar la BD aunque falle en storage -----ojoxd
            }

            //3. actualizar la BD para eliminar la url (sin updated_at)
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    avatar_url: null
                })
                .eq('id', userId.replace(/-/g, ""));

            if (updateError) {
                throw updateError;
            }

            //4. actualizar estado local
            setAvatarUrl(null);

            Alert.alert('✅ Éxito', 'Foto de perfil eliminada');

        } catch (error: any) {
            console.error('Error eliminando imagen:', error);
            Alert.alert('❌ Error', error.message || 'Error al eliminar la foto');
        } finally {
            setShowImageOptions(false);
        }
    };

    //seleccionar imagen de galeria
    const seleccionarDeGaleria = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permiso requerido', 'Se requiere permiso para acceder a la galería.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            await subirImagen(result.assets[0].uri);
        }
    };

    //tomar foto con camara
    const tomarFoto = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!cameraPermission.granted || !mediaPermission.granted) {
            Alert.alert('Permisos requeridos', 'Se requieren permisos de cámara y almacenamiento');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            await subirImagen(result.assets[0].uri);
        }
    };

    //funcion para guardar cambios
    const guardarCambios = async () => {
        if (!userId || !hasChanges) return;

        setSaving(true);
        try {
            //validaciones
            if (!nombre.trim()) {
                Alert.alert('Error', 'El nombre no puede estar vacío');
                setSaving(false);
                return;
            }

            if (!username.trim()) {
                Alert.alert('Error', 'El nombre de usuario no puede estar vacío');
                setSaving(false);
                return;
            }

            if (edad !== null && (edad < 0 || edad > 120)) {
                Alert.alert('Error', 'La edad debe ser un valor válido (0-120)');
                setSaving(false);
                return;
            }

            //actualizar en supa
            const { error } = await supabase
                .from('users')
                .update({
                    nombre: nombre,
                    username: username,
                    edad: edad
                })
                .eq('id', userId);

            if (error) {
                throw error;
            }

            //actualizar datos originales
            setOriginalNombre(nombre);
            setOriginalUsername(username);
            setOriginalEdad(edad);
            setIsEditing(false);

            Alert.alert('✅ Éxito', 'Perfil actualizado correctamente');

        } catch (error: any) {
            console.error('Error actualizando perfil:', error);
            Alert.alert('❌ Error', error.message || 'Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    //funci0n para cancelar la edicion
    const cancelarEdicion = () => {
        setNombre(originalNombre);
        setUsername(originalUsername);
        setEdad(originalEdad);
        setIsEditing(false);
    };

    //modal de opciones para la imagen
    const ImageOptionsModal = () => (
        <Modal
            transparent={true}
            visible={showImageOptions}
            animationType="fade"
            onRequestClose={() => setShowImageOptions(false)}
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowImageOptions(false)}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Opciones de Foto</Text>

                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={seleccionarDeGaleria}
                        disabled={uploading}
                    >
                        <MaterialIcons name="photo-library" size={24} color="#FE7F2D" />
                        <Text style={styles.modalOptionText}>Elegir de galería</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={tomarFoto}
                        disabled={uploading}
                    >
                        <MaterialIcons name="photo-camera" size={24} color="#FE7F2D" />
                        <Text style={styles.modalOptionText}>Tomar foto</Text>
                    </TouchableOpacity>

                    {avatarUrl && (
                        <TouchableOpacity
                            style={[styles.modalOption, styles.deleteOption]}
                            onPress={eliminarImagen}
                            disabled={uploading}
                        >
                            <MaterialIcons name="delete" size={24} color="#FF4444" />
                            <Text style={[styles.modalOptionText, styles.deleteOptionText]}>Eliminar foto</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.modalCancel}
                        onPress={() => setShowImageOptions(false)}
                    >
                        <Text style={styles.modalCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );

    const handleLogout = async () => {
        await supabase.auth.signOut();
        await SecureStore.deleteItemAsync('token');
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

    if (!userId) {
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
    console.log('Avatar URL actual:', avatarUrl);
    console.log('UserId:', userId);
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
                <View style={styles.header}>
                    <Text style={styles.mainTitle}>Perfil de Usuario</Text>
                    <Text style={styles.subtitle}>Tus datos registrados</Text>

                    {/**boton de editar/guardar/cancelar*/}
                    <View style={styles.editActions}>
                        {isEditing ? (
                            <>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.saveButton, (!hasChanges || saving) && styles.disabledButton]}
                                    onPress={guardarCambios}
                                    disabled={!hasChanges || saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#233D4D" />
                                    ) : (
                                        <>
                                            <MaterialIcons name="save" size={18} color="#233D4D" />
                                            <Text style={styles.saveButtonText}>Guardar</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.cancelButton]}
                                    onPress={cancelarEdicion}
                                    disabled={saving}
                                >
                                    <MaterialIcons name="close" size={18} color="#F5FBE6" />
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.editButton]}
                                onPress={() => setIsEditing(true)}
                            >
                                <MaterialIcons name="edit" size={18} color="#233D4D" />
                                <Text style={styles.editButtonText}>Editar Perfil</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/**seccion de foto de perfil*/}
                <View style={styles.avatarSection}>
                    <TouchableOpacity
                        onPress={() => setShowImageOptions(true)}
                        disabled={uploading}
                        style={styles.avatarTouchable}
                    >
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={styles.avatarImage}
                                resizeMode="cover"
                                key={avatarUrl} // Esto fuerza recrear la imagen cuando cambia la URL
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <MaterialIcons name="person" size={60} color="#A0B3A8" />
                                <Text style={styles.avatarPlaceholderText}>Sin foto</Text>
                            </View>
                        )}

                        {uploading && (
                            <View style={styles.avatarOverlay}>
                                <ActivityIndicator size="large" color="#FE7F2D" />
                            </View>
                        )}

                        <View style={styles.editAvatarButton}>
                            <MaterialIcons name={uploading ? "hourglass-empty" : "edit"} size={20} color="#233D4D" />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.avatarInstruction}>
                        Toca la foto para cambiarla
                    </Text>
                </View>

                {/*informacion del usuario*/}
                <View style={styles.profileCard}>
                    {/*nombre completo - editable*/}
                    <View style={styles.infoSection}>
                        <MaterialIcons name="person" size={24} color="#FE7F2D" style={styles.icon} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Nombre completo</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.editableInput, isEditing && styles.editableInputActive]}
                                    value={nombre}
                                    onChangeText={setNombre}
                                    placeholder="Tu nombre"
                                    placeholderTextColor="#A0B3A8"
                                    editable={!saving}
                                />
                            ) : (
                                <Text style={styles.infoValue}>{nombre || 'No especificado'}</Text>
                            )}
                        </View>
                    </View>

                    {/*nombre de usuario - editable*/}
                    <View style={styles.infoSection}>
                        <MaterialIcons name="person-outline" size={24} color="#FE7F2D" style={styles.icon} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Nombre de usuario</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.editableInput, isEditing && styles.editableInputActive]}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Nombre de usuario"
                                    placeholderTextColor="#A0B3A8"
                                    editable={!saving}
                                    autoCapitalize="none"
                                />
                            ) : (
                                <Text style={styles.infoValue}>{username || 'No especificado'}</Text>
                            )}
                        </View>
                    </View>

                    {/*correo electronico solo lectura*/}
                    <View style={styles.infoSection}>
                        <MaterialIcons name="email" size={24} color="#FE7F2D" style={styles.icon} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Correo electrónico</Text>
                            <Text style={styles.infoValue}>{correo || 'No especificado'}</Text>
                        </View>
                    </View>

                    {/*edad - editable*/}
                    <View style={styles.infoSection}>
                        <MaterialIcons name="cake" size={24} color="#FE7F2D" style={styles.icon} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Edad</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.editableInput, isEditing && styles.editableInputActive]}
                                    value={edad !== null ? edad.toString() : ''}
                                    onChangeText={(texto) => {
                                        if (texto === '') {
                                            setEdad(null);
                                        } else {
                                            setEdad(+texto);
                                        }
                                    }}
                                    placeholder="Tu edad (opcional)"
                                    placeholderTextColor="#A0B3A8"
                                    keyboardType="numeric"
                                    editable={!saving}
                                />
                            ) : (
                                <Text style={styles.infoValue}>
                                    {edad !== null ? `${edad} años` : 'No especificado'}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/*id del usuario solo lectura*/}
                    <View style={styles.infoSection}>
                        <MaterialIcons name="fingerprint" size={24} color="#FE7F2D" style={styles.icon} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>ID de usuario</Text>
                            <Text style={[styles.infoValue, styles.idText]} numberOfLines={1} ellipsizeMode="middle">
                                {userId}
                            </Text>
                        </View>
                    </View>
                </View>

                {/*indicador de cambios*/}
                {hasChanges && isEditing && (
                    <View style={styles.changesIndicator}>
                        <MaterialIcons name="info" size={16} color="#FE7F2D" />
                        <Text style={styles.changesIndicatorText}>Tienes cambios sin guardar</Text>
                    </View>
                )}

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

            <ImageOptionsModal />
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
    header: {
        marginBottom: 20,
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
        marginBottom: 20,
        fontWeight: "500",
    },
    //botones de edicion
    editActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 120,
    },
    editButton: {
        backgroundColor: '#FE7F2D',
    },
    editButtonText: {
        color: '#233D4D',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    saveButtonText: {
        color: '#233D4D',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 14,
    },
    cancelButton: {
        backgroundColor: '#F44336',
    },
    cancelButtonText: {
        color: '#F5FBE6',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 14,
    },
    disabledButton: {
        opacity: 0.5,
    },
    //seccion de avatar
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarTouchable: {
        position: 'relative',
        marginBottom: 10,
    },
    avatarImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: '#FE7F2D',
    },
    avatarPlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(33, 94, 97, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#215E61',
        borderStyle: 'dashed',
    },
    avatarPlaceholderText: {
        color: '#A0B3A8',
        marginTop: 8,
        fontSize: 14,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#FE7F2D',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F5FBE6',
    },
    avatarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInstruction: {
        color: '#A0B3A8',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 5,
    },
    //tarjeta de perfil
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
        marginBottom: 20,
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
    //inputs editables
    editableInput: {
        fontSize: 18,
        color: '#F5FBE6',
        backgroundColor: 'rgba(245, 251, 230, 0.1)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    editableInputActive: {
        borderColor: '#FE7F2D',
        backgroundColor: 'rgba(254, 127, 45, 0.1)',
    },
    //id del usuario
    idText: {
        fontSize: 14,
        fontFamily: 'monospace',
        color: '#A0B3A8',
    },
    //indicador de cambios
    changesIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(254, 127, 45, 0.1)',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FE7F2D',
    },
    changesIndicatorText: {
        color: '#FE7F2D',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    //boton de logout
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
    //estilos para el modal de opciones
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#233D4D',
        borderRadius: 20,
        padding: 25,
        width: '85%',
        borderWidth: 2,
        borderColor: '#FE7F2D',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F5FBE6',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(33, 94, 97, 0.3)',
        borderRadius: 10,
        marginBottom: 12,
    },
    modalOptionText: {
        fontSize: 16,
        color: '#F5FBE6',
        marginLeft: 15,
        flex: 1,
    },
    deleteOption: {
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: '#FF4444',
    },
    deleteOptionText: {
        color: '#FF4444',
    },
    modalCancel: {
        marginTop: 10,
        paddingVertical: 12,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(245, 251, 230, 0.1)',
    },
    modalCancelText: {
        fontSize: 16,
        color: '#A0B3A8',
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
    //elementos decorativos
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