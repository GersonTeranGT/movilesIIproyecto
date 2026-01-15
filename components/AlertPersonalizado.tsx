import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'


interface Props {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: "warning" | "error" | "success" | "info";
}



export default function AlertPersonalizado({ visible, onClose, title, message, type = "warning" }: Props) {

    //dimensiones del telefono
    const { width, height } = Dimensions.get('window')

    const configAlert = {
        success: {
            icon: '✅',
            titleColor: '#4CAF50',
            buttonColor: '#4CAF50',
            buttonText: '¡Genial!',
            borderColor: '#4CAF50'
        },
        warning: {
            icon: '⚠️',
            titleColor: '#FE7F2D',
            buttonColor: '#FE7F2D',
            buttonText: 'OK',
            borderColor: '#FE7F2D'
        },
        error: {
            icon: '❌',
            titleColor: '#FF5252',
            buttonColor: '#FF5252',
            buttonText: 'Reintentar',
            borderColor: '#FF5252'
        },
        info: {
            icon: 'ℹ️',
            titleColor: '#2196F3',
            buttonColor: '#2196F3',
            buttonText: 'OK',
            borderColor: '#2196F3'
        }
    }

    const currentConfig = configAlert[type] || configAlert.warning;

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType='fade'
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[
                    styles.alertBox,
                    { borderColor: currentConfig.borderColor }
                ]}>
                    {/* Icono */}
                    <View style={styles.alertIcon}>
                        <Text style={styles.alertIconText}>
                            {currentConfig.icon}
                        </Text>
                    </View>

                    {/* Título */}
                    <Text style={[
                        styles.alertTitleText,
                        { color: currentConfig.titleColor }
                    ]}>
                        {title}
                    </Text>

                    {/* Mensaje */}
                    <Text style={styles.alertMessageText}>
                        {message}
                    </Text>

                    {/* Botón */}
                    <TouchableOpacity
                        style={[
                            styles.alertButton,
                            { backgroundColor: currentConfig.buttonColor }
                        ]}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.alertButtonText}>
                            {currentConfig.buttonText}
                        </Text>
                    </TouchableOpacity>

                    {/* Decoraciones de esquina */}
                    <View style={[styles.corner, styles.cornerTopLeft]} />
                    <View style={[styles.corner, styles.cornerTopRight]} />
                    <View style={[styles.corner, styles.cornerBottomLeft]} />
                    <View style={[styles.corner, styles.cornerBottomRight]} />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    alertBox: {
        backgroundColor: '#233D4D',
        borderRadius: 20,
        padding: 30,
        width: '85%',
        maxWidth: 400,
        alignItems: 'center',
        borderWidth: 3,
        shadowColor: '#FE7F2D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        position: 'relative',
    },
    alertIcon: {
        marginBottom: 15,
    },
    alertIconText: {
        fontSize: 50,
    },
    alertTitleText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    alertMessageText: {
        fontSize: 16,
        color: '#F5FBE6',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    alertButton: {
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 30,
        minWidth: 120,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    alertButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#233D4D',
    },
    corner: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderColor: '#FE7F2D',
    },
    cornerTopLeft: {
        top: 10,
        left: 10,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderTopLeftRadius: 5,
    },
    cornerTopRight: {
        top: 10,
        right: 10,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderTopRightRadius: 5,
    },
    cornerBottomLeft: {
        bottom: 10,
        left: 10,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderBottomLeftRadius: 5,
    },
    cornerBottomRight: {
        bottom: 10,
        right: 10,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderBottomRightRadius: 5,
    }
})