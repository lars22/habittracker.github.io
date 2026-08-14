import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  Habit,
  VIBRANT_PASTELS,
  AVAILABLE_ICONS,
  ICON_NAME_MAP,
} from '../types';

interface NewHabitModalProps {
  visible: boolean;
  editHabit: Habit | null;
  onClose: () => void;
  onSave: (name: string, icon: string, colorHex: string, id?: string) => void;
}

export const NewHabitModal: React.FC<NewHabitModalProps> = ({
  visible,
  editHabit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(VIBRANT_PASTELS[0]);
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);

  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name);
      setSelectedColor(editHabit.colorHex || VIBRANT_PASTELS[0]);
      setSelectedIcon(editHabit.icon || AVAILABLE_ICONS[0]);
    } else {
      setName('');
      setSelectedColor(VIBRANT_PASTELS[0]);
      setSelectedIcon(AVAILABLE_ICONS[0]);
    }
  }, [editHabit, visible]);

  const handleSave = () => {
    if (!name.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave(name.trim(), selectedIcon, selectedColor, editHabit?.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.headerTitle}>
              {editHabit ? 'Edit Habit' : 'New Habit'}
            </Text>
            <Pressable onPress={handleSave} hitSlop={10}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>

          {/* Form Body */}
          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Habit Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>HABIT NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Drink 2L Water, Morning Run..."
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>

            {/* Color Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>COLOR</Text>
              <View style={styles.colorGrid}>
                {VIBRANT_PASTELS.map((hex) => {
                  const isSelected = hex === selectedColor;
                  return (
                    <Pressable
                      key={hex}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: hex },
                        isSelected && styles.colorCircleSelected,
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedColor(hex);
                      }}
                    />
                  );
                })}
              </View>
            </View>

            {/* Icon Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>ICON</Text>
              <View style={styles.iconGrid}>
                {AVAILABLE_ICONS.map((icon) => {
                  const isSelected = icon === selectedIcon;
                  const faIconName = (ICON_NAME_MAP[icon] || 'star') as any;

                  return (
                    <Pressable
                      key={icon}
                      style={[
                        styles.iconButton,
                        isSelected && styles.iconButtonSelected,
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedIcon(icon);
                      }}
                    >
                      <FontAwesome6
                        name={faIconName}
                        size={18}
                        color={isSelected ? '#ffffff' : '#94A3B8'}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '85%',
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
  cancelText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  saveText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '700',
  },
  body: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  formGroup: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  colorCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#ffffff',
    transform: [{ scale: 1.15 }],
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonSelected: {
    backgroundColor: '#6366F1',
  },
});
