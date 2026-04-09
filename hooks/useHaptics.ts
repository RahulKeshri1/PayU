import * as Haptics from "expo-haptics";

export const useHapticFeedback = () => {
  const lightTap = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not supported or error occurred
    }
  };

  const mediumTap = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not supported or error occurred
    }
  };

  const heavyTap = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      // Haptics not supported or error occurred
    }
  };

  const impactLight = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not supported or error occurred
    }
  };

  const impactMedium = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not supported or error occurred
    }
  };

  const impactHeavy = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      // Haptics not supported or error occurred
    }
  };

  const success = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics not supported or error occurred
    }
  };

  const warning = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      // Haptics not supported or error occurred
    }
  };

  const error = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      // Haptics not supported or error occurred
    }
  };

  return {
    lightTap,
    mediumTap,
    heavyTap,
    impactLight,
    impactMedium,
    impactHeavy,
    success,
    warning,
    error,
  };
};
