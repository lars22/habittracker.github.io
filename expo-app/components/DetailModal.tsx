import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Habit, ICON_NAME_MAP } from '../types';

interface DetailModalProps {
  visible: boolean;
  habit: Habit | null;
  streak: number;
  monthlyCount: number;
  totalCount: number;
  completions: Set<string>;
  onClose: () => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onToggleDate: (habitId: string, date: Date) => void;
}

function formatDateKey(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  visible,
  habit,
  streak,
  monthlyCount,
  totalCount,
  completions,
  onClose,
  onEdit,
  onDelete,
  onToggleDate,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  if (!habit) return null;

  const faIconName = (ICON_NAME_MAP[habit.icon] || 'star') as any;

  const changeMonth = (delta: number) => {
    Haptics.selectionAsync();
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentMonthDate(d);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onDelete(habit.id);
            onClose();
          },
        },
      ]
    );
  };

  // Calendar Math
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startingDay = firstDay.getDay() - 1; // 0: Mon ... 6: Sun
  if (startingDay === -1) startingDay = 6;

  const totalDays = lastDay.getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysCells = [];
  for (let i = 0; i < startingDay; i++) {
    daysCells.push(<View key={`empty-${i}`} style={styles.calendarDayCell} />);
  }

  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const dateStr = formatDateKey(d);
    const isDone = completions.has(dateStr);
    const isFuture = d.getTime() > today.getTime();

    daysCells.push(
      <Pressable
        key={`day-${day}`}
        style={[
          styles.calendarDayCell,
          isDone && { backgroundColor: habit.colorHex },
          isFuture && styles.futureDayCell,
        ]}
        disabled={isFuture}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggleDate(habit.id, d);
        }}
      >
        <Text
          style={[
            styles.calendarDayText,
            isDone ? styles.calendarDayDoneText : null,
            isFuture ? styles.futureDayText : null,
          ]}
        >
          {day}
        </Text>
      </Pressable>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Habit Details</Text>
            <Pressable
              onPress={() => {
                onClose();
                onEdit(habit);
              }}
              hitSlop={10}
            >
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Habit Banner */}
            <View style={styles.bannerBox}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: `${habit.colorHex}2E` },
                ]}
              >
                <FontAwesome6
                  name={faIconName}
                  size={26}
                  color={habit.colorHex}
                />
              </View>
              <View style={styles.bannerInfo}>
                <Text style={styles.habitTitle}>{habit.name}</Text>
              </View>
            </View>

            {/* 3 Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <FontAwesome6 name="fire" size={16} color={habit.colorHex} />
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>STREAK</Text>
              </View>
              <View style={styles.statBox}>
                <FontAwesome6
                  name="calendar-check"
                  size={16}
                  color={habit.colorHex}
                />
                <Text style={styles.statValue}>{monthlyCount}</Text>
                <Text style={styles.statLabel}>MONTH</Text>
              </View>
              <View style={styles.statBox}>
                <FontAwesome6
                  name="circle-check"
                  size={16}
                  color={habit.colorHex}
                />
                <Text style={styles.statValue}>{totalCount}</Text>
                <Text style={styles.statLabel}>TOTAL</Text>
              </View>
            </View>

            {/* Calendar */}
            <View style={styles.calendarBox}>
              <View style={styles.calendarHeader}>
                <Text style={styles.monthTitle}>{monthName}</Text>
                <View style={styles.monthNav}>
                  <Pressable
                    onPress={() => changeMonth(-1)}
                    style={styles.navButton}
                  >
                    <FontAwesome6
                      name="chevron-left"
                      size={14}
                      color="#94A3B8"
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => changeMonth(1)}
                    style={styles.navButton}
                  >
                    <FontAwesome6
                      name="chevron-right"
                      size={14}
                      color="#94A3B8"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Weekday labels */}
              <View style={styles.weekdayRow}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                  (w, idx) => (
                    <Text key={idx} style={styles.weekdayText}>
                      {w}
                    </Text>
                  )
                )}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>{daysCells}</View>
            </View>

            {/* Delete Habit Button */}
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <FontAwesome6 name="trash" size={16} color="#EF4444" />
              <Text style={styles.deleteText}>Delete Habit</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  doneText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  editText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '700',
  },
  body: {
    padding: 20,
    gap: 18,
    paddingBottom: 40,
  },
  bannerBox: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  calendarBox: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  monthNav: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    padding: 6,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayText: {
    width: '13%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  calendarDayCell: {
    width: '13%',
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  futureDayCell: {
    opacity: 0.35,
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  calendarDayDoneText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  futureDayText: {
    color: '#64748B',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
