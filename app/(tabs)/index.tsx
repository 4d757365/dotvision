import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import Header from "../../components/Header";
import Body from "../../components/Body";

const HomePage = () => {
  return (
    <View style={{ flex: 1, marginTop: 80 }}>
      <Stack.Screen
        options={{
          header: () => <Header />,
        }}
      />
      <Body />
    </View>
  );
};

export default HomePage;
