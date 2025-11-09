
import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator, Text, TouchableOpacity, ScrollView, Platform, Linking, ImageBackground, Modal, StyleSheet } from 'react-native';
import SearchBar from '../components/SearchBar';
import StarRating from '../components/StarRating';
import translate from 'translate';
import { WebView } from 'react-native-webview';
import Chatbot from '../components/Chatbot';
import AIRecommender from '../components/AIRecommender'; // Importamos el nuevo componente

interface AnimeData {
  coverImage: {
    large: string;
    extraLarge: string;
  };
  bannerImage: string;
  title: {
    romaji:string;
  };
  averageScore: number;
  popularity: number;
  description: string;
  genres: string[];
  trailer: {
    id: string;
    site: string;
  };
  characters: {
    nodes: {
      id: number;
      name: {
        full: string;
      };
      image: {
        large: string;
      };
    }[];
  };
}

const Index = () => {
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translatedDescription, setTranslatedDescription] = useState("");
  const [modalVisible, setModalVisible] = useState(false);


  useEffect(() => {
    if (animeData?.description) {
      setTranslatedDescription('Traduciendo...');
      translate(animeData.description, { to: 'es' }).then(text => {
        setTranslatedDescription(text);
      }).catch(err => {
        console.error('Error de traducción:', err);
        setTranslatedDescription(animeData.description); // fallback to original
      });
    }
  }, [animeData]);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length > 0) {
      setLoading(true);
      setError(null);
      setAnimeData(null);

      const query = `
        query ($search: String) {
          Media (search: $search, type: ANIME) {
            id
            title {
              romaji
            }
            coverImage {
              large
              extraLarge
            }
            bannerImage
            averageScore
            popularity
            description(asHtml: false)
            genres
            trailer {
              id
              site
            }
            characters(perPage: 5, sort: [ROLE, RELEVANCE, ID]) {
              nodes {
                id
                name {
                  full
                }
                image {
                  large
                }
              }
            }
          }
        }
      `;

      const variables = {
        search: searchQuery,
      };

      try {
        const response = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables,
          }),
        });

        const { data } = await response.json();
        if (data.Media) {
          setAnimeData(data.Media);
        } else {
          setError('Anime no encontrado. Por favor, intenta otra búsqueda.');
        }
      } catch (error) {
        console.error('Error al obtener los datos del anime:', error);
        setError('Ocurrió un error al obtener los datos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={{flex: 1}}>
        <View className="flex-1 bg-zinc-900">
            <View className="p-4 pt-12">
                <Text className="text-white text-4xl font-extrabold mb-4 text-center tracking-tight">AniFinder</Text>
                <SearchBar onSearch={handleSearch} />
            </View>
          
          {loading && <ActivityIndicator size="large" color="#3b82f6" className="my-4" />}
          {error && <Text className="text-red-500 my-4 text-center mx-4">{error}</Text>}

          {animeData && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="w-full"
              contentContainerStyle={{ paddingBottom: 32 }}
            >
                <ImageBackground 
                    source={{ uri: animeData.bannerImage || animeData.coverImage.extraLarge }}
                    className="w-full h-48"
                    resizeMode="cover"
                />

                <View className="bg-zinc-800 rounded-t-2xl shadow-lg -mt-5 p-6 mx-2">
                    <View className="items-center -mt-24">
                        <Image
                            source={{ uri: animeData.coverImage.large }}
                            className="w-48 h-64 rounded-lg shadow-lg border-4 border-white"
                        />
                        <Text className="text-white text-3xl font-bold mt-4 text-center">{animeData.title.romaji}</Text>
                        <View className="mt-2 mb-3 flex-row items-center">
                            <StarRating rating={animeData.averageScore / 20} />
                            <Text className="text-zinc-400 text-sm ml-2">({(animeData.averageScore / 20).toFixed(1)})</Text>
                        </View>
                    </View>
                    
                    <View className="mt-6">
                        <Text className="text-xl font-bold text-white border-b-2 border-zinc-700 pb-2">Sinopsis</Text>
                        <View className="flex-row flex-wrap mt-4">
                            {animeData.genres.map(genre => (
                                <View key={genre} className="bg-sky-500/20 border border-sky-500/30 rounded-full px-4 py-1 mr-2 mb-2">
                                    <Text className="text-sky-300 font-semibold text-sm">{genre}</Text>
                                </View>
                            ))}
                        </View>
                        <Text className="text-zinc-300 mt-4 text-base leading-relaxed text-justify">{translatedDescription.replace(/<br>/g, '\n').replace(/<[^>]*>?/gm, '')}</Text>
                    </View>
                    
                    {animeData.trailer && animeData.trailer.site === 'youtube' && (
                        <View className="mt-6">
                            <Text className="text-xl font-bold text-white border-b-2 border-zinc-700 pb-2 mb-4">Tráiler</Text>
                            {Platform.OS === 'web' ? (
                            <TouchableOpacity 
                                className="bg-red-600 rounded-lg items-center justify-center h-12"
                                onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${animeData.trailer.id}`)} >
                                <Text className="text-white font-bold text-base">Ver Tráiler</Text>
                            </TouchableOpacity>
                            ) : (
                            <View className="aspect-video w-full rounded-lg overflow-hidden">
                                <WebView
                                style={{ flex: 1 }}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                source={{ uri: `https://www.youtube.com/embed/${animeData.trailer.id}` }}
                                />
                            </View>
                            )}
                        </View>
                    )}

                    {animeData.characters && animeData.characters.nodes.length > 0 && (
                        <View className="w-full mt-6">
                        <Text className="text-xl font-bold text-white border-b-2 border-zinc-700 pb-2 mb-4">Personajes</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2 px-2">
                            {animeData.characters.nodes.map(character => (
                            <View key={character.id} className="items-center mr-3 w-32">
                                <Image source={{ uri: character.image.large }} className="w-28 h-40 rounded-lg" />
                                <Text className="text-zinc-200 text-sm mt-2 text-center" numberOfLines={2}>{character.name.full}</Text>
                            </View>
                            ))}
                        </ScrollView>
                        </View>
                    )}
                    
                    {/* AÑADIMOS EL COMPONENTE DE RECOMENDACIONES AQUÍ */}
                    <AIRecommender animeData={animeData} />

                </View>
            </ScrollView>
          )}
        </View>

        <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => {
            setModalVisible(!modalVisible);
            }}
        >
            <View style={{ flex: 1, paddingTop: 40, backgroundColor: '#f0f0f0' }}>
                <Chatbot />
                <TouchableOpacity
                    onPress={() => setModalVisible(!modalVisible)}
                    style={styles.closeButton}
                >
                    <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
            </View>
        </Modal>

        <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.fab}
        >
            <Text style={styles.fabIcon}>🤖</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        backgroundColor: '#3b82f6',
        borderRadius: 28,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabIcon: {
        fontSize: 24,
        color: 'white',
    },
    closeButton: {
        backgroundColor: '#ef4444',
        padding: 15,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});


export default Index;
