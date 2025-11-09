
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, Linking, StyleSheet, ActivityIndicator, View } from 'react-native';

interface WatchButtonProps {
  animeTitle: string;
}

const WatchButton: React.FC<WatchButtonProps> = ({ animeTitle }) => {
  const [watchUrl, setWatchUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findAnimeUrl = async () => {
      if (!animeTitle) return;
      setLoading(true);
      try {
        // Hacemos una llamada a nuestra propia API Route
        const response = await fetch(`/api/animeflv?title=${encodeURIComponent(animeTitle)}`);
        const data = await response.json();

        if (response.ok && data.url) {
          setWatchUrl(data.url);
        } else {
          setWatchUrl(null); // No se encontraron resultados o hubo un error
        }
      } catch (error) {
        console.error('Error llamando a la API de AnimeFLV:', error);
        setWatchUrl(null); // Error en la comunicación
      } finally {
        setLoading(false);
      }
    };

    findAnimeUrl();
  }, [animeTitle]);

  if (loading) {
    return (
        <View style={[styles.button, styles.loadingButton]}>
            <ActivityIndicator color="#fff" />
        </View>
    );
  }

  if (!watchUrl) {
    return null; // Si no hay URL, no renderizamos nada
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => Linking.openURL(watchUrl)}
    >
      <Text style={styles.buttonText}>Ver Ahora</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4ade80', // Un verde brillante
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, 
  },
  loadingButton: {
    backgroundColor: '#3f6212', // Un verde más oscuro para el estado de carga
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WatchButton;
