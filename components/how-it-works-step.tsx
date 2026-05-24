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
      <View className="h-6 w-6 items-center">
        <View className="h-[18px] w-[18px] items-center justify-center rounded-full border border-accent">
          <Text className="font-mono-bestlist text-[8px] font-bold leading-[10px] text-accent">
            {number}
          </Text>
        </View>
      </View>

      <View className="flex-1 gap-2">
        <View>
          <Text className="font-display text-[14px] font-bold leading-[18px] text-primary">
            {title}
          </Text>
          <Text className="max-w-[238px] font-body text-[9px] leading-[12px] text-secondary">
            {description}
          </Text>
        </View>

        {children}
      </View>
    </View>
  );
}
