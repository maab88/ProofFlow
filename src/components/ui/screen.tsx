import type { PropsWithChildren } from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = PropsWithChildren<{
  className?: string;
  contentClassName?: string;
  scrollable?: boolean;
  avoidKeyboard?: boolean;
  keyboardVerticalOffset?: number;
}>;

export function Screen({
  children,
  className,
  contentClassName,
  scrollable = false,
  avoidKeyboard = false,
  keyboardVerticalOffset = 0,
}: ScreenProps) {
  const contentClasses = ['grow px-5 pb-8 pt-4', contentClassName ?? ''].join(' ');

  const body = scrollable ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={contentClasses}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={['flex-1 px-5 pb-8 pt-4', contentClassName ?? ''].join(' ')}>{children}</View>
  );

  return (
    <SafeAreaView className={['flex-1 bg-background', className ?? ''].join(' ')} edges={['top', 'left', 'right']}>
      <View className="absolute inset-0">
        <View className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-accent/12" />
        <View className="absolute right-[-72px] top-32 h-64 w-64 rounded-full bg-blue-300/10" />
        <View className="absolute bottom-20 left-10 h-40 w-40 rounded-full bg-slate-300/5" />
      </View>
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}
