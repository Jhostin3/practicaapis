
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializamos la API de Gemini
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY environment variable.");
}
const genAI = new GoogleGenerativeAI(API_KEY);

interface AIRecommenderProps {
  animeData: {
    title: {
      romaji: string;
    };
    genres: string[];
    description: string;
  };
}

const AIRecommender: React.FC<AIRecommenderProps> = ({ animeData }) => {
  const [recommendations, setRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (animeData) {
      fetchRecommendations();
    }
  }, [animeData]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    setRecommendations('');

    // Prompt optimizado para una respuesta corta y en texto plano
    const prompt = `Basado en el anime '${animeData.title.romaji}', cuyos géneros son [${animeData.genres.join(', ')}] y cuya descripción es: "${animeData.description.substring(0, 200)}...", recomiéndame 3 animes. Responde únicamente con el formato: "1. Título del Anime: Breve razón.\n2. Título del Anime: Breve razón.\n3. Título del Anime: Breve razón.". No agregues saludos ni texto introductorio.`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setRecommendations(text);
    } catch (e) {
      console.error("Error al obtener recomendaciones:", e);
      setError('No se pudieron obtener las recomendaciones.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#007bff" />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (recommendations) {
        // Parseamos la respuesta de texto plano para darle estilo
      const recommendationItems = recommendations.split('\n').filter(item => item.trim() !== '');
      return (
        <View>
          {recommendationItems.map((item, index) => (
            <Text key={index} style={styles.recommendationItem}>{item}</Text>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recomendaciones con IA</Text>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  recommendationItem: {
      fontSize: 14,
      marginBottom: 5,
      lineHeight: 20,
  }
});

export default AIRecommender;
