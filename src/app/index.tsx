import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function Index() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('onboarding.welcome')}</Text>
      <Text style={styles.subtext}>YogaAgeProof AI - MVP Setup Complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F0E8',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#24543A',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    color: '#6F6A61',
  },
});
