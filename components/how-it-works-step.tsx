import type React from "react";
import { Text, View } from "react-native";

type HowItWorksStepProps = {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function HowItWorksStep({ number, title, description, children }: HowItWorksStepProps) {
  return (
    <View className="flex-row gap-3">
      <View className="h-8 w-8 items-center">
        <View className="h-[28px] w-[28px] items-center justify-center rounded-full border border-accent">
          <Text className="font-mono-bestlist text-[12px] font-bold leading-[14px] text-accent">
            {number}
          </Text>
        </View>
      </View>

      <View className="flex-1 gap-2">
        <View>
          <Text className="font-display text-[21px] font-bold leading-[25px] text-primary">
            {title}
          </Text>
          <Text className="max-w-[300px] font-body text-[15px] leading-[18px] text-secondary">
            {description}
          </Text>
        </View>

        {children}
      </View>
    </View>
  );
}
