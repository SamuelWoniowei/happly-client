import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ROUTES } from '../constants'
import { useAtomValue } from 'jotai'
import { selectedDayOfTheWeekAtom, userAtom } from '~state'
import { APP_BLACK, HABIT_OPTION } from '~styles'
import moment from 'moment/moment'

export const UserProfile = () => {
  const { navigate } = useNavigation<NativeStackNavigationProp<ParamListBase>>()
  const user = useAtomValue(userAtom)
  const selectedDay = useAtomValue(selectedDayOfTheWeekAtom)
  const monthNumber = moment(selectedDay, 'MMMM Do YYYY').month()
  const year = moment(selectedDay, 'MMMM Do YYYY').year()
  const month = moment.months(monthNumber)

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View>
          {/*<View style={styles.welcomeContainer}>*/}
          {/*  <Text style={styles.welcomeText}>Welcome</Text><Text> James 👋</Text>*/}
          {/*</View>*/}
          <Text style={styles.username}>{month} {year}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => navigate(ROUTES.CUSTOM_STACK, { screen: 'Settings' })}>
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
