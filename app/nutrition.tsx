import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  Plus,
  X,
  Apple,
  Coffee,
  UtensilsCrossed,
  Cookie,
  Flame,
  ScanBarcode,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servingSize: string;
  date: string;
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: Coffee, color: Colors.orange },
  { value: 'lunch', label: 'Lunch', icon: UtensilsCrossed, color: Colors.green },
  { value: 'dinner', label: 'Dinner', icon: Apple, color: Colors.blue },
  { value: 'snack', label: 'Snack', icon: Cookie, color: Colors.purple },
] as const;

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [isLookingUpBarcode, setIsLookingUpBarcode] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [servingSize, setServingSize] = useState('');

  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  };

  const todayEntries = foodEntries.filter(
    entry => entry.date === new Date().toISOString().split('T')[0]
  );

  const totals = todayEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleAddFood = () => {
    if (!foodName || !calories) return;

    const newEntry: FoodEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: foodName,
      calories: parseFloat(calories),
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      mealType,
      servingSize: servingSize || '1 serving',
      date: new Date().toISOString().split('T')[0],
    };

    setFoodEntries([...foodEntries, newEntry]);
    setShowAddModal(false);
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setServingSize('');
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (isLookingUpBarcode || hasScanned) return;

    console.log('Barcode scanned:', data);
    setHasScanned(true);
    setIsLookingUpBarcode(true);
    setShowBarcodeScanner(false);

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const result = await response.json();

      if (result.status === 1 && result.product) {
        const product = result.product;
        const nutriments = product.nutriments || {};

        setFoodName(product.product_name || 'Unknown Product');
        setCalories(String(Math.round(nutriments.energy_value || nutriments['energy-kcal_100g'] || 0)));
        setProtein(String(Math.round(nutriments.proteins_100g || 0)));
        setCarbs(String(Math.round(nutriments.carbohydrates_100g || 0)));
        setFat(String(Math.round(nutriments.fat_100g || 0)));
        setServingSize(product.serving_size || '100g');
        setShowAddModal(true);
      } else {
        console.log('Product not found in database');
        setFoodName('');
        setShowAddModal(true);
      }
    } catch (error) {
      console.error('Error looking up barcode:', error);
      setShowAddModal(true);
    } finally {
      setIsLookingUpBarcode(false);
    }
  };

  const handleOpenBarcodeScanner = async () => {
    if (Platform.OS === 'web') {
      console.log('Barcode scanner not available on web');
      return;
    }

    if (!cameraPermission) {
      return;
    }

    if (!cameraPermission.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        console.log('Camera permission denied');
        return;
      }
    }

    setHasScanned(false);
    setShowBarcodeScanner(true);
  };

  const getMealEntries = (meal: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    return todayEntries.filter(entry => entry.mealType === meal);
  };

  const getMealTotal = (meal: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    return getMealEntries(meal).reduce((sum, entry) => sum + entry.calories, 0);
  };

  const MacroProgress = ({ label, current, goal, color }: { label: string; current: number; goal: number; color: string }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    return (
      <View style={styles.macroCard}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>
          {Math.round(current)}<Text style={styles.macroGoal}>/{goal}g</Text>
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Nutrition Tracking',
        }}
      />
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Nutrition</Text>
            <Text style={styles.subtitle}>Track your daily intake</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonGradient}
            >
              <Plus size={24} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.caloriesCard}>
          <LinearGradient
            colors={[Colors.orange, Colors.red]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.caloriesGradient}
          >
            <Flame size={32} color={Colors.white} />
            <View style={styles.caloriesContent}>
              <Text style={styles.caloriesValue}>{Math.round(totals.calories)}</Text>
              <Text style={styles.caloriesLabel}>of {dailyGoals.calories} cal</Text>
            </View>
            <View style={styles.caloriesProgress}>
              <View
                style={[
                  styles.caloriesProgressFill,
                  { width: `${Math.min((totals.calories / dailyGoals.calories) * 100, 100)}%` },
                ]}
              />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.macrosGrid}>
          <MacroProgress label="Protein" current={totals.protein} goal={dailyGoals.protein} color={Colors.blue} />
          <MacroProgress label="Carbs" current={totals.carbs} goal={dailyGoals.carbs} color={Colors.green} />
          <MacroProgress label="Fat" current={totals.fat} goal={dailyGoals.fat} color={Colors.purple} />
        </View>

        {MEAL_TYPES.map(meal => {
          const entries = getMealEntries(meal.value);
          const total = getMealTotal(meal.value);
          const Icon = meal.icon;

          return (
            <View key={meal.value} style={styles.mealSection}>
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleRow}>
                  <View style={[styles.mealIconWrapper, { backgroundColor: meal.color + '20' }]}>
                    <Icon size={20} color={meal.color} />
                  </View>
                  <Text style={styles.mealTitle}>{meal.label}</Text>
                </View>
                {total > 0 && (
                  <Text style={styles.mealTotal}>{Math.round(total)} cal</Text>
                )}
              </View>

              {entries.length === 0 ? (
                <TouchableOpacity
                  style={styles.addMealButton}
                  onPress={() => {
                    setMealType(meal.value);
                    setShowAddModal(true);
                  }}
                >
                  <Plus size={20} color={Colors.textMuted} />
                  <Text style={styles.addMealText}>Add {meal.label.toLowerCase()}</Text>
                </TouchableOpacity>
              ) : (
                entries.map(entry => (
                  <View key={entry.id} style={styles.foodEntry}>
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{entry.name}</Text>
                      <Text style={styles.foodServing}>{entry.servingSize}</Text>
                    </View>
                    <View style={styles.foodNutrition}>
                      <Text style={styles.foodCalories}>{Math.round(entry.calories)} cal</Text>
                      <Text style={styles.foodMacros}>
                        P: {Math.round(entry.protein)}g • C: {Math.round(entry.carbs)}g • F: {Math.round(entry.fat)}g
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Food</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Meal Type</Text>
              <View style={styles.mealTypeGrid}>
                {MEAL_TYPES.map(meal => {
                  const Icon = meal.icon;
                  return (
                    <TouchableOpacity
                      key={meal.value}
                      style={[
                        styles.mealTypeButton,
                        mealType === meal.value && { borderColor: meal.color, backgroundColor: meal.color + '20' },
                      ]}
                      onPress={() => setMealType(meal.value)}
                    >
                      <Icon size={20} color={mealType === meal.value ? meal.color : Colors.textMuted} />
                      <Text
                        style={[
                          styles.mealTypeLabel,
                          mealType === meal.value && { color: meal.color },
                        ]}
                      >
                        {meal.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputWithButton}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Food Name</Text>
                  <TextInput
                    style={styles.input}
                    value={foodName}
                    onChangeText={setFoodName}
                    placeholder="e.g., Grilled Chicken Breast"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                {Platform.OS !== 'web' && (
                  <TouchableOpacity
                    style={styles.scanButton}
                    onPress={handleOpenBarcodeScanner}
                    activeOpacity={0.7}
                  >
                    <ScanBarcode size={20} color={Colors.primary} />
                    <Text style={styles.scanButtonText}>Scan</Text>
                  </TouchableOpacity>
                )}
              </View>


              <Text style={styles.inputLabel}>Serving Size</Text>
              <TextInput
                style={styles.input}
                value={servingSize}
                onChangeText={setServingSize}
                placeholder="e.g., 150g or 1 cup"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.inputLabel}>Calories</Text>
              <TextInput
                style={styles.input}
                value={calories}
                onChangeText={setCalories}
                placeholder="250"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
              />

              <Text style={styles.sectionLabel}>Macronutrients (Optional)</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputThird}>
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.input}
                    value={protein}
                    onChangeText={setProtein}
                    placeholder="25"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.inputThird}>
                  <Text style={styles.inputLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.input}
                    value={carbs}
                    onChangeText={setCarbs}
                    placeholder="30"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.inputThird}>
                  <Text style={styles.inputLabel}>Fat (g)</Text>
                  <TextInput
                    style={styles.input}
                    value={fat}
                    onChangeText={setFat}
                    placeholder="10"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, (!foodName || !calories) && styles.submitButtonDisabled]}
                onPress={handleAddFood}
                disabled={!foodName || !calories}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.purple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>Add Food</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {Platform.OS !== 'web' && (
        <Modal
          visible={showBarcodeScanner}
          animationType="slide"
          onRequestClose={() => setShowBarcodeScanner(false)}
        >
          <View style={styles.scannerContainer}>
            <View style={styles.scannerHeader}>
              <Text style={styles.scannerTitle}>Scan Food Barcode</Text>
              <TouchableOpacity onPress={() => setShowBarcodeScanner(false)}>
                <X size={28} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <CameraView
              style={styles.camera}
              facing="back"
              enableTorch={true}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
              }}
              onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
            >
              <View style={styles.scanOverlay}>
                <View style={styles.scanFrame} />
                <Text style={styles.scanInstructions}>
                  Position the barcode within the frame
                </Text>
              </View>
            </CameraView>
          </View>
        </Modal>
      )}

      {isLookingUpBarcode && (
        <Modal transparent visible={isLookingUpBarcode}>
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Looking up product...</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    borderRadius: 20,
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  caloriesGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  caloriesContent: {
    flex: 1,
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  caloriesLabel: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    marginTop: 4,
  },
  caloriesProgress: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  caloriesProgressFill: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  macroCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  macroLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  macroGoal: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textMuted,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  mealSection: {
    marginBottom: 24,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mealIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  mealTotal: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  addMealButton: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addMealText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  foodEntry: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  foodInfo: {
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  foodServing: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  foodNutrition: {
    gap: 4,
  },
  foodCalories: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.orange,
  },
  foodMacros: {
    fontSize: 13,
    color: Colors.textSecondary,
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
    maxHeight: '90%',
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
  modalScroll: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputThird: {
    flex: 1,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  mealTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  mealTypeLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
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
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  scanButton: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 4,
  },
  scanButtonText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 200,
    borderWidth: 3,
    borderColor: Colors.white,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanInstructions: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    textAlign: 'center',
    paddingHorizontal: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
