import { UnitSystem } from '../types';

interface ConversionResult {
  value: number;
  unit: string;
}

const CONVERSIONS: Record<string, { to: string, factor: number }> = {
  // SI to Imperial
  'bar': { to: 'psi', factor: 14.5038 },
  'mm': { to: 'in', factor: 1 / 25.4 },
  'L/min': { to: 'gpm', factor: 0.264172 },
  'kg': { to: 'lbs', factor: 2.20462 },
  'L': { to: 'gal', factor: 0.264172 },
  'cc/rev': { to: 'in³/rev', factor: 0.0610237 },
  'kW': { to: 'hp', factor: 1.34102 },
  '°C': { to: '°F', factor: 1.8 }, // This is for delta, not absolute. For absolute: (C * 9/5) + 32
  'cSt': { to: 'SSU', factor: 4.632 }, // Approximation for Saybolt Universal Seconds
  'kg/m³': { to: 'lb/gal', factor: 0.0083454 },

  // Base units that don't change
  'V': { to: 'V', factor: 1 },
  'rpm': { to: 'rpm', factor: 1 },
  'Hz': { to: 'Hz', factor: 1 },
  'Ω': { to: 'Ω', factor: 1 },
  'W': { to: 'W', factor: 1 },

  // Imperial to SI (inverse factors)
  'psi': { to: 'bar', factor: 1 / 14.5038 },
  'in': { to: 'mm', factor: 25.4 },
  'gpm': { to: 'L/min', factor: 1 / 0.264172 },
  'lbs': { to: 'kg', factor: 1 / 2.20462 },
  'gal': { to: 'L', factor: 1 / 0.264172 },
  'in³/rev': { to: 'cc/rev', factor: 1 / 0.0610237 },
  'hp': { to: 'kW', factor: 1 / 1.34102 },
  '°F': { to: '°C', factor: 1 / 1.8 },
  'SSU': { to: 'cSt', factor: 1 / 4.632 },
  'lb/gal': { to: 'kg/m³', factor: 1 / 0.0083454 },
};

export function getConvertedValue(value: number, unit: string | undefined, targetSystem: UnitSystem): ConversionResult {
  if (!unit) return { value, unit: '' };

  if (unit === '°C' && targetSystem === 'Imperial') {
      return { value: (value * 9/5) + 32, unit: '°F' };
  }
  
  if (targetSystem === 'SI') {
    return { value, unit: unit || '' };
  }

  const conversion = CONVERSIONS[unit];
  if (conversion) {
    return { value: value * conversion.factor, unit: conversion.to };
  }
  
  return { value, unit };
}


export function convertValueFromDisplay(displayValue: number, displayUnit: string): number {
    // This function converts a value from its displayed unit (potentially Imperial)
    // back to the base SI unit for storage.
    if (displayUnit === '°F') {
        return (displayValue - 32) * 5/9;
    }

    const conversion = CONVERSIONS[displayUnit];

    // If there's a conversion defined for the display unit, it means it's an Imperial unit.
    // We apply the inverse factor to get back to SI.
    if (conversion && conversion.to !== displayUnit) {
        return displayValue * conversion.factor;
    }

    // If no conversion is found, it's already in SI units.
    return displayValue;
}