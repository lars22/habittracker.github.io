import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';

interface PomodoroModalProps {
  visible: boolean;
  onClose: () => void;
}

type PomoMode = 'focus' | 'shortBreak' | 'longBreak';

const PRESETS: Record<PomoMode, number[]> = {
  focus: [15, 25, 45, 60],
  shortBreak: [5, 10, 15, 20],
  longBreak: [10, 15, 20, 30],
};

const CIRCLE_RADIUS = 84;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  visible,
  onClose,
}) => {
  const [mode, setMode] = useState<PomoMode>('focus');
  const [durations, setDurations] = useState({
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [round, setRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const targetEndTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<any>(null);

  // Load saved state
  useEffect(() => {
    (async () => {
      try {
        const savedDur = await AsyncStorage.getItem('pomodoro_durations');
        if (savedDur) {
          const parsed = JSON.parse(savedDur);
          setDurations(parsed);
          setTimeRemaining((parsed.focus || 25) * 60);
        }
        const savedRound = await AsyncStorage.getItem('pomodoro_round');
        if (savedRound) setRound(parseInt(savedRound) || 1);
      } catch (e) {}
    })();
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const now = Date.now();
        const diff = Math.max(
          0,
          Math.round((targetEndTimeRef.current - now) / 1000)
        );
        setTimeRemaining(diff);

        if (diff <= 0) {
          handleTimerComplete();
        }
      }, 300);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, round, durations]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Advance session
    if (mode === 'focus') {
      if (round >= 4) {
        setRound(1);
        switchMode('longBreak');
      } else {
        const nextRound = round + 1;
        setRound(nextRound);
        AsyncStorage.setItem('pomodoro_round', nextRound.toString());
        switchMode('shortBreak');
      }
    } else {
      switchMode('focus');
    }
  };

  const switchMode = (newMode: PomoMode) => {
    Haptics.selectionAsync();
    setMode(newMode);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const totalSecs = (durations[newMode] || 25) * 60;
    setTimeRemaining(totalSecs);
  };

  const setMinutes = (mins: number) => {
    Haptics.selectionAsync();
    mins = Math.max(1, Math.min(120, mins));
    const newDurations = { ...durations, [mode]: mins };
    setDurations(newDurations);
    AsyncStorage.setItem('pomodoro_durations', JSON.stringify(newDurations));

    if (!isRunning) {
      setTimeRemaining(mins * 60);
    }
  };

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isRunning) {
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      let rem = timeRemaining;
      if (rem <= 0) {
        rem = (durations[mode] || 25) * 60;
        setTimeRemaining(rem);
      }
      targetEndTimeRef.current = Date.now() + rem * 1000;
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeRemaining((durations[mode] || 25) * 60);
  };

  // UI calculations
  const totalSeconds = (durations[mode] || 25) * 60;
  const progress = totalSeconds > 0 ? timeRemaining / totalSeconds : 1;
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const modeColor =
    mode === 'focus' ? '#6366F1' : mode === 'shortBreak' ? '#7BC896' : '#6CB8E6';

  const modeTitle =
    mode === 'focus' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break';

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
            <Text style={styles.headerTitle}>Pomodoro Focus</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>

          {/* Unified Card Content */}
          <View style={styles.body}>
            {/* Segmented Mode Control */}
            <View style={styles.tabsContainer}>
              <Pressable
                style={[
                  styles.tabButton,
                  mode === 'focus' && styles.tabButtonActive,
                ]}
                onPress={() => switchMode('focus')}
              >
                <Text
                  style={[
                    styles.tabText,
                    mode === 'focus' && styles.tabTextActive,
                  ]}
                >
                  Focus
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.tabButton,
                  mode === 'shortBreak' && styles.tabButtonActive,
                ]}
                onPress={() => switchMode('shortBreak')}
              >
                <Text
                  style={[
                    styles.tabText,
                    mode === 'shortBreak' && styles.tabTextActive,
                  ]}
                >
                  Short Break
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.tabButton,
                  mode === 'longBreak' && styles.tabButtonActive,
                ]}
                onPress={() => switchMode('longBreak')}
              >
                <Text
                  style={[
                    styles.tabText,
                    mode === 'longBreak' && styles.tabTextActive,
                  ]}
                >
                  Long Break
                </Text>
              </Pressable>
            </View>

            {/* Circular Timer Display */}
            <View style={styles.timerCircleWrap}>
              <Svg width={200} height={200}>
                {/* Background Ring */}
                <Circle
                  cx={100}
                  cy={100}
                  r={CIRCLE_RADIUS}
                  stroke="#1E293B"
                  strokeWidth={10}
                  fill="transparent"
                />
                {/* Animated Progress Ring */}
                <Circle
                  cx={100}
                  cy={100}
                  r={CIRCLE_RADIUS}
                  stroke={modeColor}
                  strokeWidth={10}
                  strokeDasharray={CIRCLE_CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  rotation="-90"
                  origin="100, 100"
                />
              </Svg>

              <View style={styles.timerTextContainer}>
                <Text style={[styles.modeBadge, { color: modeColor }]}>
                  {modeTitle}
                </Text>
                <Text style={styles.timeDisplay}>{timeStr}</Text>
                <Text
                  style={[
                    styles.roundIndicator,
                    { opacity: mode === 'focus' ? 1 : 0 },
                  ]}
                >
                  Round {round} of 4
                </Text>
              </View>
            </View>

            {/* Stepper & Preset Chips */}
            <View style={styles.presetsSection}>
              <View style={styles.stepperWrap}>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => setMinutes(durations[mode] - 5)}
                >
                  <FontAwesome6 name="minus" size={14} color="#94A3B8" />
                </Pressable>
                <Text style={styles.durationText}>{durations[mode]} min</Text>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => setMinutes(durations[mode] + 5)}
                >
                  <FontAwesome6 name="plus" size={14} color="#94A3B8" />
                </Pressable>
              </View>

              <View style={styles.presetChipsRow}>
                {PRESETS[mode].map((minsVal) => {
                  const isActive = minsVal === durations[mode];
                  return (
                    <Pressable
                      key={minsVal}
                      style={[
                        styles.presetChip,
                        isActive && styles.presetChipActive,
                      ]}
                      onPress={() => setMinutes(minsVal)}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          isActive && styles.presetChipTextActive,
                        ]}
                      >
                        {minsVal}m
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Main Action Buttons */}
            <View style={styles.controlsRow}>
              <Pressable style={styles.resetBtn} onPress={resetTimer}>
                <FontAwesome6 name="rotate-left" size={18} color="#94A3B8" />
              </Pressable>
              <Pressable style={styles.playBtn} onPress={togglePlay}>
                <FontAwesome6
                  name={isRunning ? 'pause' : 'play'}
                  size={18}
                  color="#ffffff"
                />
                <Text style={styles.playBtnText}>
                  {isRunning ? 'Pause' : 'Start'}
                </Text>
              </Pressable>
            </View>
          </View>
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
    minHeight: 530,
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
    color: '#6366F1',
    fontWeight: '700',
  },
  body: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    gap: 16,
    paddingBottom: 36,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#334155',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  timerCircleWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  modeBadge: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timeDisplay: {
    fontSize: 44,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
  },
  roundIndicator: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  presetsSection: {
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  presetChipsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  presetChip: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipActive: {
    backgroundColor: '#6366F1',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  presetChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
  },
  resetBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  playBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
