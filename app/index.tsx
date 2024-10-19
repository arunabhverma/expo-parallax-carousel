import React, { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { DATA, DATA_TYPE } from "@/constants";
import { useTheme } from "@react-navigation/native";

type RENDER_ITEM_TYPE = {
  item: DATA_TYPE;
  index: number;
  offsetX: SharedValue<number>;
};

const { width } = Dimensions.get("window");

const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.618;

const AnimatedImage = Animated.createAnimatedComponent(Image);

const RenderItem = ({ item, index, offsetX }: RENDER_ITEM_TYPE) => {
  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      offsetX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [-width * 0.5, 0, width * 0.5]
    );
    return {
      transform: [{ translateX: translateX }],
    };
  });
  return (
    <View style={styles.renderItemContainer}>
      <View style={styles.itemShadowContainer}>
        <View style={styles.itemStyle}>
          <AnimatedImage
            cachePolicy={"none"}
            source={{ uri: item.img }}
            placeholder={{ blurhash: item.blurHash }}
            transition={1000}
            contentFit={"cover"}
            style={[styles.imageStyle, animatedStyle]}
          />
        </View>
      </View>
    </View>
  );
};

const Main = () => {
  const theme = useTheme();
  const offsetX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    offsetX.value = event.contentOffset.x;

    const index = Math.round(offsetX.value / width);
    runOnJS(setActiveIndex)(
      index < 1 ? 0 : index > DATA.length - 1 ? DATA.length - 1 : index
    );
  });

  const RenderText = () => {
    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.textContainer}
      >
        <Animated.Text
          entering={ZoomIn}
          exiting={ZoomOut}
          style={[styles.textStyle, { color: theme.colors.text }]}
        >
          {DATA[activeIndex].label}
        </Animated.Text>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <RenderText />
      <Animated.FlatList
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        pagingEnabled
        horizontal
        data={DATA}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <RenderItem item={item} index={index} offsetX={offsetX} />
        )}
        keyExtractor={(_, i) => i.toString()}
      />
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({
  textContainer: { top: 100, alignItems: "center" },
  textStyle: { fontSize: 15, fontWeight: "500" },
  renderItemContainer: {
    width,
    justifyContent: "center",
    alignItems: "center",
  },
  itemShadowContainer: {
    borderRadius: 20,
    borderWidth: 0.3,
    borderColor: "white",
    alignItems: "center",
    shadowColor: "#192c00",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 40,
  },
  itemStyle: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: "hidden",
    borderRadius: 20,
    alignItems: "center",
  },
  imageStyle: {
    width: CARD_WIDTH * 1.4,
    height: CARD_HEIGHT,
  },
});
