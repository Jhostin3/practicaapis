import React, { useState } from 'react';
import { View, Image, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import SearchBar from '../components/SearchBar';
import StarRating from '../components/StarRating';

interface AnimeData {
  coverImage: {
    large: string;
  };
  title: {
    romaji: string;
  };
  averageScore: number;
}

const Index = () => {
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <View className="flex-1 items-center justify-center bg-white p-4">
      <SearchBar onSearch={handleSearch} />
      {loading && <ActivityIndicator size="large" color="#0000ff" className="my-4" />}
      {error && <Text className="text-red-500 my-4">{error}</Text>}
      {animeData && (
        <View className="items-center mt-4">
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
        </View>
      )}
    </View>
  );
};

export default Index;
