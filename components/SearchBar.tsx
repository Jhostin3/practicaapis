import React, { useState } from 'react';
import { TextInput, View, TouchableOpacity, Text } from 'react-native';

interface SearchBarProps {
  onSearch: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [text, setText] = useState('');

  return (
    <View className="p-4 flex-row items-center">
      <TextInput
        className="border border-gray-300 rounded-md p-2 flex-1 mr-2"
        placeholder="Search for an anime..."
        onChangeText={setText}
        value={text}
      />
      <TouchableOpacity onPress={() => onSearch(text)} className="bg-blue-500 p-3 rounded-md">
        <Text className="text-white font-bold">Search</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;