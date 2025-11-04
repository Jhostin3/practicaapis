import React from 'react';
import { View, Text } from 'react-native';

interface StarRatingProps {
  rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <View className="flex-row items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Text key={`full_${i}`} className="text-yellow-400 text-2xl">★</Text>
      ))}
      {halfStar && <Text className="text-yellow-400 text-2xl">✫</Text>}
      {[...Array(emptyStars)].map((_, i) => (
        <Text key={`empty_${i}`} className="text-gray-300 text-2xl">☆</Text>
      ))}
    </View>
  );
};

export default StarRating;