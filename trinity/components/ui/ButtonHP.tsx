import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

const ButtonHP = ({ text, onPress, className = '' }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`bg-blue-500 rounded-full py-3 px-6 shadow-md active:bg-blue-600 w-40 ${className}`}
        >
        <Text className="text-white text-lg font-semibold text-center">{text}</Text>
        </TouchableOpacity>
);
};

export default ButtonHP;