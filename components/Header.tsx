import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

const Header = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <Text style={styles.logo}>DotVision</Text>
        <Text>
          <Link href="/(modals)/info" asChild>
            <TouchableOpacity>
              <Ionicons name="information-circle-outline" size={24} />
            </TouchableOpacity>
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  logo: {
    fontFamily: "mon-b",
    fontSize: 24,
  },
});
export default Header;
