import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import Label from "./Label";
import { ScrollView } from "react-native-gesture-handler";
import { LogBox } from "react-native";
LogBox.ignoreLogs(["new NativeEventEmitter"]); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

export interface LabelType {
  description: string;
  mid: string;
  score: number;
  topicality: number;
}

const Body = () => {
  const { user } = useUser();
  const [isLaoding, setIsLaoding] = useState(false);

  // image state
  const [image, setImage] = useState<string | null>(null);
  // english label state
  const [labels, setLabels] = useState<LabelType[] | []>([]);
  // fetching button state
  const [isDisabled, setIsDisabled] = useState(true);
  // spanish label state
  const [translatedLabels, setTranslatedLabels] = useState([]);

  const [descriptions, setDescriptions] = useState<string[] | []>([]);

  const handleUpload = async () => {
    try {
      // launch the image picker and wait for it
      const image = await ImagePicker.launchImageLibraryAsync({
        // we only want the user to pick image type
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        // allow the user to edit the image
        allowsEditing: true,
        // set the quality to 1:1
        quality: 1,
      });

      // if the user did not cancel the upload
      if (!image.canceled) {
        // set the state with the image
        setImage(image.assets[0].uri);
        // set the fetching button to not be disabled
        setIsDisabled(false);
      }

      // if there are any errors
    } catch (error) {
      // log the error
      console.error(error);
    }
  };

  const handleRemove = () => {
    setImage(null);
    setIsDisabled(true);
  };

  const handleFetch = async () => {
    try {
      // if there is no image in the state
      if (!image) {
        // alert the user and exit the function
        alert("Please select an image first.");
        return;
      }

      // Google Cloud Vision API configuration
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;
      const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

      // convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // create the request body according to Google Cloud Vision API documentation
      const req = {
        requests: [
          {
            image: {
              // attach the converted base64 image
              content: base64Image,
            },
            // select the features
            features: [
              {
                // label detection feature
                type: "LABEL_DETECTION",
                // only 5 labels
                maxResults: 5,
              },
            ],
          },
        ],
      };

      // fetch the POST request and get the response
      const res = await axios.post(apiUrl, req);
      // from the response get the labelAnnotations
      const fetchedLabels = res.data.responses[0].labelAnnotations;
      // set the labels state with the fetchedLabels
      setLabels(fetchedLabels);

      // clean up the fetchedLabels by mapping the whole data to get only the label description
      let fetchedDescriptions = fetchedLabels.map(
        (item: LabelType) => item.description
      );

      // log to show success
      console.log("SUCCESSFULLY FETCHED LABELS!");
      console.log("LABELS: ", fetchedLabels);
      console.log("DESCRIPTIONS: ", fetchedDescriptions);
      // disable the fetch button to prevent user from fetching the same image back to back
      setIsDisabled(true);

      // call on handleTranslate with the fetchedDescriptions to get the translated label description
      await handleTranslate(fetchedDescriptions);

      // if there is any error
    } catch (error) {
      // log the error
      console.error("FETCH", error);
    }
  };

  const handleTranslate = async (fetchedDescriptions: string[]) => {
    try {
      // if the fetchedDescriptions has no data, then log and exit the function
      if (fetchedDescriptions.length == 0) {
        console.log("NO DESCRIPTIONS TO TRANSLATE!");
        return;
      }

      // Google Cloud Translate API configuration
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
      const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

      // create the request body according to the Google Translate API documentation
      const req = {
        // attach the fetchedDescriptions, which holds the array of labels
        // in english to be translated
        q: fetchedDescriptions,
        // select the language to be translated to
        // 'es' is for Spanish according to the documentation
        target: "es",
      };

      // make the POST request and get the response
      const res = await axios.post(apiUrl, req);
      // log to show success
      console.log("SUCCESSFULLY TRANSLATED!");

      // get the translated labels from the response
      const fetchedTranslated = res.data.data.translations;
      // set the state with the translated labels
      setTranslatedLabels(fetchedTranslated);
      // log to show it worked
      console.log("TRANSLATEDLABELS: ", fetchedTranslated);

      // if there is any error
    } catch (error) {
      // log the error
      console.error("TRANSLATE: ", error);
    }
  };

  if (!user) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text style={styles.logo}>DotVision</Text>
        <Text style={styles.subTitle}>powered by Google</Text>
        <Link href="/(modals)/login" asChild>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Log in</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* <Text style={{ fontFamily: "mon-sb", fontSize: 25 }}>
        Hello, {user.firstName}!
      </Text> */}
      <View>
        {image ? (
          <TouchableOpacity onPress={handleUpload}>
            <Image source={{ uri: image }} style={styles.box} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleUpload}>
            <View style={styles.box}>
              <Text style={styles.boxText}>Upload an Image</Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          disabled={isDisabled}
          style={[
            styles.fetchBtn,
            isDisabled ? { backgroundColor: "lightgrey" } : {},
          ]}
          onPress={handleFetch}
        >
          <Text
            style={[styles.btnText, isDisabled ? { color: "darkgrey" } : {}]}
          >
            Fetch Labels
          </Text>
        </TouchableOpacity>

        {labels.length > 0 && translatedLabels.length > 0 && (
          <Label labels={labels} translatedLabels={translatedLabels} />
        )}
      </View>
    </ScrollView>
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
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  box: {
    alignSelf: "center",
    width: 300,
    height: 300,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginTop: 20,
  },
  boxText: {
    fontFamily: "mon-b",
    fontSize: 22,
  },
  fetchBtn: {
    marginTop: 10,
    fontFamily: "mon-sb",
    backgroundColor: "#000",
    padding: 10,
    width: 300,
    borderRadius: 10,
    alignSelf: "center",
  },
  logo: {
    fontFamily: "mon-b",
    fontSize: 25,
  },
  subTitle: {
    fontFamily: "mon",
    fontSize: 14,
  },
  btn: {
    backgroundColor: "#000",
    height: 40,
    width: "auto",
    padding: 8,
    borderRadius: 8,
  },
  btnText: {
    fontFamily: "mon-sb",
    fontSize: 22,
    color: "#fff",
    textAlign: "center",
  },
});
export default Body;
