
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY environment variable.");
}
const genAI = new GoogleGenerativeAI(API_KEY);

interface Message {
    role: 'user' | 'bot';
    text: string;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (input.trim().length === 0) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();
      
      const botMessage: Message = { role: 'bot', text };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      const errorMessage: Message = { role: 'bot', text: 'Lo siento, no pude procesar tu solicitud.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <View key={index} style={[styles.message, styles[msg.role]]}>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje..."
          editable={!loading}
        />
        <TouchableOpacity onPress={sendMessage} disabled={loading} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>{loading ? '...' : 'Enviar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f0f0f0',
    },
    messagesContainer: {
      flex: 1,
      padding: 10,
    },
    message: {
      padding: 10,
      borderRadius: 20,
      marginBottom: 10,
      maxWidth: '80%',
    },
    user: {
      backgroundColor: '#d1e7ff',
      alignSelf: 'flex-end',
    },
    bot: {
      backgroundColor: '#e2e3e5',
      alignSelf: 'flex-start',
    },
    messageText: {
      fontSize: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 10,
      borderTopWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#fff',
    },
    input: {
      flex: 1,
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 15,
    },
    sendButton: {
      marginLeft: 10,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      backgroundColor: '#007bff',
      borderRadius: 20,
    },
    sendButtonText: {
      color: '#fff',
      fontSize: 16,
    },
  });

export default Chatbot;
