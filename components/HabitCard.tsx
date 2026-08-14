import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Habit, ICON_NAME_MAP } from '../types';

interface HabitCardProps {
  habit: Habit;
  streak: number;
  isDoneToday: boolean;
  completions: Set<string>;
  onToggleToday: (habitId: string) => void;
  onToggleDate: (habitId: string, date: Date) => void;
  onPressCard: (habit: Habit) => void;
}

const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateKey(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  streak,
  isDoneToday,
  completions,
  onToggleToday,
  onToggleDate,
  onPressCard,
}) => {
  const faIconName = (ICON_NAME_MAP[habit.icon] || "star") as any;

  // Past 7 days calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const past7Days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    past7Days.push(d);
  }

  const handleCheckPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleToday(habit.id);
  };

  const handleDayPress = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleDate(habit.id, date);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPressCard(habit)}
    >
      {/* Icon Box */}
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: `${habit.colorHex}2E`,
          },
        ]}
      >
        <FontAwesome6 name={faIconName} size={20} color={habit.colorHex} />
      </View>

      {/* Habit Info & Week Row */}
      <View style={styles.infoCol}>
        <Text style={styles.habitName} numberOfLines={1}>
          {habit.name}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.weekRow}>
            {past7Days.map((date, idx) => {
              const dateStr = formatDateKey(date);
              const isDone = completions.has(dateStr);
              const isToday = date.getTime() === today.getTime();
              const weekdayIdx = date.getDay();

              const circleBg = isDone ? habit.colorHex : "#334155";
              const labelColor = isToday ? habit.colorHex : "#64748B";

              return (
                <Pressable
                  key={idx}
                  style={styles.dayCol}
                  onPress={() => handleDayPress(date)}
                  hitSlop={6}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      { backgroundColor: circleBg },
                    ]}
                  />
                  <Text
                    style={[
                      styles.dayLabel,
                      { color: labelColor },
                      isToday && styles.todayLabel,
                    ]}
                  >
                    {SHORT_WEEKDAYS[weekdayIdx]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {streak > 0 && (
            <View style={styles.streakBadge}>
              <FontAwesome6 name="fire" size={11} color={habit.colorHex} />
              <Text style={[styles.streakText, { color: habit.colorHex }]}>
                {streak}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Big Check Button */}
      <Pressable
        style={[
          styles.checkBtn,
          isDoneToday
            ? { backgroundColor: habit.colorHex, borderColor: 'transparent' }
            : styles.checkBtnUncompleted,
        ]}
        onPress={handleCheckPress}
        hitSlop={8}
      >
        <FontAwesome6
          name="check"
          size={18}
          color={isDoneToday ? "#0F172A" : "#475569"}
        />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 10,
  },
  habitName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
  },
  dayCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 9,
    fontWeight: '400',
  },
  todayLabel: {
    fontWeight: '700',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
  },
  checkBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  checkBtnUncompleted: {
    backgroundColor: '#1E293B',
    borderColor: '#475569',
  },
});
