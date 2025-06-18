import { Theme } from '@/lib/theme';
import { useTheme } from '@shopify/restyle';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
}

export function Button({
  onPress,
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
}: ButtonProps) {
  const theme = useTheme<Theme>();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.muted;
    switch (variant) {
      case 'destructive':
        return theme.colors.danger;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
      case 'ghost':
      case 'link':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.mutedForeground;
    switch (variant) {
      case 'outline':
      case 'ghost':
      case 'link':
        return theme.colors.primary;
      default:
        return theme.colors.white;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.muted;
    switch (variant) {
      case 'outline':
        return theme.colors.primary;
      default:
        return 'transparent';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return theme.spacing.s;
      case 'lg':
        return theme.spacing.l;
      default:
        return theme.spacing.m;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          padding: getPadding(),
        },
      ]}>
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
          },
        ]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
}); 