import * as React from 'react';
import {
  StatusBar,
  FlatList,
  Image,
  Animated,
  Text,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Easing,
  SafeAreaViewBase,
  SafeAreaView,
} from 'react-native';
const { width, height } = Dimensions.get('screen');

// Place Your API Key Here
const API_KEY = "your_api_key"
// Request URL or defined which types images i required
const API_URL = "https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=20"
// Default Image Size
const IMAGE_SIZE = 80
//Default Spacing
const SPACING = 10

// fetch images from pexels.com API
const fetchImagesFromPexels = async () => {
  // send fetch request to Pexels API With "Authorization" Header Includes your API Key
  const data = await fetch(API_URL, {
    headers: {
      "Authorization": API_KEY
    }
  })

  // When results is fetched store it into reults and return the results var
  const { photos } = await data.json();

  return photos

}

export default () => {

  // Create 2 Refs 1 for Top and 1 for Bttom
  const refTop = React.useRef(null)
  const refBottom = React.useRef(null)

  // Get Active Index State
  const [activeIndex, setActiveIndex] = React.useState(0)

  const scrollToActiveIndex = (index) => {
    setActiveIndex(index)

    // Automatically Navigate to the pressed image when some one click on bottom flatlist on a particular image
    refTop?.current?.scrollToOffset({
      offset: index * width,
      animated: true
    })

    // Scroll bottom flatlist active icon images to a center when someone scrolling the images
    if (index * (IMAGE_SIZE + SPACING) - IMAGE_SIZE / 2 > width / 2) {
      refBottom?.current?.scrollToOffset({
        offset: index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
        animated: true
      })
    } else {
      refBottom?.current?.scrollToOffset({
        offset: 0,
        animated: true
      })
    }
  }

  // makes An State to store mages in DOM
  const [images, setImages] = React.useState(null)

  // When the component is rendered the fetchImages() func is run and call the fetchImagesFromPexels() and return the images object returned from Pexels API
  React.useEffect(() => {
    const fetchImages = async () => {
      const images = await fetchImagesFromPexels();

      // Sett State setImages to Store Data Coming From Pexels API 
      setImages(images)
    }

    // Calling func
    fetchImages();
  }, [])

  // images State is NULL Show Loading
  if (!images) {
    return <Text> Loading...</Text>
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: "center", alignItems: "center" }}>
      <StatusBar hidden />
      <FlatList
        data={images}
        keyExtractor={item => item.id.toString()}
        ref={refTop}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        // When you finish the scrolling give me back the scrolling measurements
        onMomentumScrollEnd={ev => {
          // This Math formula give us the active index
          scrollToActiveIndex(Math.floor(ev.nativeEvent.contentOffset.x / width))
        }}
        renderItem={({ item }) => {
          return <View style={{ width, height }}><Image
            source={{ uri: item.src.portrait }}
            style={[StyleSheet.absoluteFillObject]}
          /></View>
        }}
      />
      <FlatList
        data={images}
        keyExtractor={item => item.id.toString()}
        ref={refBottom}
        horizontal
        showsHorizontalScrollIndicator={false}
        // Place to Bottom With Custom Position
        style={{ position: "absolute", bottom: IMAGE_SIZE }}
        contentContainerStyle={{ paddingHorizontal: SPACING }}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity
              // Now if i scrolling the images the bottom flatlist got selected or get white borderRadius
              onPress={() => scrollToActiveIndex(index)}
            >
              <Image
                source={{ uri: item.src.portrait }}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: 12,
                  marginRight: SPACING,
                  borderWidth: 2,
                  borderColor: activeIndex === index ? "#ffff" : "transparent"
                }}
              />
            </TouchableOpacity>
          )
        }}
      />
    </View>
  );
};