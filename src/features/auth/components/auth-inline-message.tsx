import { Text, View } from 'react-native';

type AuthInlineMessageProps = {
  message: string;
  tone?: 'error' | 'success';
};

const toneClasses = {
  error: {
    container: 'border-danger/30 bg-danger/10',
    text: 'text-danger',
  },
  success: {
    container: 'border-success/30 bg-success/10',
    text: 'text-success',
  },
} as const;

export function AuthInlineMessage({ message, tone = 'error' }: AuthInlineMessageProps) {
  const toneClass = toneClasses[tone];

  return (
    <View className={['rounded-xl border px-4 py-3', toneClass.container].join(' ')}>
      <Text className={['text-sm leading-5', toneClass.text].join(' ')}>{message}</Text>
    </View>
  );
}
