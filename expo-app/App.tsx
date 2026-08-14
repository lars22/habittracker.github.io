import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from './lib/supabase';
import { Habit, CompletionsMap } from './types';
import { HabitCard } from './components/HabitCard';
import { NewHabitModal } from './components/NewHabitModal';
import { DetailModal } from './components/DetailModal';
import { PomodoroModal } from './components/PomodoroModal';
import { AccountModal } from './components/AccountModal';
import { AuthScreen } from './components/AuthScreen';

function formatDateKey(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // App Data State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<CompletionsMap>({});

  // Modals
  const [newModalVisible, setNewModalVisible] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [selectedDetailHabit, setSelectedDetailHabit] = useState<Habit | null>(null);
  const [pomoModalVisible, setPomoModalVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);

  // Supabase Auth Check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchData();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const { data: habitsData, error: hErr } = await supabase
        .from('habits')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });

      if (habitsData && !hErr) {
        setHabits(
          habitsData.map((h: any) => ({
            id: h.id,
            name: h.name,
            icon: h.icon || 'drop.fill',
            colorHex: h.color_hex || '#EE8172',
            position: h.position || 0,
            createdAt: h.created_at,
          }))
        );
      }

      const { data: compData, error: cErr } = await supabase
        .from('completions')
        .select('*');

      if (compData && !cErr) {
        const compMap: CompletionsMap = {};
        compData.forEach((c: any) => {
          if (!compMap[c.habit_id]) {
            compMap[c.habit_id] = new Set();
          }
          compMap[c.habit_id].add(c.completed_date);
        });
        setCompletions(compMap);
      }
    } catch (e) {
      console.warn('Error fetching Supabase data:', e);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Streak calculations
  const calculateStreak = (habitId: string) => {
    const set = completions[habitId];
    if (!set || set.size === 0) return 0;

    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    if (!set.has(formatDateKey(checkDate))) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (set.has(formatDateKey(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };

  const calculateMonthlyCount = (habitId: string) => {
    const set = completions[habitId];
    if (!set || set.size === 0) return 0;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    let count = 0;

    set.forEach((dateStr) => {
      const parts = dateStr.split('-');
      if (
        parseInt(parts[0]) === year &&
        parseInt(parts[1]) - 1 === month
      ) {
        count++;
      }
    });
    return count;
  };

  const toggleCompletion = async (habitId: string, date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    if (target.getTime() > today.getTime()) return;

    const dateStr = formatDateKey(date);
    const newCompletions = { ...completions };
    if (!newCompletions[habitId]) {
      newCompletions[habitId] = new Set();
    }

    if (newCompletions[habitId].has(dateStr)) {
      newCompletions[habitId].delete(dateStr);
      setCompletions(newCompletions);
      await supabase
        .from('completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('completed_date', dateStr);
    } else {
      newCompletions[habitId].add(dateStr);
      setCompletions(newCompletions);
      await supabase
        .from('completions')
        .insert({ habit_id: habitId, completed_date: dateStr });
    }
  };

  const handleSaveHabit = async (
    name: string,
    icon: string,
    colorHex: string,
    id?: string
  ) => {
    if (id) {
      // Edit
      setHabits(
        habits.map((h) =>
          h.id === id ? { ...h, name, icon, colorHex } : h
        )
      );
      await supabase
        .from('habits')
        .update({ name, icon, color_hex: colorHex })
        .eq('id', id);
    } else {
      // Create new
      const newPos = habits.length;
      const { data } = await supabase
        .from('habits')
        .insert([{ name, icon, color_hex: colorHex, position: newPos }])
        .select();

      if (data && data[0]) {
        setHabits([
          ...habits,
          {
            id: data[0].id,
            name: data[0].name,
            icon: data[0].icon,
            colorHex: data[0].color_hex,
            position: data[0].position,
            createdAt: data[0].created_at,
          },
        ]);
      }
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    setHabits(habits.filter((h) => h.id !== habitId));
    const newComps = { ...completions };
    delete newComps[habitId];
    setCompletions(newComps);

    await supabase.from('completions').delete().eq('habit_id', habitId);
    await supabase.from('habits').delete().eq('id', habitId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!session) {
    return <AuthScreen onSuccess={fetchData} />;
  }

  const todayStr = formatDateKey(new Date());

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Habits</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPomoModalVisible(true);
              }}
            >
              <FontAwesome6 name="stopwatch" size={18} color="#94A3B8" />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAccountModalVisible(true);
              }}
            >
              <FontAwesome6 name="user" size={17} color="#94A3B8" />
            </Pressable>
          </View>
        </View>

        {/* Habits ScrollView */}
        <ScrollView
          contentContainerStyle={styles.scrollList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366F1"
            />
          }
        >
          {habits.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome6
                name="wand-magic-sparkles"
                size={52}
                color="#64748B"
              />
              <Text style={styles.emptyText}>
                No habits yet.{'\n'}Create your first one now!
              </Text>
            </View>
          ) : (
            habits.map((habit) => {
              const compSet = completions[habit.id] || new Set();
              const isDoneToday = compSet.has(todayStr);
              const streak = calculateStreak(habit.id);

              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  streak={streak}
                  isDoneToday={isDoneToday}
                  completions={compSet}
                  onToggleToday={(id) => toggleCompletion(id, new Date())}
                  onToggleDate={(id, date) => toggleCompletion(id, date)}
                  onPressCard={(h) => setSelectedDetailHabit(h)}
                />
              );
            })
          )}
        </ScrollView>

        {/* Floating "+ New Habit" Button */}
        <View style={styles.fabContainer}>
          <Pressable
            style={styles.fabButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setEditHabit(null);
              setNewModalVisible(true);
            }}
          >
            <FontAwesome6 name="plus" size={16} color="#ffffff" />
            <Text style={styles.fabText}>New Habit</Text>
          </Pressable>
        </View>
      </View>

      {/* New / Edit Habit Modal */}
      <NewHabitModal
        visible={newModalVisible}
        editHabit={editHabit}
        onClose={() => setNewModalVisible(false)}
        onSave={handleSaveHabit}
      />

      {/* Detail & History Modal */}
      <DetailModal
        visible={!!selectedDetailHabit}
        habit={selectedDetailHabit}
        streak={
          selectedDetailHabit ? calculateStreak(selectedDetailHabit.id) : 0
        }
        monthlyCount={
          selectedDetailHabit
            ? calculateMonthlyCount(selectedDetailHabit.id)
            : 0
        }
        totalCount={
          selectedDetailHabit && completions[selectedDetailHabit.id]
            ? completions[selectedDetailHabit.id].size
            : 0
        }
        completions={
          selectedDetailHabit
            ? completions[selectedDetailHabit.id] || new Set()
            : new Set()
        }
        onClose={() => setSelectedDetailHabit(null)}
        onEdit={(h) => {
          setEditHabit(h);
          setNewModalVisible(true);
        }}
        onDelete={handleDeleteHabit}
        onToggleDate={(id, date) => toggleCompletion(id, date)}
      />

      {/* Pomodoro Focus Timer Modal */}
      <PomodoroModal
        visible={pomoModalVisible}
        onClose={() => setPomoModalVisible(false)}
      />

      {/* Account Settings Modal */}
      <AccountModal
        visible={accountModalVisible}
        userEmail={session.user?.email || ''}
        onClose={() => setAccountModalVisible(false)}
        onLogout={async () => {
          await supabase.auth.signOut();
          setSession(null);
          setHabits([]);
          setCompletions({});
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollList: {
    paddingBottom: 130,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
