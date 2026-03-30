import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";

export function Screen({ children }: { children: ReactNode }) {
  return <View className="flex-1 bg-sand px-5 pt-6">{children}</View>;
}

export function SectionCard({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <View className={cn("rounded-[28px] bg-white p-5 shadow-soft", className)}>{children}</View>;
}

export function PillButton({
  label,
  onPress,
  variant = "primary"
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const variants = {
    primary: "bg-pine",
    secondary: "bg-jade",
    ghost: "bg-sand border border-jade"
  };

  const textVariants = {
    primary: "text-white",
    secondary: "text-white",
    ghost: "text-jade"
  };

  return (
    <Pressable className={cn("items-center rounded-full px-5 py-3", variants[variant])} onPress={onPress}>
      <Text className={cn("text-sm font-semibold", textVariants[variant])}>{label}</Text>
    </Pressable>
  );
}

export function Stat({
  label,
  value,
  accent = "text-pine"
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <View className="gap-1">
      <Text className="text-xs uppercase tracking-[2px] text-steel">{label}</Text>
      <Text className={cn("text-2xl font-bold", accent)}>{value}</Text>
    </View>
  );
}

