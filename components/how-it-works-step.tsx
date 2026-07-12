import type React from "react";
import { Text, View } from "react-native";

type HowItWorksStepProps = {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

/**
 * Renders one onboarding explanation step.
 */
export function HowItWorksStep({
  number,
  title,
  description,
  children,
}: HowItWorksStepProps) {
  return (
    <View className="flex-row gap-3">
      <View className="h-8 w-8 items-center">
        <View className="h-7 w-7 items-center justify-center rounded-full border border-accent">
          <Text className="font-mono-bestlist text-[12px] font-bold leading-3.5 text-accent">
            {number}
          </Text>
        </View>
      </View>

      <View className="flex-1 gap-2">
        <View>
          <Text className="font-display text-[21px] font-bold leading-6.25 text-shadow-bestlist-green">
            {title}
          </Text>
          <Text className="max-w-75 font-body text-[15px] leading-4.5 text-secondary">
            {description}
          </Text>
        </View>

        {children}
      </View>
    </View>
  );
}
