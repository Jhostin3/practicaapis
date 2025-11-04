import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator, Text, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';
import SearchBar from '../components/SearchBar';
import StarRating from '../components/StarRating';
import translate from 'translate';
import { WebView } from 'react-native-webview';

interface AnimeData {
  coverImage: {
    large: string;
  };
  title: {
    romaji:string;
  };
  averageScore: number;
  description: string;
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

  useEffect(() => {
    if (animeData?.description) {
      setTranslatedDescription('Translating...');
      translate(animeData.description, { to: 'es' }).then(text => {
        setTranslatedDescription(text);
      }).catch(err => {
        console.error('Translation error:', err);
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
            }
            averageScore
            description(asHtml: false)
            trailer {
              id
              site
            }
            characters(perPage: 3, sort: [ROLE, RELEVANCE, ID]) {
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
          setError('Anime not found. Please try another search.');
        }
      } catch (error) {
        console.error('Error fetching anime data:', error);
        setError('An error occurred while fetching data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-white p-4 pt-16">
      <SearchBar onSearch={handleSearch} />
      {loading && <ActivityIndicator size="large" color="#0000ff" className="my-4" />}
      {error && <Text className="text-red-500 my-4 text-center">{error}</Text>}
      {animeData && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="w-full mt-4"
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
        >
          <Image
            source={{ uri: animeData.coverImage.large }}
            className="w-64 h-96 rounded-lg"
          />
          <Text className="text-lg font-bold mt-2 text-center">{animeData.title.romaji}</Text>
          <StarRating rating={animeData.averageScore / 20} />
          <View className="flex-row mt-4 space-x-2">
            <TouchableOpacity className="bg-sky-500 rounded-md items-center justify-center">
              <Text className="text-white font-bold px-10 py-3">Add to List</Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-3 bg-red-500 rounded-md items-center justify-center">
              <Text className="text-white text-2xl">♥</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-sm mt-4 text-justify px-4">{translatedDescription.replace(/<br>/g, '\n').replace(/<[^>]*>?/gm, '')}</Text>
          
          {animeData.trailer && animeData.trailer.site === 'youtube' && (
            Platform.OS === 'web' ? (
              <TouchableOpacity 
                className="bg-red-600 rounded-md items-center justify-center mt-4 px-10 py-3"
                onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${animeData.trailer.id}`)} >
                <Text className="text-white font-bold">Watch Trailer on YouTube</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ height: 200, width: 320, marginTop: 20 }}>
                <WebView
                  style={{ flex: 1 }}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  source={{ uri: `https://www.youtube.com/embed/${animeData.trailer.id}` }}
                />
              </View>
            )
          )}

          {animeData.characters && animeData.characters.nodes.length > 0 && (
            <View className="w-full mt-4">
              <Text className="text-lg font-bold px-4">Characters</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 pl-4">
                {animeData.characters.nodes.map(character => (
                  <View key={character.id} className="items-center mr-4">
                    <Image source={{ uri: character.image.large }} className="w-24 h-32 rounded-lg" />
                    <Text className="text-sm mt-1 text-center w-24">{character.name.full}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

        </ScrollView>
      )}
    </View>
  );
};

export default Index;
