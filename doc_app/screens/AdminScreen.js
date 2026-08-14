import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back, Superuser</Text>
        </View>

        {/* Dummy Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1,204</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>85</Text>
            <Text style={styles.statLabel}>Active Reports</Text>
          </View>
        </View>

        {/* Admin Action Buttons */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => alert('Manage Users clicked!')}>
          <Text style={styles.actionButtonText}>👥 Manage Users</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => alert('View Reports clicked!')}>
          <Text style={styles.actionButtonText}>📊 View Farm Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => alert('System Settings clicked!')}>
          <Text style={styles.actionButtonText}>⚙️ System Settings</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAF8' },
  content: { padding: 20 },
  header: { marginBottom: 30, marginTop: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { 
    backgroundColor: '#FFF', 
    flex: 1, 
    marginHorizontal: 5, 
    padding: 20, 
    borderRadius: 12, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#608151' },
  statLabel: { fontSize: 14, color: '#666', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  actionButton: { 
    backgroundColor: '#FFF', 
    padding: 18, 
    borderRadius: 10, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#E0E0E0',
  },
  actionButtonText: { fontSize: 16, color: '#333', fontWeight: '500' },
  logoutButton: { 
    marginTop: 30, 
    padding: 15, 
    alignItems: 'center' 
  },
  logoutButtonText: { color: '#E53935', fontSize: 16, fontWeight: 'bold' }
});