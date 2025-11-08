import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  X,
  Calendar,
  ChefHat,
  ShoppingCart,
  Flame,
  Clock,
  Check,
  Trash2,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';

interface Recipe {
  id: string;
  name: string;
  calories: number;
  prepTime: number;
  ingredients: string[];
  instructions: string[];
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface MealPlan {
  id: string;
  date: string;
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
  snacks: Recipe[];
}

interface ShoppingListItem {
  id: string;
  name: string;
  checked: boolean;
  category: string;
}

const SAMPLE_RECIPES: Recipe[] = [
  {
    id: 'recipe-1',
    name: 'Greek Yogurt Bowl',
    calories: 320,
    prepTime: 5,
    category: 'breakfast',
    ingredients: ['1 cup Greek yogurt', '1/2 cup mixed berries', '2 tbsp granola', '1 tsp honey'],
    instructions: ['Add Greek yogurt to bowl', 'Top with berries and granola', 'Drizzle with honey'],
  },
  {
    id: 'recipe-2',
    name: 'Avocado Toast',
    calories: 280,
    prepTime: 10,
    category: 'breakfast',
    ingredients: ['2 slices whole grain bread', '1 ripe avocado', '1 egg', 'Salt and pepper'],
    instructions: ['Toast bread', 'Mash avocado and spread on toast', 'Cook egg and place on top', 'Season to taste'],
  },
  {
    id: 'recipe-3',
    name: 'Chicken Salad',
    calories: 420,
    prepTime: 15,
    category: 'lunch',
    ingredients: ['6 oz grilled chicken', '2 cups mixed greens', '1/4 cup cherry tomatoes', '2 tbsp olive oil dressing'],
    instructions: ['Grill chicken and slice', 'Combine greens and tomatoes', 'Top with chicken', 'Drizzle with dressing'],
  },
  {
    id: 'recipe-4',
    name: 'Quinoa Buddha Bowl',
    calories: 480,
    prepTime: 25,
    category: 'lunch',
    ingredients: ['1 cup cooked quinoa', '1/2 cup roasted chickpeas', '1 cup roasted vegetables', '2 tbsp tahini'],
    instructions: ['Cook quinoa', 'Roast chickpeas and vegetables', 'Combine in bowl', 'Drizzle with tahini'],
  },
  {
    id: 'recipe-5',
    name: 'Grilled Salmon',
    calories: 520,
    prepTime: 20,
    category: 'dinner',
    ingredients: ['6 oz salmon fillet', '1 cup broccoli', '1/2 cup brown rice', 'Lemon and herbs'],
    instructions: ['Season and grill salmon', 'Steam broccoli', 'Cook brown rice', 'Serve together'],
  },
  {
    id: 'recipe-6',
    name: 'Protein Smoothie',
    calories: 250,
    prepTime: 5,
    category: 'snack',
    ingredients: ['1 scoop protein powder', '1 banana', '1 cup almond milk', '1 tbsp peanut butter'],
    instructions: ['Combine all ingredients', 'Blend until smooth', 'Serve immediately'],
  },
];

export default function MealPlanningScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes] = useState<Recipe[]>(SAMPLE_RECIPES);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, shoppingData] = await Promise.all([
        AsyncStorage.getItem('@meal_plans'),
        AsyncStorage.getItem('@shopping_list'),
      ]);
      if (plansData) setMealPlans(JSON.parse(plansData));
      if (shoppingData) setShoppingList(JSON.parse(shoppingData));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveMealPlans = async (plans: MealPlan[]) => {
    try {
      await AsyncStorage.setItem('@meal_plans', JSON.stringify(plans));
      setMealPlans(plans);
    } catch (error) {
      console.error('Error saving meal plans:', error);
    }
  };

  const saveShoppingList = async (list: ShoppingListItem[]) => {
    try {
      await AsyncStorage.setItem('@shopping_list', JSON.stringify(list));
      setShoppingList(list);
    } catch (error) {
      console.error('Error saving shopping list:', error);
    }
  };

  const getCurrentPlan = (): MealPlan => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    let plan = mealPlans.find(p => p.date === dateStr);
    if (!plan) {
      plan = {
        id: `plan-${Date.now()}`,
        date: dateStr,
        snacks: [],
      };
    }
    return plan;
  };

  const addRecipeToPlan = async (recipe: Recipe) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    let plan = mealPlans.find(p => p.date === dateStr);
    
    if (!plan) {
      plan = {
        id: `plan-${Date.now()}`,
        date: dateStr,
        snacks: [],
      };
    }

    if (selectedMealType === 'snack') {
      plan.snacks = [...plan.snacks, recipe];
    } else {
      plan[selectedMealType] = recipe;
    }

    const updatedPlans = plan.id.includes('plan-')
      ? [...mealPlans.filter(p => p.date !== dateStr), plan]
      : mealPlans.map(p => (p.date === dateStr ? plan : p));

    await saveMealPlans(updatedPlans);
    setShowRecipeModal(false);
  };

  const removeRecipeFromPlan = async (mealType: string, snackIndex?: number) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const plan = mealPlans.find(p => p.date === dateStr);
    if (!plan) return;

    if (mealType === 'snack' && snackIndex !== undefined) {
      plan.snacks = plan.snacks.filter((_, i) => i !== snackIndex);
    } else {
      delete plan[mealType as 'breakfast' | 'lunch' | 'dinner'];
    }

    const updatedPlans = mealPlans.map(p => (p.date === dateStr ? plan : p));
    await saveMealPlans(updatedPlans);
  };

  const addToShoppingList = (recipe: Recipe) => {
    const newItems: ShoppingListItem[] = recipe.ingredients.map(ingredient => ({
      id: `item-${Date.now()}-${Math.random()}`,
      name: ingredient,
      checked: false,
      category: 'Ingredients',
    }));
    saveShoppingList([...shoppingList, ...newItems]);
  };

  const addCustomItem = () => {
    if (!newItem.trim()) return;
    const item: ShoppingListItem = {
      id: `item-${Date.now()}`,
      name: newItem,
      checked: false,
      category: 'Other',
    };
    saveShoppingList([...shoppingList, item]);
    setNewItem('');
  };

  const toggleShoppingItem = (id: string) => {
    const updated = shoppingList.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveShoppingList(updated);
  };

  const removeShoppingItem = (id: string) => {
    saveShoppingList(shoppingList.filter(item => item.id !== id));
  };

  const clearCheckedItems = () => {
    saveShoppingList(shoppingList.filter(item => !item.checked));
  };

  const currentPlan = getCurrentPlan();
  const totalCalories = [
    currentPlan.breakfast?.calories || 0,
    currentPlan.lunch?.calories || 0,
    currentPlan.dinner?.calories || 0,
    ...currentPlan.snacks.map(s => s.calories),
  ].reduce((sum, cal) => sum + cal, 0);

  const filteredRecipes = recipes.filter(r => r.category === selectedMealType);
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Meal Planning</Text>
        <TouchableOpacity onPress={() => setShowShoppingList(true)}>
          <ShoppingCart size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate);
            }}
          >
            <Text style={styles.dateButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.dateInfo}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </View>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setSelectedDate(newDate);
            }}
          >
            <Text style={styles.dateButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calorieCard}>
          <Flame size={24} color={Colors.accent} />
          <Text style={styles.calorieValue}>{totalCalories}</Text>
          <Text style={styles.calorieLabel}>Total Calories</Text>
        </View>

        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Breakfast</Text>
          {currentPlan.breakfast ? (
            <View style={styles.mealCard}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{currentPlan.breakfast.name}</Text>
                <View style={styles.mealMeta}>
                  <Flame size={14} color={Colors.accent} />
                  <Text style={styles.mealMetaText}>{currentPlan.breakfast.calories} cal</Text>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.mealMetaText}>{currentPlan.breakfast.prepTime} min</Text>
                </View>
              </View>
              <View style={styles.mealActions}>
                <TouchableOpacity onPress={() => addToShoppingList(currentPlan.breakfast!)}>
                  <ShoppingCart size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeRecipeFromPlan('breakfast')}>
                  <Trash2 size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptyMealCard}
              onPress={() => {
                setSelectedMealType('breakfast');
                setShowRecipeModal(true);
              }}
            >
              <Plus size={24} color={Colors.textMuted} />
              <Text style={styles.emptyMealText}>Add Breakfast</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Lunch</Text>
          {currentPlan.lunch ? (
            <View style={styles.mealCard}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{currentPlan.lunch.name}</Text>
                <View style={styles.mealMeta}>
                  <Flame size={14} color={Colors.accent} />
                  <Text style={styles.mealMetaText}>{currentPlan.lunch.calories} cal</Text>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.mealMetaText}>{currentPlan.lunch.prepTime} min</Text>
                </View>
              </View>
              <View style={styles.mealActions}>
                <TouchableOpacity onPress={() => addToShoppingList(currentPlan.lunch!)}>
                  <ShoppingCart size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeRecipeFromPlan('lunch')}>
                  <Trash2 size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptyMealCard}
              onPress={() => {
                setSelectedMealType('lunch');
                setShowRecipeModal(true);
              }}
            >
              <Plus size={24} color={Colors.textMuted} />
              <Text style={styles.emptyMealText}>Add Lunch</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Dinner</Text>
          {currentPlan.dinner ? (
            <View style={styles.mealCard}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{currentPlan.dinner.name}</Text>
                <View style={styles.mealMeta}>
                  <Flame size={14} color={Colors.accent} />
                  <Text style={styles.mealMetaText}>{currentPlan.dinner.calories} cal</Text>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.mealMetaText}>{currentPlan.dinner.prepTime} min</Text>
                </View>
              </View>
              <View style={styles.mealActions}>
                <TouchableOpacity onPress={() => addToShoppingList(currentPlan.dinner!)}>
                  <ShoppingCart size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeRecipeFromPlan('dinner')}>
                  <Trash2 size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptyMealCard}
              onPress={() => {
                setSelectedMealType('dinner');
                setShowRecipeModal(true);
              }}
            >
              <Plus size={24} color={Colors.textMuted} />
              <Text style={styles.emptyMealText}>Add Dinner</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Snacks</Text>
          {currentPlan.snacks.map((snack, index) => (
            <View key={`snack-${index}`} style={styles.mealCard}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{snack.name}</Text>
                <View style={styles.mealMeta}>
                  <Flame size={14} color={Colors.accent} />
                  <Text style={styles.mealMetaText}>{snack.calories} cal</Text>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.mealMetaText}>{snack.prepTime} min</Text>
                </View>
              </View>
              <View style={styles.mealActions}>
                <TouchableOpacity onPress={() => addToShoppingList(snack)}>
                  <ShoppingCart size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeRecipeFromPlan('snack', index)}>
                  <Trash2 size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.emptyMealCard}
            onPress={() => {
              setSelectedMealType('snack');
              setShowRecipeModal(true);
            }}
          >
            <Plus size={24} color={Colors.textMuted} />
            <Text style={styles.emptyMealText}>Add Snack</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showRecipeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
              </Text>
              <TouchableOpacity onPress={() => setShowRecipeModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.recipeList}>
              {filteredRecipes.map(recipe => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeItem}
                  onPress={() => addRecipeToPlan(recipe)}
                >
                  <View style={styles.recipeIcon}>
                    <ChefHat size={24} color={Colors.primary} />
                  </View>
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeName}>{recipe.name}</Text>
                    <View style={styles.recipeMeta}>
                      <Flame size={14} color={Colors.accent} />
                      <Text style={styles.recipeMetaText}>{recipe.calories} cal</Text>
                      <Clock size={14} color={Colors.textSecondary} />
                      <Text style={styles.recipeMetaText}>{recipe.prepTime} min</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showShoppingList} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Shopping List</Text>
              <View style={styles.modalActions}>
                {shoppingList.some(item => item.checked) && (
                  <TouchableOpacity style={styles.clearBtn} onPress={clearCheckedItems}>
                    <Text style={styles.clearBtnText}>Clear Checked</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowShoppingList(false)}>
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder="Add item..."
                placeholderTextColor={Colors.textMuted}
                value={newItem}
                onChangeText={setNewItem}
                onSubmitEditing={addCustomItem}
              />
              <TouchableOpacity style={styles.addItemBtn} onPress={addCustomItem}>
                <Plus size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.shoppingListScroll}>
              {shoppingList.length === 0 ? (
                <View style={styles.emptyShoppingList}>
                  <ShoppingCart size={64} color={Colors.textMuted} />
                  <Text style={styles.emptyShoppingText}>No items yet</Text>
                  <Text style={styles.emptyShoppingDesc}>
                    Add ingredients from meals or add custom items
                  </Text>
                </View>
              ) : (
                shoppingList.map(item => (
                  <View key={item.id} style={styles.shoppingItem}>
                    <TouchableOpacity
                      style={styles.shoppingCheckbox}
                      onPress={() => toggleShoppingItem(item.id)}
                    >
                      <View
                        style={[styles.checkbox, item.checked && styles.checkboxChecked]}
                      >
                        {item.checked && <Check size={16} color={Colors.white} />}
                      </View>
                      <Text
                        style={[
                          styles.shoppingItemText,
                          item.checked && styles.shoppingItemTextChecked,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeShoppingItem(item.id)}>
                      <Trash2 size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
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
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 20,
    color: Colors.text,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  calorieCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calorieValue: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
  },
  calorieLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  mealsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  mealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mealMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  mealActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyMealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: 8,
  },
  emptyMealText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500' as const,
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
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearBtn: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  recipeList: {
    padding: 20,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recipeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recipeMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  addItemContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addItemBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shoppingListScroll: {
    padding: 20,
  },
  emptyShoppingList: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyShoppingText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyShoppingDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shoppingCheckbox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  shoppingItemText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  shoppingItemTextChecked: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
});
