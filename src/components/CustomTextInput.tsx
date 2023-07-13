import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import { CustomTextInputType } from '~types'
import { useTheme } from '~hooks'

export const CustomTextInput = ({
                                  bigLabel,
                                  label,
                                  handleChange,
                                  handleBlur = () => null,
                                  value,
                                  placeholder,
                                  keyboardType,
                                  secureTextEntry,
                                  error
                                }: CustomTextInputType) => {
  const { theme } = useTheme()

  return (
    <View style={styles.textInput}>
      {label && <Text style={[styles.label, {
        color: theme.MAIN_TEXT_COLOR
      }]}>{label}</Text>}
      {bigLabel && <Text style={[styles.bigLabel, {
        color: theme.LIGHT_MAIN_TEXT_COLOR
      }]}>{bigLabel}</Text>}
      <TextInput
        style={[styles.input, {
          borderColor: error ? 'red' : theme.BORDER_COLOR,
          backgroundColor: theme.INPUT_BG
        }]}
        onChangeText={handleChange}
        onBlur={handleBlur}
        value={value}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
      {error && <Text style={styles.error}>
        {error}
      </Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  textInput: {
    marginBottom: 10
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19
  },
  bigLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 22
  },
  input: {
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    paddingTop: 14.5,
    paddingBottom: 14.5,
    paddingLeft: 16,
    paddingRight: 16,
    fontFamily: 'Inter_400Regular',
    fontWeight: '400',
    fontStyle: 'normal',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'Inter_400Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: 'red'
  }
})
