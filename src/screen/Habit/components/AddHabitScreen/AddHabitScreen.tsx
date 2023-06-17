import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CustomTextInput } from '../../../../components'
import Icon from 'react-native-vector-icons/Ionicons'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { DayOfTheWeek, Frequency, TimeOfDay } from '@shared/types'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { editHabitAtom, selectedDayOfTheWeekAtom, userAtom } from '@state/state'
import { generateHabitId } from '../../../../generators/generateId'
import { Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter'
import {
  APP_BLACK,
  APP_BLUE,
  APP_GRAY, APP_LIGHT_GRAY,
  APP_PINK,
  APP_RED,
  APP_WHITE,
  GRAY_TEXT,
  MAIN_ACCENT_COLOR
} from '@styles/colors'
import { ActionCreateHabit } from '@actions/actionCreateHabit'
import { ActionCreateOrUpdateStreak } from '@actions/actionCreateOrUpdateStreak'
import { useToast } from 'react-native-toast-notifications'
import { NotificationModal } from '@screen/Modals'
import { formatAMPM } from '@utils/timeUtils'


export const AddHabitScreen = () => {
  const toast = useToast()

  const user = useAtomValue(userAtom)
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
  const [editHabit, setEditHabit] = useAtom(editHabitAtom)
  const setSelectedDay = useSetAtom(selectedDayOfTheWeekAtom)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [timeOfDay, setTimeOfDay] = useState(TimeOfDay.Morning)
  const [dayOfWeek, setDayOfWeek] = useState<DayOfTheWeek>(DayOfTheWeek.Monday)
  const [frequencyOption, setFrequencyOption] = useState<Frequency>(Frequency.Daily)
  const [isEnabled, setIsEnabled] = useState(true)
  const [reminderAt, setReminderAt] = useState<string[]>([])

  const [nameError, setNameError] = useState('')
  const [showNotificationModal, setShowNotificationModal] = useState(false)

  useEffect(() => {
      if (editHabit) {
        setName(editHabit.name)
        setDescription(editHabit.description)
        setTimeOfDay(editHabit.timeOfDay)
        setDayOfWeek(editHabit.dayOfWeek)
        setFrequencyOption(editHabit.frequencyOption)
        setReminderAt(editHabit.reminderAt)
      }
    },
    [editHabit])

  const createHabit = async () => {
    if (!name) {
      setNameError('Please enter a name')
      return
    }

    if (!editHabit) {
      const habit = await ActionCreateHabit({
        id: generateHabitId(),
        name,
        description,
        userId: user.id,
        timeOfDay,
        dayOfWeek,
        frequencyOption,
        createdAt: new Date(),
        reminderAt
      })

      if (!habit) {
        toast.show('Something went wrong', {
          type: 'danger',
          duration: 4000,
          placement: 'bottom',
          icon: <Icon name='alert-circle-sharp' size={20} color={APP_WHITE} />
        })
        return
      }

      await ActionCreateOrUpdateStreak(habit.id, habit.userId)


      toast.show('Habit created successfully', {
        type: 'success',
        duration: 4000,
        placement: 'bottom',
        icon: <Icon name='checkmark-circle-sharp' size={20} color={APP_WHITE} />
      })
    } else {
      await ActionCreateHabit({
          id: editHabit.id,
          name,
          description,
          userId: user.id,
          timeOfDay,
          dayOfWeek,
          frequencyOption,
          createdAt: editHabit?.createdAt,
          reminderAt
        }
      )

      setEditHabit(null)
    }

    clearStates()
    setSelectedDay(new Date())
    navigation.goBack()
  }

  const clearStates = () => {
    setName('')
    setDescription('')
    setTimeOfDay(TimeOfDay.Morning)
    setDayOfWeek(DayOfTheWeek.Monday)
    setFrequencyOption(Frequency.Daily)
    setNameError('')
  }

  const handleTimeSelected = (selectedDate: Date) => {
    const selectedTime = formatAMPM(selectedDate)
    const doesExist = reminderAt.includes(selectedTime)

    if (!doesExist) {
      setReminderAt([...reminderAt, selectedTime])
    } else {
      Alert.alert('Time has been previously selected')
    }
    setShowNotificationModal(false)
  }

  const removeReminder = (reminder: string) => {
    const filtered = reminderAt.filter((item) => item !== reminder)
    setReminderAt(filtered)
  }

  const toggleSwitch = (isEnabled: boolean) => {
    if (!isEnabled) {
      setReminderAt([])
    }
    setIsEnabled(isEnabled)
  }

  const handleReminderAt = (time: string) => {
    const doesExist = reminderAt.includes(time)

    if (doesExist) {
      const filtered = reminderAt.filter((item) => item !== time)
      setReminderAt(filtered)
    } else {
      setReminderAt([...reminderAt, time])
    }
  }

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_700Bold
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <>
      <ScrollView style={{ marginBottom: 110 }}>
        <SafeAreaView style={styles.wrapper}>
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setEditHabit(null)
                  navigation.goBack()
                }}>
                <Icon name='close' size={25} color={APP_RED} />
              </TouchableOpacity>
              <Text style={styles.headerText}>New <Text
                style={{ ...styles.headerText, color: '#9D9797' }}> Habit</Text></Text>
            </View>
            <View>
              <CustomTextInput bigLabel='Name' placeholder='Enter the name'
                               handleChange={setName}
                               handleBlur={() => {
                               }}
                               value={name}
                               error={nameError}
              />
              <CustomTextInput bigLabel='Description' placeholder='Enter the description'
                               handleChange={setDescription}
                               handleBlur={() => {
                               }}
                               value={description}
              />
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>How often do you want to do it?</Text>
                <View style={styles.frequencyOptions}>
                  <TouchableOpacity
                    style={{
                      ...styles.frequencyOption,
                      marginRight: 15,
                      backgroundColor: frequencyOption === Frequency.Daily ? APP_BLACK : APP_GRAY
                    }}
                    onPress={() => setFrequencyOption(Frequency.Daily)}>
                    <Text style={{
                      ...styles.frequencyOptionTitle,
                      color: frequencyOption === Frequency.Daily ? APP_WHITE : APP_BLACK
                    }}>Daily</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      ...styles.frequencyOption,
                      backgroundColor: frequencyOption === Frequency.Weekly ? APP_BLACK : APP_GRAY
                    }}
                    onPress={() => setFrequencyOption(Frequency.Weekly)}>
                    <Text style={{
                      ...styles.frequencyOptionTitle,
                      color: frequencyOption === Frequency.Weekly ? APP_WHITE : APP_BLACK
                    }}>Weekly</Text>
                  </TouchableOpacity>

                </View>
              </View>

              {/*<View style={styles.sectionContainer}>*/}
              {/*  <Text style={styles.sectionTitle}>Every?</Text>*/}
              {/*  <View style={styles.everyOption}>*/}
              {/*    <TouchableOpacity*/}
              {/*      style={{*/}
              {/*        ...styles.frequencyOption,*/}
              {/*        width: 35,*/}
              {/*        height: 35*/}
              {/*      }}*/}
              {/*      onPress={() => setFrequencyOption('daily')}><Icon name='remove-outline' size={20} color={APP_BLACK} />*/}
              {/*    </TouchableOpacity>*/}

              {/*    <Text style={{ marginRight: 10, marginLeft: 10 }}>1 week</Text>*/}
              {/*    <TouchableOpacity*/}
              {/*      style={{*/}
              {/*        ...styles.frequencyOption,*/}
              {/*        backgroundColor: APP_BLACK,*/}
              {/*        width: 35,*/}
              {/*        height: 35*/}
              {/*      }}*/}
              {/*      onPress={() => setFrequencyOption('daily')}><Icon name='ios-add-sharp' size={20} color={APP_WHITE} />*/}
              {/*    </TouchableOpacity>*/}

              {/*  </View>*/}
              {/*</View>*/}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>In which time of the day would you like to do it?</Text>
                <View style={styles.periodContainer}>
                  <TouchableOpacity
                    style={{
                      ...styles.periodOption,
                      backgroundColor: timeOfDay === TimeOfDay.Morning ? APP_BLUE : APP_GRAY
                    }}
                    onPress={() => setTimeOfDay(TimeOfDay.Morning)}>
                    <Image style={{
                      width: 15,
                      height: 15,
                      marginRight: 8
                    }} source={require('../../../../assets/svgs/sunrise1.png')} />
                    <Text style={{
                      ...styles.periodOptionTitle,
                      color: timeOfDay === TimeOfDay.Morning ? APP_WHITE : APP_BLACK
                    }}>Morning</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      ...styles.periodOption,
                      backgroundColor: timeOfDay === TimeOfDay.Afternoon ? APP_BLUE : APP_GRAY
                    }}
                    onPress={() => setTimeOfDay(TimeOfDay.Afternoon)}>
                    <Image style={{
                      width: 15,
                      height: 15,
                      marginRight: 8
                    }} source={require('../../../../assets/svgs/sun1.png')} />
                    <Text style={{
                      ...styles.periodOptionTitle,
                      color: timeOfDay === TimeOfDay.Afternoon ? APP_WHITE : APP_BLACK
                    }}>Afternoon</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      ...styles.periodOption,
                      backgroundColor: timeOfDay === TimeOfDay.Evening ? APP_BLUE : APP_GRAY
                    }}
                    onPress={() => setTimeOfDay(TimeOfDay.Evening)}>
                    <Image style={{
                      width: 15,
                      height: 15,
                      marginRight: 8
                    }} source={require('../../../../assets/svgs/crescent-moon1.png')} />
                    <Text style={{
                      ...styles.periodOptionTitle,
                      color: timeOfDay === TimeOfDay.Evening ? APP_WHITE : APP_BLACK
                    }}>Evening</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10
                  }}>
                  <Text style={styles.sectionTitle}>Should we remind you?</Text>
                </View>

                <View style={styles.reminderContainer}>
                  <View style={styles.reminderTimeContainer}>
                    {reminderAt.map((reminder, index) => (
                      <View key={index} style={styles.reminderWrapper}>
                        <View style={styles.reminderTextContainer}>
                          <Icon name='alarm-outline' size={20} color={APP_BLACK} style={{ marginRight: 5 }} />
                          <Text style={styles.reminderText}>{reminder}</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeReminder(reminder)}>
                          <Icon name='ios-close-circle-outline' size={20} color={APP_BLACK} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.reminderTime}
                    onPress={() => setShowNotificationModal(true)}>
                    <Icon name='ios-add-circle-sharp' size={20} color={APP_BLACK} style={{ marginRight: 5 }} />
                    <Text style={styles.periodOptionTitle}>
                      {reminderAt.length < 1 ? 'Add a reminder' : 'Add another reminder'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={createHabit}>
              <Text style={styles.createButtonText}>CREATE</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>
      {showNotificationModal && <NotificationModal
        handleTimeSelected={handleTimeSelected}
        closeNotificationModal={() => setShowNotificationModal(false)} />
      }
    </>
  )
}


const styles = StyleSheet.create({
  reminderTimeContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
    backgroundColor: APP_GRAY,
    width: '100%'
  },
  reminderWrapper: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: APP_LIGHT_GRAY,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  reminderTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    width: '90%'
  },
  reminderText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 19,
    color: APP_BLACK,
    marginLeft: 5
  },
  wrapper: {
    backgroundColor: '#F4F3F3',
    flex: 1
  },
  container: {
    padding: 20
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  closeButton: {
    marginRight: 40,
    backgroundColor: APP_PINK,
    borderRadius: 6,
    width: 40,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 30,
    lineHeight: 36,
    color: APP_BLACK,
    display: 'flex'
  },
  sectionContainer: {
    marginBottom: 20
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 22,
    color: GRAY_TEXT,
    marginBottom: 10
  },
  frequencyOptions: {
    display: 'flex',
    flexDirection: 'row'

  },
  frequencyOption: {
    backgroundColor: APP_GRAY,
    borderRadius: 6,
    width: 80,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  frequencyOptionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 22,
    color: GRAY_TEXT
  },
  everyOption: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  periodContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20
  },
  periodOption: {
    backgroundColor: APP_GRAY,
    borderRadius: 10,
    width: 110,
    height: 40,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  periodOptionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 22,
    color: GRAY_TEXT,
    textAlign: 'center',
    display: 'flex'
  },
  reminderContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%'
  },
  reminderTime: {
    backgroundColor: APP_GRAY,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    width: '100%',
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10
  },
  reminderTimeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 22,
    color: GRAY_TEXT,
    marginRight: 5
  },
  createButton: {
    backgroundColor: MAIN_ACCENT_COLOR,
    borderRadius: 8,
    color: APP_WHITE,
    padding: 15
  },
  createButtonText: {
    fontFamily: 'Inter_700Bold',
    color: APP_WHITE,
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center'
  }
})
