import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Scale, User, TrendingUp, TrendingDown, Activity, Info, Calculator, Target } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFitness } from '@/contexts/FitnessContext';



type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export default function BodyCompositionScreen() {
  const { user, weightEntries } = useFitness();
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [gender, setGender] = useState(user?.gender || 'male');

  const [waist, setWaist] = useState('');
  const [neck, setNeck] = useState('');
  const [hips, setHips] = useState('');

  const calculateBMI = (): number | null => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h) return null;
    const heightInMeters = h / 100;
    return w / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi: number): BMICategory => {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  };

  const getBMICategoryInfo = (category: BMICategory) => {
    switch (category) {
      case 'underweight':
        return {
          label: 'Underweight',
          color: Colors.cyan,
          advice: 'Consider consulting a healthcare provider about healthy weight gain strategies.',
        };
      case 'normal':
        return {
          label: 'Normal Weight',
          color: Colors.green,
          advice: 'Great! Maintain your healthy lifestyle with balanced diet and regular exercise.',
        };
      case 'overweight':
        return {
          label: 'Overweight',
          color: Colors.orange,
          advice: 'Consider increasing physical activity and focusing on nutrient-dense foods.',
        };
      case 'obese':
        return {
          label: 'Obese',
          color: Colors.red,
          advice: 'Consult with healthcare provider for personalized weight management plan.',
        };
    }
  };

  const calculateBodyFat = (): number | null => {
    const w = parseFloat(waist);
    const n = parseFloat(neck);
    const h = parseFloat(height);
    
    if (!w || !n || !h) return null;

    if (gender === 'male') {
      return 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    } else {
      const hip = parseFloat(hips);
      if (!hip) return null;
      return 495 / (1.29579 - 0.35004 * Math.log10(w + hip - n) + 0.22100 * Math.log10(h)) - 450;
    }
  };

  const getBodyFatCategory = (bf: number) => {
    if (gender === 'male') {
      if (bf < 6) return { label: 'Essential', color: Colors.cyan };
      if (bf < 14) return { label: 'Athletic', color: Colors.green };
      if (bf < 18) return { label: 'Fitness', color: Colors.blue };
      if (bf < 25) return { label: 'Average', color: Colors.orange };
      return { label: 'Obese', color: Colors.red };
    } else {
      if (bf < 14) return { label: 'Essential', color: Colors.cyan };
      if (bf < 21) return { label: 'Athletic', color: Colors.green };
      if (bf < 25) return { label: 'Fitness', color: Colors.blue };
      if (bf < 32) return { label: 'Average', color: Colors.orange };
      return { label: 'Obese', color: Colors.red };
    }
  };

  const calculateIdealWeight = (): { min: number; max: number } | null => {
    const h = parseFloat(height);
    if (!h) return null;
    const heightInMeters = h / 100;
    return {
      min: Math.round(18.5 * heightInMeters * heightInMeters),
      max: Math.round(24.9 * heightInMeters * heightInMeters),
    };
  };

  const getWeightTrend = () => {
    if (weightEntries.length < 2) return null;
    const sorted = [...weightEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const oldest = sorted[0].weight;
    const newest = sorted[sorted.length - 1].weight;
    const change = newest - oldest;
    return {
      change: Math.abs(change),
      direction: change > 0 ? 'up' : 'down',
    };
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const bmiInfo = bmiCategory ? getBMICategoryInfo(bmiCategory) : null;
  const calculatedBodyFat = calculateBodyFat();
  const bodyFatInfo = calculatedBodyFat ? getBodyFatCategory(calculatedBodyFat) : null;
  const idealWeight = calculateIdealWeight();
  const weightTrend = getWeightTrend();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Body Composition',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Your Information</Text>
          </View>

          <View style={styles.inputGrid}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="70"
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="175"
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="30"
                keyboardType="number-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                  onPress={() => setGender('male')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                  onPress={() => setGender('female')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {bmi && bmiInfo && (
          <View style={styles.resultCard}>
            <LinearGradient
              colors={[bmiInfo.color, bmiInfo.color + 'CC']}
              style={styles.resultGradient}
            >
              <View style={styles.resultHeader}>
                <Scale size={28} color={Colors.white} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>Body Mass Index</Text>
                  <Text style={styles.resultValue}>{bmi.toFixed(1)}</Text>
                </View>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{bmiInfo.label}</Text>
              </View>
              <Text style={styles.resultAdvice}>{bmiInfo.advice}</Text>
            </LinearGradient>
          </View>
        )}

        {idealWeight && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Target size={20} color={Colors.green} />
              <Text style={styles.infoTitle}>Ideal Weight Range</Text>
            </View>
            <Text style={styles.infoValue}>
              {idealWeight.min} - {idealWeight.max} kg
            </Text>
            <Text style={styles.infoDescription}>
              Based on healthy BMI range (18.5-24.9) for your height
            </Text>
          </View>
        )}

        {weightTrend && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              {weightTrend.direction === 'down' ? (
                <TrendingDown size={20} color={Colors.green} />
              ) : (
                <TrendingUp size={20} color={Colors.orange} />
              )}
              <Text style={styles.infoTitle}>Weight Trend</Text>
            </View>
            <Text style={[
              styles.infoValue,
              { color: weightTrend.direction === 'down' ? Colors.green : Colors.orange }
            ]}>
              {weightTrend.direction === 'down' ? '-' : '+'}{weightTrend.change.toFixed(1)} kg
            </Text>
            <Text style={styles.infoDescription}>
              {weightTrend.direction === 'down' ? 'You\'re making progress!' : 'Keep working toward your goals!'}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calculator size={20} color={Colors.purple} />
            <Text style={styles.sectionTitle}>Body Fat Calculator</Text>
          </View>
          <Text style={styles.sectionSubtitle}>U.S. Navy Method - Requires measurements</Text>

          <View style={styles.inputGrid}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Waist (cm)</Text>
              <TextInput
                style={styles.input}
                value={waist}
                onChangeText={setWaist}
                placeholder="85"
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Neck (cm)</Text>
              <TextInput
                style={styles.input}
                value={neck}
                onChangeText={setNeck}
                placeholder="38"
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {gender === 'female' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hips (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={hips}
                  onChangeText={setHips}
                  placeholder="95"
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            )}
          </View>
        </View>

        {calculatedBodyFat && bodyFatInfo && (
          <View style={styles.resultCard}>
            <LinearGradient
              colors={[bodyFatInfo.color, bodyFatInfo.color + 'CC']}
              style={styles.resultGradient}
            >
              <View style={styles.resultHeader}>
                <Activity size={28} color={Colors.white} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>Body Fat Percentage</Text>
                  <Text style={styles.resultValue}>{calculatedBodyFat.toFixed(1)}%</Text>
                </View>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{bodyFatInfo.label}</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={styles.infoBox}>
          <Info size={20} color={Colors.primary} />
          <View style={styles.infoBoxContent}>
            <Text style={styles.infoBoxTitle}>About These Calculations</Text>
            <Text style={styles.infoBoxText}>{`BMI is a simple screening tool. It doesn't measure body fat directly and may not be accurate for athletes with high muscle mass.`}</Text>
            <Text style={styles.infoBoxText}>
              Body fat percentage provides a more complete picture. The Navy Method is reasonably accurate for most people.
            </Text>
            <Text style={styles.infoBoxText}>
              For the most accurate results, consider professional body composition testing (DEXA, hydrostatic weighing, etc.).
            </Text>
          </View>
        </View>

        <View style={styles.rangesCard}>
          <Text style={styles.rangesTitle}>Healthy Body Fat Ranges</Text>
          
          <View style={styles.rangesSection}>
            <Text style={styles.rangesGender}>Men</Text>
            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>Essential:</Text>
              <Text style={styles.rangeValue}>2-5%</Text>
            </View>
            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>Athletic:</Text>
              <Text style={styles.rangeValue}>6-13%</Text>
            </View>
            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>Fitness:</Text>
              <Text style={styles.rangeValue}>14-17%</Text>
            </View>
            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>Average:</Text>
              <Text style={styles.rangeValue}>18-24%</Text>
            </View>
          </View>

          <View style={styles.rangesSection}>
            <Text style={styles.rangesGender}>Women</Text>
            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>Essential:</Text>
              <Text style={styles.rangeValue}>10-13%</Text>
            </View>
            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>Athletic:</Text>
              <Text style={styles.rangeValue}>14-20%</Text>
            </View>
            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>Fitness:</Text>
              <Text style={styles.rangeValue}>21-24%</Text>
            </View>
            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>Average:</Text>
              <Text style={styles.rangeValue}>25-31%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  inputGrid: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  genderTextActive: {
    color: Colors.white,
  },
  resultCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resultGradient: {
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultAdvice: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  infoValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    gap: 12,
  },
  infoBoxContent: {
    flex: 1,
    gap: 8,
  },
  infoBoxTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  infoBoxText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  rangesCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rangesTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  rangesSection: {
    marginBottom: 20,
  },
  rangesGender: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rangeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
