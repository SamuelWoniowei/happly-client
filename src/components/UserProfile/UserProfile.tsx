import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { APP_BLACK, HABIT_OPTION } from '../../styles'
import Icon from 'react-native-vector-icons/Ionicons'

export const UserProfile = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image style={styles.image} source={require('../../assets/channels4_profile.png')}
        />
        <View>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome</Text><Text>👋</Text>
          </View>
          <Text style={styles.username}>James Odeyale</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('CustomStack', { screen: 'Settings' })}>
        <Icon name='settings' size={25} color={APP_BLACK} />
      </TouchableOpacity>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '58%'
  },
  welcomeContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 5
  },
  welcomeText: {
    fontFamily: 'Inter_600SemiBold',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    color: HABIT_OPTION,
    opacity: 0.5,
    marginRight: 5
  },
  username: {
    fontFamily: 'Inter_700Bold',
    fontStyle: 'normal',
    fontSize: 20,
    lineHeight: 24,
    color: '#000000'
  }
})