import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { CustomButton, CustomCalendar } from "~components";
import Icon from "react-native-vector-icons/Ionicons";
import { StreakIcon } from "~assets";
import { ROUTES } from "../constants";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  editHabitAtom,
  selectedDayOfTheWeekAtom,
  selectedHabitAtom,
  showDeleteModalAtom
} from "~state";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Habit, HabitType, Stats, Streak } from "~types";
import {
  ActionGetStatsByHabitId,
  ActionGetStreakByHabitId,
  ActionGetUserHabitByIdDoc
} from "~actions";
import { useToast } from "react-native-toast-notifications";
import { DeleteHabitModal } from "~modals";
import { onSnapshot } from "firebase/firestore";
import { findClosestReminder } from "~utils/timeUtils";
import { DateData } from "react-native-calendars";
import moment from "moment";
import {
  checkIfChallengeIsCompleted,
  markHabitAsDone,
  validateHabitStreak,
  useMetric
} from "~utils";
import { useTheme } from "~hooks";

export const HabitScreen = ({ navigation }) => {
  const toast = useToast();
  const { theme } = useTheme();
  const { horizontalScale, verticalScale, moderateScale } = useMetric();
  const { navigate } = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const currentDate = moment().format("YYYY-MM-DD");
  const [selectedHabit, setSelectedHabit] = useAtom(selectedHabitAtom);
  const setEditHabit = useSetAtom(editHabitAtom);
  const [, setDeleteModal] = useAtom(showDeleteModalAtom);
  const selectedDay = useAtomValue(selectedDayOfTheWeekAtom);

  const [habit, setHabit] = useState<Habit | null>(null);
  const [stats, setStats] = useState<Stats[] | null>([]);
  const [streak, setStreak] = useState<Streak | null>(null);

  useEffect(() => {
    // TODO: Add loading state
    let isMounted = true;
    let currentMonth = moment(currentDate).month() + 1;

    if (isMounted) {
      getHabitById();
      getHabitStats(currentMonth);
      getHabitStreak();
    }

    return () => {
      isMounted = false;
      setSelectedHabit(null);
      setDeleteModal(false);
    };
  }, []);

  const getHabitById = async () => {
    const dataDocumentSnapshot = ActionGetUserHabitByIdDoc(selectedHabit.id);

    const subscription = onSnapshot(dataDocumentSnapshot, (doc) => {
      if (!doc.exists) {
        return;
      }

      const data = doc.data() as unknown as Habit;

      if (data) {
        setHabit(data);
      }
    });

    return () => subscription();
  };

  const handleMonthChange = async (month: DateData) => {
    await getHabitStats(month.month);
  };

  const getHabitStats = async (currentMonth) => {
    const docs = await ActionGetStatsByHabitId(selectedHabit.id);
    if (!docs) return;

    const progress: Stats[] = [];
    docs.forEach((doc) => {
      const data = doc.data() as unknown as Stats;
      if (new Date(data.completedAt).getMonth() + 1 === currentMonth) {
        progress.push(data);
      }
    });

    setStats(progress);
  };

  const getHabitStreak = async () => {
    const docs = await ActionGetStreakByHabitId(selectedHabit.id);

    if (!docs) return;

    const streaks: Streak[] = [];
    docs.forEach((doc) => {
      const data = doc.data() as unknown as Streak;
      streaks.push(data);
    });

    const streak = await validateHabitStreak(streaks[0], selectedHabit, stats);

    setStreak(streak);
  };

  const handleOnPressEdit = () => {
    setEditHabit(habit);
    setSelectedHabit(null);
    navigate(ROUTES.CREATE_HABIT);
  };

  const handleOnPressPause = () => {
    console.log("Hey there pausing");
  };

  const handleOnPressDelete = () => {
    setDeleteModal(true);
    setSelectedHabit(habit);
  };

  const handleOnPressMarkAsDone = async () => {
    const { message, stat } = await markHabitAsDone({
      habit,
      selectedDay,
      isHabitCard: true
    });

    if (!stat) {
      toast.show(message, {
        type: "danger",
        duration: 4000,
        placement: "bottom",
        icon: <Icon name='alert-circle' size={moderateScale(20)} color={theme.APP_WHITE} />
      });
      return;
    }
    if (habit.type === HabitType.REGULAR) {
      toast.show(message, {
        type: "success",
        duration: 4000,
        placement: "bottom",
        icon: <Icon name='trending-up' size={moderateScale(20)} color={theme.APP_WHITE} />
      });
    } else {
      const data = await checkIfChallengeIsCompleted({
        challengeId: habit.challengeId,
        habitId: habit.id
      });
      if (!data) {
        toast.show("Having trouble check if you have completed your challenge. Please try again!", {
          type: "success",
          duration: 4000,
          placement: "bottom",
          icon: <Icon name='trending-up' size={moderateScale(20)} color={theme.APP_WHITE} />
        });
      } else {
        const { streakCount, challengeDuration } = data;
        if (streakCount >= challengeDuration) {
          toast.show("Woooohhooooo you have completed the challenge", {
            type: "success",
            duration: 4000,
            placement: "bottom",
            icon: <Icon name='trending-up' size={moderateScale(20)} color={theme.APP_WHITE} />
          });
        } else {
          toast.show(
            `You rock. You have ${
              challengeDuration - streakCount
            } day(s) left to complete the challenge`,
            {
              type: "success",
              duration: 4000,
              placement: "bottom",
              icon: <Icon name='trending-up' size={moderateScale(20)} color={theme.APP_WHITE} />
            }
          );
        }
      }
    }
  };

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: theme.MAIN_BG_COLOR }]}>
      <View
        style={[
          styles.container,
          {
            paddingVertical: verticalScale(20),
            paddingHorizontal: horizontalScale(20)
          }
        ]}
      >
        <View
          style={[
            styles.header,
            {
              marginBottom: verticalScale(15)
            }
          ]}
        >
          <Icon
            name='chevron-back-outline'
            size={moderateScale(25)}
            color={theme.HABIT_SCREEN_ACTION_ICON_COLOR}
            onPress={() => {
              navigation.goBack();
            }}
          />

          <View
            style={[
              styles.headerOptions,
              {
                width: horizontalScale(100)
              }
            ]}
          >
            <Icon
              name='create-outline'
              size={moderateScale(25)}
              color={theme.HABIT_SCREEN_ACTION_ICON_COLOR}
              onPress={handleOnPressEdit}
            />
            <Icon
              name='pause-outline'
              size={moderateScale(25)}
              color={theme.HABIT_SCREEN_ACTION_ICON_COLOR}
              onPress={handleOnPressPause}
            />
            <Icon
              name='trash-outline'
              size={moderateScale(25)}
              color={theme.HABIT_SCREEN_ACTION_ICON_COLOR}
              onPress={handleOnPressDelete}
            />
          </View>
        </View>

        <Text
          style={[
            styles.habitName,
            {
              color: theme.MAIN_TEXT_COLOR,
              fontSize: moderateScale(24),
              lineHeight: verticalScale(24),
              marginBottom: verticalScale(1)
            }
          ]}
        >
          {habit?.name}
        </Text>
        <Text
          style={[
            styles.habitDescription,
            {
              color: theme.MAIN_TEXT_COLOR,
              fontSize: moderateScale(14),
              lineHeight: verticalScale(18)
            }
          ]}
        >
          {habit?.description}
        </Text>

        <View
          style={[
            styles.habitInfo,
            {
              marginVertical: verticalScale(25),
              width: horizontalScale(200)
            }
          ]}
        >
          <View>
            <Text
              style={[
                styles.habitInfoText,
                {
                  color: theme.MAIN_TEXT_COLOR,
                  fontSize: moderateScale(12),
                  lineHeight: verticalScale(18),
                  marginBottom: verticalScale(5)
                }
              ]}
            >
              Repeat:
            </Text>
            <Text
              style={[
                styles.habitInfoText_Frequency,
                {
                  color: theme.MAIN_TEXT_COLOR,
                  fontSize: moderateScale(16),
                  lineHeight: verticalScale(18)
                }
              ]}
            >
              {habit?.frequencyOption}
            </Text>
          </View>
          <View>
            <Text
              style={[
                styles.habitInfoText,
                {
                  color: theme.MAIN_TEXT_COLOR
                }
              ]}
            >
              Closest Remind:
            </Text>
            {/* TODO: Add reminder logic here */}
            <Text
              style={[
                styles.habitInfoText_Frequency,
                {
                  color: theme.MAIN_TEXT_COLOR
                }
              ]}
            >
              {habit?.reminderAt.length > 0 && findClosestReminder(habit?.reminderAt)}
              {habit?.reminderAt.length < 1 && "None"}
            </Text>
          </View>
        </View>
        <ScrollView style={{ marginBottom: verticalScale(10) }}>
          <CustomCalendar
            currentDate={currentDate}
            stats={stats}
            handleMonthChange={handleMonthChange}
          />

          <View
            style={[
              styles.streakContainer,
              {
                marginBottom: verticalScale(45),
                marginTop: verticalScale(25),
                height: verticalScale(130)
              }
            ]}
          >
            <View style={styles.streakVSLongestStreak}>
              <View>
                <Text
                  style={[
                    styles.streakDay,
                    {
                      color: theme.MAIN_ACCENT_COLOR,
                      fontSize: verticalScale(40),
                      lineHeight: verticalScale(48)
                    }
                  ]}
                >
                  {streak?.count} {streak?.count > 1 ? "DAYS" : "DAY"}
                </Text>
                <Text
                  style={[
                    styles.streakLabel,
                    {
                      color: theme.MAIN_ACCENT_COLOR,
                      fontSize: moderateScale(14),
                      lineHeight: verticalScale(17)
                    }
                  ]}
                >
                  Your Current Streak
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.longestStreak,
                    {
                      color: theme.MAIN_ACCENT_COLOR,
                      fontSize: moderateScale(12),
                      lineHeight: verticalScale(15)
                    }
                  ]}
                >
                  {streak?.longestStreak} {streak?.longestStreak > 1 ? "days" : "day"}
                </Text>
                <Text
                  style={[
                    styles.longestStreakLabel,
                    {
                      color: theme.MAIN_ACCENT_COLOR,
                      fontSize: moderateScale(12),
                      lineHeight: verticalScale(15)
                    }
                  ]}
                >
                  Your longest streak
                </Text>
              </View>
            </View>
            <View>
              <StreakIcon />
            </View>
          </View>
          <CustomButton
            bgColor={theme.MAIN_ACCENT_COLOR}
            color={theme.APP_WHITE}
            text={"Mark as done"}
            onClick={handleOnPressMarkAsDone}
            icon={<Icon name='checkbox-outline' size={moderateScale(20)} color={theme.APP_WHITE} />}
            // disabled={loading}
          />
        </ScrollView>
      </View>

      <DeleteHabitModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  container: {},
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerOptions: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  habitName: {
    fontFamily: "Inter_700Bold",
    fontStyle: "normal",
    fontWeight: "700"
  },
  habitDescription: {
    fontFamily: "Inter_500Medium",
    fontStyle: "normal",
    fontWeight: "500"
  },
  habitInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center"
  },
  habitInfoText: {
    fontFamily: "Inter_500Medium",
    fontStyle: "normal",
    fontWeight: "500",
    textAlign: "center"
  },
  habitInfoText_Frequency: {
    fontFamily: "Inter_700Bold",
    fontStyle: "normal",
    fontWeight: "700",
    textAlign: "center"
  },
  streakContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  streakVSLongestStreak: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  streakDay: {
    fontFamily: "Inter_500Medium",
    fontStyle: "normal",
    fontWeight: "500"
  },
  streakLabel: {
    fontFamily: "Inter_400Regular",
    fontStyle: "normal",
    fontWeight: "400",
    opacity: 0.7
  },
  longestStreak: {
    fontFamily: "Inter_500Medium",
    fontStyle: "normal",
    fontWeight: "500"
  },
  longestStreakLabel: {
    fontFamily: "Inter_400Regular",
    fontStyle: "normal",
    fontWeight: "400",
    opacity: 0.7
  }
});
