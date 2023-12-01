import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  TouchableOpacity,
  StyleSheet,
  Image,
  Button,
} from "react-native";
import React, { useRef, useState } from "react";
import { LabelType } from "./Body";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
interface TranslatedLabel {
  detectedSourceLanguage: string;
  translatedText: string;
}
interface LabelProps {
  labels: LabelType[];
  translatedLabels: TranslatedLabel[];
}

const Label = ({ labels, translatedLabels }: LabelProps) => {
  const listRef = useRef<FlatList>(null);
  const [isLoading, setIsLoading] = useState(false);

  const ttsen = (desc: string) => {
    Speech.speak(desc, {
      voice: "com.apple.ttsbundle.siri_Aaron_en-US_compact",
    });
  };
  const ttses = (desc: string) => {
    Speech.speak(desc, {
      voice: "com.apple.voice.compact.es-MX.Paulina",
    });
  };

  const render: ListRenderItem<LabelType> = ({ item, index }) => (
    <View
      style={{
        marginTop: 10,
        width: 350,
        padding: 10,
        borderWidth: 2,
        borderRadius: 8,
      }}
    >
      <View
        style={{ justifyContent: "space-between", flexDirection: "column" }}
      >
        <TouchableOpacity
          onPress={() => ttsen(item.description)}
          style={{
            borderWidth: 1.5,
            borderRadius: 6,
            width: "auto",
            gap: 4,
            padding: 2,
            marginBottom: 4,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="volume-medium-outline" size={30} />
          <Text style={styles.labelText}>{item.description}</Text>
          <Text style={{ fontFamily: "mon" }}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => ttses(translatedLabels[index].translatedText)}
          style={{
            borderWidth: 1.5,
            borderRadius: 6,
            width: "auto",
            gap: 4,
            padding: 2,
            marginBottom: 4,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="volume-medium-outline" size={30} />
          <Text style={styles.labelText}>
            {translatedLabels[index].translatedText}
          </Text>
          <Text style={{ fontFamily: "mon" }}>Spanish</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          borderWidth: 1.5,
          borderRadius: 6,
          height: 80,
          width: "auto",
          gap: 4,
          padding: 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontFamily: "mon-b", fontSize: 18 }}>Confidence</Text>

        <Text style={styles.labelScore}>{(item.score * 100).toFixed(2)} %</Text>
      </View>
      {/* <View style={styles.barContainer}>
        <View
          style={[
            styles.progressBar,
            { width: (300 * labels[0].score * 100) / 100 },
          ]}
        />
      </View> */}
    </View>
  );

  return (
    <View
      style={{
        marginTop: 10,
        alignItems: "center",
        marginBottom: 30,
      }}
    >
      <FlatList
        extraData={translatedLabels}
        style={{}}
        renderItem={render}
        ref={listRef}
        data={labels}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    width: 300,
    height: 20,
    backgroundColor: "#ddd", // Container background color
    borderRadius: 5,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#000", // Change color as needed
  },
  labelText: {
    fontFamily: "mon-b",
    fontSize: 18,
  },
  labelScore: {
    fontFamily: "mon-sb",
    fontSize: 18,
  },
});

export default Label;
