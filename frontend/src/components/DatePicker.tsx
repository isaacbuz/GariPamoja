import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Button, Portal, Modal } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
  disabled?: boolean;
  error?: string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  mode = 'datetime',
  disabled = false,
  error,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const showPickerModal = () => {
    setShowPicker(true);
  };

  const hidePickerModal = () => {
    setShowPicker(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date & time';
    
    if (mode === 'date') {
      return format(date, 'MMM dd, yyyy');
    } else if (mode === 'time') {
      return format(date, 'hh:mm a');
    } else {
      return format(date, 'MMM dd, yyyy hh:mm a');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Button
        mode="outlined"
        onPress={showPickerModal}
        disabled={disabled}
        style={[styles.button, error && styles.buttonError]}
        contentStyle={styles.buttonContent}
      >
        {formatDate(value)}
      </Button>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {Platform.OS === 'ios' ? (
        <Portal>
          <Modal
            visible={showPicker}
            onDismiss={hidePickerModal}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Button onPress={hidePickerModal}>Cancel</Button>
                <Text style={styles.pickerTitle}>{label}</Text>
                <Button onPress={hidePickerModal}>Done</Button>
              </View>
              <DateTimePicker
                value={value || new Date()}
                mode={mode}
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.picker}
              />
            </View>
          </Modal>
        </Portal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={value || new Date()}
            mode={mode}
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  button: {
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  buttonError: {
    borderColor: '#ef4444',
  },
  buttonContent: {
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 0,
  },
  pickerContainer: {
    backgroundColor: '#fff',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  picker: {
    height: 200,
  },
}); 