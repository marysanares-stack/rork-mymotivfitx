import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Settings,
  Award,
  TrendingDown,
  Droplets,
  Smile,
  Plus,
  X,
  ChevronRight,
  Bell,
  Moon,
  Heart,
  Smartphone,
  Upload,
  Camera,
} from 'lucide-react-native';
import { useFitness } from '@/contexts/FitnessContext';
import Colors from '@/constants/colors';
import { AVATAR_OPTIONS, AI_AVATAR_OPTIONS, MOOD_OPTIONS } from '@/mocks/data';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    user,
    badges,
    earnedBadges,
    weightEntries,
    getTodayWaterIntake,
    getTodayMood,
    getTotalCalories,
    getWeightLoss,
    addWeightEntry,
    addWaterIntake,
    addMood,
    updateAvatar,
    updateUserProfile,
  } = useFitness();

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [weightNotes, setWeightNotes] = useState('');
  const [avatarTab, setAvatarTab] = useState<'emoji' | 'ai' | 'upload'>('emoji');
  // removed unused friend-search hint state to satisfy lint (was unused)
  const [editName, setEditName] = useState(user.name || '');
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [editWeight, setEditWeight] = useState(user.weight ? String(user.weight) : '');
  const [editHeight, setEditHeight] = useState(user.height ? String(user.height) : '');
  const [editAge, setEditAge] = useState(user.age ? String(user.age) : '');
  const [editGender, setEditGender] = useState<'male' | 'female' | 'other' | undefined>(user.gender);

  const waterIntake = getTodayWaterIntake();
  const todayMood = getTodayMood();
  const totalCalories = getTotalCalories();
  const weightLoss = getWeightLoss();
  const currentWeight = weightEntries.length > 0 
    ? weightEntries[weightEntries.length - 1].weight 
    : user.weight || 0;

  const handleAddWeight = () => {
    if (!newWeight) return;
    addWeightEntry(parseFloat(newWeight), weightNotes || undefined);
    setShowWeightModal(false);
    setNewWeight('');
    setWeightNotes('');
  };

  const handleAddWater = () => {
    addWaterIntake(1);
  };

  const handleSetMood = (emoji: string, label: string) => {
    addMood(emoji, label);
    setShowMoodModal(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.findFriendsButton}
            onPress={() => router.push('/friend-search')}
          >
            <Text style={styles.findFriendsButtonText}>Find Friends</Text>
          </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setEditName(user.name || '');
            setEditEmail(user.email || '');
            setEditWeight(user.weight ? String(user.weight) : '');
            setEditHeight(user.height ? String(user.height) : '');
            setEditAge(user.age ? String(user.age) : '');
            setEditGender(user.gender);
            setShowEditModal(true);
          }}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowAvatarModal(true)}
          >
            <View style={styles.avatar}>
              {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{user.avatar}</Text>
              )}
            </View>
            <View style={styles.editBadge}>
              <Camera size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{earnedBadges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalCalories}</Text>
            <Text style={styles.statLabel}>Total Cal</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.friends.length}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Droplets size={20} color={Colors.cyan} />
            <Text style={styles.sectionTitle}>Water Intake Today</Text>
          </View>
          <View style={styles.waterCard}>
            <View style={styles.waterProgress}>
              {Array.from({ length: waterIntake.goal }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waterDrop,
                    i < waterIntake.amount && styles.waterDropFilled,
                  ]}
                >
                  <Droplets
                    size={20}
                    color={i < waterIntake.amount ? Colors.cyan : Colors.textMuted}
                  />
                </View>
              ))}
            </View>
            <Text style={styles.waterText}>
              {waterIntake.amount} / {waterIntake.goal} cups
            </Text>
            <TouchableOpacity style={styles.addWaterBtn} onPress={handleAddWater}>
              <Plus size={20} color={Colors.white} />
              <Text style={styles.addWaterText}>Add Cup</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Smile size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Today&apos;s Mood</Text>
          </View>
          <TouchableOpacity
            style={styles.moodCard}
            onPress={() => setShowMoodModal(true)}
          >
            {todayMood ? (
              <View style={styles.moodContent}>
                <Text style={styles.moodEmoji}>{todayMood.emoji}</Text>
                <View style={styles.moodInfo}>
                  <Text style={styles.moodLabel}>Feeling {todayMood.label}</Text>
                  {todayMood.notes && (
                    <Text style={styles.moodNotes}>{todayMood.notes}</Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.moodEmpty}>
                <Smile size={32} color={Colors.textMuted} />
                <Text style={styles.moodEmptyText}>Tap to set your mood</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingDown size={20} color={Colors.green} />
            <Text style={styles.sectionTitle}>Weight Tracking</Text>
          </View>
          <View style={styles.weightCard}>
            <View style={styles.weightInfo}>
              <Text style={styles.weightValue}>{currentWeight} lbs</Text>
              {weightLoss > 0 && (
                <Text style={styles.weightLoss}>-{weightLoss} lbs</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.updateWeightBtn}
              onPress={() => setShowWeightModal(true)}
            >
              <Text style={styles.updateWeightText}>Update</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Quick Settings</Text>
          </View>
          <View style={styles.quickSettings}>
            <TouchableOpacity
              style={styles.quickSettingItem}
              onPress={() => router.push('/movement-reminders')}
            >
              <View style={styles.quickSettingIcon}>
                <Bell color={Colors.primary} size={24} />
              </View>
              <View style={styles.quickSettingInfo}>
                <Text style={styles.quickSettingTitle}>Movement Reminders</Text>
                <Text style={styles.quickSettingDesc}>Stay active throughout the day</Text>
              </View>
              <ChevronRight color={Colors.textMuted} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSettingItem}
              onPress={() => router.push('/sleep-tracker')}
            >
              <View style={styles.quickSettingIcon}>
                <Moon color={Colors.indigo} size={24} />
              </View>
              <View style={styles.quickSettingInfo}>
                <Text style={styles.quickSettingTitle}>Sleep Tracker</Text>
                <Text style={styles.quickSettingDesc}>Track your sleep quality</Text>
              </View>
              <ChevronRight color={Colors.textMuted} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSettingItem}
              onPress={() => router.push('/heart-rate')}
            >
              <View style={styles.quickSettingIcon}>
                <Heart color={Colors.error} size={24} />
              </View>
              <View style={styles.quickSettingInfo}>
                <Text style={styles.quickSettingTitle}>Heart Rate Monitor</Text>
                <Text style={styles.quickSettingDesc}>Check your heart rate</Text>
              </View>
              <ChevronRight color={Colors.textMuted} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickSettingItem, styles.quickSettingItemLast]}
              onPress={() => router.push('/platform-apis')}
            >
              <View style={styles.quickSettingIcon}>
                <Smartphone color={Colors.cyan} size={24} />
              </View>
              <View style={styles.quickSettingInfo}>
                <Text style={styles.quickSettingTitle}>Platform Integration</Text>
                <Text style={styles.quickSettingDesc}>Sync with Apple Health & Google Fit</Text>
              </View>
              <ChevronRight color={Colors.textMuted} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Badges ({earnedBadges.length}/{badges.length})</Text>
          </View>
          <View style={styles.badgesGrid}>
            {badges.map((badge) => (
              <View
                key={badge.id}
                style={[
                  styles.badgeItem,
                  !badge.earned && styles.badgeItemLocked,
                ]}
              >
                {typeof badge.icon === 'string' && badge.icon.startsWith('http') ? (
                  <Image
                    source={{ uri: badge.icon }}
                    style={[
                      styles.badgeImage,
                      !badge.earned && styles.badgeEmojiLocked,
                    ]}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={[
                    styles.badgeEmoji,
                    !badge.earned && styles.badgeEmojiLocked,
                  ]}>
                    {badge.icon}
                  </Text>
                )}
                <Text style={[
                  styles.badgeName,
                  !badge.earned && styles.badgeNameLocked,
                ]}>
                  {badge.name}
                </Text>
                <Text style={styles.badgeDesc}>{badge.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.inputLabel}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={editWeight}
                onChangeText={setEditWeight}
                placeholder="165"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputLabel}>Height (inches)</Text>
              <TextInput
                style={styles.input}
                value={editHeight}
                onChangeText={setEditHeight}
                placeholder="68"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                value={editAge}
                onChangeText={setEditAge}
                placeholder="30"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {(['male','female','other'] as const).map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderPill, editGender === g && styles.genderPillActive]}
                    onPress={() => setEditGender(g)}
                  >
                    <Text style={[styles.genderPillText, editGender === g && styles.genderPillTextActive]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.submitBtn, !editName && styles.submitBtnDisabled]}
                disabled={!editName}
                onPress={async () => {
                  await updateUserProfile({
                    name: editName.trim(),
                    email: editEmail.trim(),
                    weight: editWeight ? parseFloat(editWeight) : undefined,
                    height: editHeight ? parseInt(editHeight) : undefined,
                    age: editAge ? parseInt(editAge) : undefined,
                    gender: editGender,
                  });
                  setShowEditModal(false);
                }}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.purple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>Save Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAvatarModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Avatar</Text>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.avatarTabs}>
              <TouchableOpacity
                style={[styles.avatarTab, avatarTab === 'emoji' && styles.avatarTabActive]}
                onPress={() => setAvatarTab('emoji')}
              >
                <Text style={[styles.avatarTabText, avatarTab === 'emoji' && styles.avatarTabTextActive]}>Emoji</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.avatarTab, avatarTab === 'ai' && styles.avatarTabActive]}
                onPress={() => setAvatarTab('ai')}
              >
                <Text style={[styles.avatarTabText, avatarTab === 'ai' && styles.avatarTabTextActive]}>AI Generated</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.avatarTab, avatarTab === 'upload' && styles.avatarTabActive]}
                onPress={() => setAvatarTab('upload')}
              >
                <Text style={[styles.avatarTabText, avatarTab === 'upload' && styles.avatarTabTextActive]}>Upload</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.avatarScrollView} contentContainerStyle={styles.avatarScrollContent}>
              {avatarTab === 'emoji' && (
                <View style={styles.avatarGrid}>
                  {AVATAR_OPTIONS.map((avatar) => (
                    <TouchableOpacity
                      key={avatar}
                      style={[
                        styles.avatarOption,
                        user.avatar === avatar && styles.avatarOptionSelected,
                      ]}
                      onPress={() => {
                        updateAvatar(avatar);
                        setShowAvatarModal(false);
                      }}
                    >
                      <Text style={styles.avatarOptionText}>{avatar}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {avatarTab === 'ai' && (
                <View style={styles.avatarGrid}>
                  {AI_AVATAR_OPTIONS.map((avatar) => (
                    <TouchableOpacity
                      key={avatar.id}
                      style={[
                        styles.avatarImageOption,
                        user.avatar === avatar.url && styles.avatarOptionSelected,
                      ]}
                      onPress={() => {
                        updateAvatar(avatar.url);
                        setShowAvatarModal(false);
                      }}
                    >
                      <Image source={{ uri: avatar.url }} style={styles.avatarOptionImage} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {avatarTab === 'upload' && (
                <View style={styles.uploadContainer}>
                  <View style={styles.uploadInfo}>
                    <Upload size={48} color={Colors.primary} />
                    <Text style={styles.uploadTitle}>Upload Your Photo</Text>
                    <Text style={styles.uploadDesc}>Choose a photo from your device to use as your avatar</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => {
                      alert('Image upload will be available in a future update!');
                    }}
                  >
                    <Upload size={20} color={Colors.white} />
                    <Text style={styles.uploadButtonText}>Select Photo</Text>
                  </TouchableOpacity>
                  <Text style={styles.uploadNote}>Coming Soon: Upload custom photos</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showWeightModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWeightModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Weight</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={newWeight}
                onChangeText={setNewWeight}
                placeholder="165"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={weightNotes}
                onChangeText={setWeightNotes}
                placeholder="How are you feeling?"
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                style={[styles.submitBtn, !newWeight && styles.submitBtnDisabled]}
                onPress={handleAddWeight}
                disabled={!newWeight}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.purple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>Save Weight</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMoodModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowMoodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How are you feeling?</Text>
              <TouchableOpacity onPress={() => setShowMoodModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.moodOptions}>
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.emoji}
                  style={[
                    styles.moodOption,
                    { borderColor: mood.color },
                  ]}
                  onPress={() => handleSetMood(mood.emoji, mood.label)}
                >
                  <Text style={styles.moodOptionEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodOptionLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
  },
  editButtonText: {
    color: Colors.text,
    fontWeight: '600' as const,
  },
  findFriendsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  findFriendsButtonText: {
    color: Colors.white,
    fontWeight: '600' as const,
  },
  
  quickSettings: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden' as const,
  },
  quickSettingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  quickSettingItemLast: {
    borderBottomWidth: 0,
  },
  quickSettingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  quickSettingInfo: {
    flex: 1,
  },
  quickSettingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  quickSettingDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: 48,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  editText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  waterCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  waterProgress: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  waterDrop: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterDropFilled: {
    backgroundColor: Colors.cyan + '30',
  },
  waterText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  addWaterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.cyan,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addWaterText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  moodCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  moodEmoji: {
    fontSize: 48,
  },
  moodInfo: {
    flex: 1,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  moodNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  moodEmpty: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  moodEmptyText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  weightCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightInfo: {
    gap: 4,
  },
  weightValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  weightLoss: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.green,
  },
  updateWeightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  updateWeightText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    width: (width - 64) / 2,
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  badgeItemLocked: {
    borderColor: Colors.border,
    opacity: 0.6,
  },
  badgeEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  badgeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  badgeEmojiLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: Colors.textMuted,
  },
  badgeDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalBody: {
    padding: 20,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  avatarOption: {
    width: (width - 88) / 4,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  avatarOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  avatarOptionText: {
    fontSize: 32,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    padding: 18,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  genderPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
  },
  genderPillActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  genderPillText: {
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  genderPillTextActive: {
    color: Colors.primary,
  },
  moodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  moodOption: {
    width: (width - 88) / 3,
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    gap: 8,
  },
  moodOptionEmoji: {
    fontSize: 40,
  },
  moodOptionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarTabs: {
    flexDirection: 'row' as const,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center' as const,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  avatarTabActive: {
    borderBottomColor: Colors.primary,
  },
  avatarTabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  avatarTabTextActive: {
    color: Colors.primary,
  },
  avatarScrollView: {
    maxHeight: 400,
  },
  avatarScrollContent: {
    paddingBottom: 20,
  },
  avatarImageOption: {
    width: (width - 88) / 4,
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden' as const,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
  },
  uploadContainer: {
    padding: 40,
    alignItems: 'center' as const,
  },
  uploadInfo: {
    alignItems: 'center' as const,
    marginBottom: 32,
    gap: 12,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center' as const,
  },
  uploadDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    maxWidth: 280,
  },
  uploadButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  uploadNote: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic' as const,
  },
});
