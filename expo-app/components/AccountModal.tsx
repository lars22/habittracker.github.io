import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';

interface AccountModalProps {
  visible: boolean;
  userEmail: string;
  onClose: () => void;
  onLogout: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  visible,
  userEmail,
  onClose,
  onLogout,
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) return;
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) {
      setMessage({ text: error.message, isError: true });
    } else {
      setMessage({
        text: 'Confirmation link sent to your new email address!',
        isError: false,
      });
      setNewEmail('');
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setMessage({
        text: 'Password must be at least 6 characters.',
        isError: true,
      });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMessage({ text: error.message, isError: true });
    } else {
      setMessage({
        text: 'Password updated successfully!',
        isError: false,
      });
      setNewPassword('');
    }
  };

  const handleLogoutPress = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onLogout();
          onClose();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account Data',
      'Are you sure you want to permanently delete all your habits and completion history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete user data from Supabase
              await supabase.from('completions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
              await supabase.from('habits').delete().neq('id', '00000000-0000-0000-0000-000000000000');
              onLogout();
              onClose();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

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
            <Text style={styles.headerTitle}>Account Settings</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* User Info */}
            <View style={styles.userBanner}>
              <View style={styles.avatarBox}>
                <FontAwesome6 name="user" size={20} color="#6366F1" />
              </View>
              <View>
                <Text style={styles.userLabel}>SIGNED IN AS</Text>
                <Text style={styles.userEmail}>{userEmail || 'No user'}</Text>
              </View>
            </View>

            {message && (
              <View
                style={[
                  styles.messageBox,
                  message.isError
                    ? styles.messageError
                    : styles.messageSuccess,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isError
                      ? styles.messageErrorText
                      : styles.messageSuccessText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            )}

            {/* Change Email */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CHANGE EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="New email address"
                placeholderTextColor="#64748B"
                value={newEmail}
                onChangeText={setNewEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Pressable
                style={styles.actionBtn}
                onPress={handleUpdateEmail}
              >
                <Text style={styles.actionBtnText}>Update Email</Text>
              </Pressable>
            </View>

            {/* Change Password */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CHANGE PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="New password (min. 6 characters)"
                placeholderTextColor="#64748B"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <Pressable
                style={styles.actionBtn}
                onPress={handleUpdatePassword}
              >
                <Text style={styles.actionBtnText}>Update Password</Text>
              </Pressable>
            </View>

            {/* Log Out */}
            <Pressable style={styles.logoutBtn} onPress={handleLogoutPress}>
              <FontAwesome6
                name="arrow-right-from-bracket"
                size={16}
                color="#EF4444"
              />
              <Text style={styles.logoutBtnText}>Log Out</Text>
            </Pressable>

            {/* Delete Account */}
            <Pressable
              style={styles.deleteAccountBtn}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.deleteAccountText}>
                Delete Account Data
              </Text>
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
    gap: 20,
    paddingBottom: 40,
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  messageBox: {
    padding: 12,
    borderRadius: 12,
  },
  messageError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  messageSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  messageText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  messageErrorText: {
    color: '#EF4444',
  },
  messageSuccessText: {
    color: '#22C55E',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#ffffff',
  },
  actionBtn: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteAccountBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteAccountText: {
    color: '#64748B',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
