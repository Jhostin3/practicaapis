import React, { useState } from 'react';
import { TextInput, View, TouchableOpacity, Text } from 'react-native';

interface SearchBarProps {
  onSearch: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [text, setText] = useState('');

  return (
    <View className="flex-row items-center bg-zinc-800 border border-zinc-700 rounded-full shadow-lg">
      <TextInput
        className="text-white text-lg rounded-full p-4 flex-1 ml-2"
        placeholder="Busca un anime..."
        placeholderTextColor="#888"
        onChangeText={setText}
        value={text}
        style={{ outline: 'none' }}
      />
      <TouchableOpacity onPress={() => onSearch(text)} className="bg-red-600 p-4 rounded-full m-1">
        <Text className="text-white font-bold px-3">Buscar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;