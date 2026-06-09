import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/constants/theme";

const MIN_SCORE = 1;
const MAX_SCORE = 10;
const SCORE_STEP = 0.5;
const THUMB_SIZE = 28;

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

function snapScore(value: number) {
  "worklet";
  const stepped = Math.round(value / SCORE_STEP) * SCORE_STEP;
  return clamp(stepped, MIN_SCORE, MAX_SCORE);
}

function scoreToOffset(value: number, width: number) {
  "worklet";
  if (width <= 0) {
    return 0;
  }

  return ((value - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * width;
}

function offsetToScore(offset: number, width: number) {
  "worklet";
  if (width <= 0) {
    return MIN_SCORE;
  }

  const progress = clamp(offset / width, 0, 1);
  return snapScore(MIN_SCORE + progress * (MAX_SCORE - MIN_SCORE));
}

function triggerLightImpact() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function ScoreSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const offset = useSharedValue(0);
  const startOffset = useSharedValue(0);
  const lastStep = useSharedValue(value);

  useEffect(() => {
    const nextOffset = scoreToOffset(value, trackWidth);
    offset.value = withTiming(nextOffset, { duration: 120 });
    lastStep.value = value;
  }, [lastStep, offset, trackWidth, value]);

  const pan = Gesture.Pan()
    .activeOffsetX([-4, 4])
    .onBegin(() => {
      startOffset.value = offset.value;
    })
    .onUpdate((event) => {
      const nextOffset = clamp(startOffset.value + event.translationX, 0, trackWidth);
      const nextScore = offsetToScore(nextOffset, trackWidth);

      offset.value = scoreToOffset(nextScore, trackWidth);

      if (nextScore !== lastStep.value) {
        lastStep.value = nextScore;
        runOnJS(onChange)(nextScore);
        runOnJS(triggerLightImpact)();
      }
    });

  const fillStyle = useAnimatedStyle(() => ({
    width: offset.value,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value - THUMB_SIZE / 2 }],
  }));

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-accent">
          {label}
          <Text className="text-accent"> (1-10)</Text>
        </Text>
        <Text className="font-body text-[15px] font-bold text-primary">
          {value.toFixed(1)}
        </Text>
      </View>

      <GestureDetector gesture={pan}>
        <View className="h-9 justify-center">
          <View
            className="h-2 overflow-hidden rounded-full border border-subtle bg-app"
            onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
          >
            <Animated.View className="h-full bg-accent" style={fillStyle} />
          </View>
          <Animated.View
            className="absolute left-0 top-1 h-7 w-7 rounded-full border-2 border-white bg-accent shadow-card"
            style={[
              {
                backgroundColor: colors.accentGreen,
                borderRadius: THUMB_SIZE / 2,
              },
              thumbStyle,
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
}
