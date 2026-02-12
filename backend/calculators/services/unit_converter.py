"""
Engineering Unit Converter Service
Comprehensive unit conversion for engineering applications
"""

class UnitConverter:
    """Engineering unit converter with comprehensive unit categories"""
    
    # Conversion factors to base units
    LENGTH_UNITS = {
        # Metric
        'nm': 1e-9, 'nanometer': 1e-9, 'nanometers': 1e-9,
        'μm': 1e-6, 'micrometer': 1e-6, 'micrometers': 1e-6, 'micron': 1e-6,
        'mm': 1e-3, 'millimeter': 1e-3, 'millimeters': 1e-3,
        'cm': 1e-2, 'centimeter': 1e-2, 'centimeters': 1e-2,
        'm': 1.0, 'meter': 1.0, 'meters': 1.0,
        'km': 1e3, 'kilometer': 1e3, 'kilometers': 1e3,
        # Imperial
        'in': 0.0254, 'inch': 0.0254, 'inches': 0.0254,
        'ft': 0.3048, 'foot': 0.3048, 'feet': 0.3048,
        'yd': 0.9144, 'yard': 0.9144, 'yards': 0.9144,
        'mi': 1609.344, 'mile': 1609.344, 'miles': 1609.344,
        'mil': 2.54e-5, 'thou': 2.54e-5,
        # Nautical
        'nmi': 1852.0, 'nautical_mile': 1852.0,
    }
    
    AREA_UNITS = {
        # Metric
        'mm²': 1e-6, 'sq_mm': 1e-6, 'square_millimeter': 1e-6,
        'cm²': 1e-4, 'sq_cm': 1e-4, 'square_centimeter': 1e-4,
        'm²': 1.0, 'sq_m': 1.0, 'square_meter': 1.0,
        'km²': 1e6, 'sq_km': 1e6, 'square_kilometer': 1e6,
        'ha': 1e4, 'hectare': 1e4,
        'a': 1e2, 'are': 1e2,
        # Imperial
        'in²': 6.4516e-4, 'sq_in': 6.4516e-4, 'square_inch': 6.4516e-4,
        'ft²': 0.092903, 'sq_ft': 0.092903, 'square_foot': 0.092903,
        'yd²': 0.836127, 'sq_yd': 0.836127, 'square_yard': 0.836127,
        'ac': 4046.86, 'acre': 4046.86, 'acres': 4046.86,
        'mi²': 2.59e6, 'sq_mi': 2.59e6, 'square_mile': 2.59e6,
    }
    
    VOLUME_UNITS = {
        # Metric
        'mm³': 1e-9, 'cubic_millimeter': 1e-9,
        'cm³': 1e-6, 'cubic_centimeter': 1e-6, 'cc': 1e-6,
        'mL': 1e-6, 'ml': 1e-6, 'milliliter': 1e-6,
        'L': 1e-3, 'liter': 1e-3, 'liters': 1e-3, 'l': 1e-3,
        'm³': 1.0, 'cubic_meter': 1.0,
        # Imperial
        'in³': 1.6387e-5, 'cubic_inch': 1.6387e-5,
        'ft³': 0.0283168, 'cubic_foot': 0.0283168,
        'yd³': 0.764555, 'cubic_yard': 0.764555,
        'gal': 0.00378541, 'gallon': 0.00378541, 'gallons': 0.00378541, 'us_gal': 0.00378541,
        'imp_gal': 0.00454609, 'imperial_gallon': 0.00454609,
        'qt': 9.4635e-4, 'quart': 9.4635e-4,
        'pt': 4.7318e-4, 'pint': 4.7318e-4,
        'fl_oz': 2.9574e-5, 'fluid_ounce': 2.9574e-5,
        'bbl': 0.158987, 'barrel': 0.158987,
    }
    
    MASS_UNITS = {
        # Metric
        'mg': 1e-6, 'milligram': 1e-6, 'milligrams': 1e-6,
        'g': 1e-3, 'gram': 1e-3, 'grams': 1e-3,
        'kg': 1.0, 'kilogram': 1.0, 'kilograms': 1.0,
        't': 1e3, 'tonne': 1e3, 'metric_ton': 1e3,
        # Imperial
        'oz': 0.0283495, 'ounce': 0.0283495, 'ounces': 0.0283495,
        'lb': 0.453592, 'pound': 0.453592, 'pounds': 0.453592, 'lbs': 0.453592,
        'st': 6.35029, 'stone': 6.35029,
        'short_ton': 907.185, 'us_ton': 907.185,
        'long_ton': 1016.05, 'imperial_ton': 1016.05,
        'slug': 14.5939,
    }
    
    FORCE_UNITS = {
        'N': 1.0, 'newton': 1.0, 'newtons': 1.0,
        'kN': 1e3, 'kilonewton': 1e3, 'kilonewtons': 1e3,
        'MN': 1e6, 'meganewton': 1e6,
        'dyn': 1e-5, 'dyne': 1e-5,
        'kgf': 9.80665, 'kilogram_force': 9.80665, 'kgf': 9.80665,
        'lbf': 4.44822, 'pound_force': 4.44822, 'pound-force': 4.44822,
        'pdl': 0.138255, 'poundal': 0.138255,
    }
    
    PRESSURE_UNITS = {
        # SI
        'Pa': 1.0, 'pascal': 1.0, 'pascals': 1.0,
        'kPa': 1e3, 'kilopascal': 1e3,
        'MPa': 1e6, 'megapascal': 1e6,
        'GPa': 1e9, 'gigapascal': 1e9,
        # Other metric
        'bar': 1e5, 'bars': 1e5,
        'mbar': 1e2, 'millibar': 1e2,
        'atm': 101325.0, 'atmosphere': 101325.0,
        'at': 98066.5, 'technical_atmosphere': 98066.5,
        # Imperial
        'psi': 6894.76, 'pound_per_sq_in': 6894.76, 'lbf/in²': 6894.76,
        'psf': 47.8803, 'pound_per_sq_ft': 47.8803, 'lbf/ft²': 47.8803,
        'ksi': 6.89476e6, 'kilopound_per_sq_in': 6.89476e6,
        # Liquid column
        'mmHg': 133.322, 'torr': 133.322,
        'inHg': 3386.39,
        'mmH2O': 9.80665, 'mm_water': 9.80665,
        'inH2O': 249.089, 'in_water': 249.089,
    }
    
    ENERGY_UNITS = {
        # SI
        'J': 1.0, 'joule': 1.0, 'joules': 1.0,
        'kJ': 1e3, 'kilojoule': 1e3,
        'MJ': 1e6, 'megajoule': 1e6,
        'GJ': 1e9, 'gigajoule': 1e9,
        # Electrical
        'Wh': 3600.0, 'watt_hour': 3600.0,
        'kWh': 3.6e6, 'kilowatt_hour': 3.6e6, 'kilowatt-hour': 3.6e6,
        'MWh': 3.6e9, 'megawatt_hour': 3.6e9,
        # Thermal
        'cal': 4.184, 'calorie': 4.184, 'calories': 4.184,
        'kcal': 4184.0, 'kilocalorie': 4184.0, 'Cal': 4184.0,
        'BTU': 1055.06, 'btu': 1055.06, 'british_thermal_unit': 1055.06,
        'therm': 1.055e8, 'therms': 1.055e8,
        # Mechanical
        'ft·lbf': 1.35582, 'foot_pound': 1.35582, 'ft_lbf': 1.35582,
        'eV': 1.60218e-19, 'electronvolt': 1.60218e-19,
        # Industrial
        'toe': 4.1868e10, 'ton_oil_equivalent': 4.1868e10,
        'tce': 2.9308e10, 'ton_coal_equivalent': 2.9308e10,
    }
    
    POWER_UNITS = {
        # SI
        'W': 1.0, 'watt': 1.0, 'watts': 1.0,
        'kW': 1e3, 'kilowatt': 1e3,
        'MW': 1e6, 'megawatt': 1e6,
        'GW': 1e9, 'gigawatt': 1e9,
        'mW': 1e-3, 'milliwatt': 1e-3,
        # Mechanical
        'hp': 745.7, 'horsepower': 745.7, 'hp(I)': 745.7,
        'hp(M)': 735.499, 'metric_horsepower': 735.499, 'PS': 735.499,
        'hp(E)': 746.0, 'electrical_horsepower': 746.0,
        'hp(B)': 9809.5, 'boiler_horsepower': 9809.5,
        # Thermal
        'BTU/h': 0.293071, 'btu_per_hour': 0.293071,
        'BTU/min': 17.5843, 'btu_per_minute': 17.5843,
        'TR': 3516.85, 'ton_refrigeration': 3516.85, 'refrigeration_ton': 3516.85,
        # Other
        'ft·lbf/s': 1.35582, 'foot_pound_per_second': 1.35582,
        'kcal/h': 1.163, 'kilocalorie_per_hour': 1.163,
    }
    
    TEMPERATURE_OFFSETS = {
        # Conversion: to_celsius = (value - offset) * factor + offset2
        '°C': {'offset': 0, 'factor': 1, 'offset2': 0}, 'celsius': {'offset': 0, 'factor': 1, 'offset2': 0},
        '°F': {'offset': 32, 'factor': 5/9, 'offset2': 0}, 'fahrenheit': {'offset': 32, 'factor': 5/9, 'offset2': 0},
        'K': {'offset': 273.15, 'factor': 1, 'offset2': -273.15}, 'kelvin': {'offset': 273.15, 'factor': 1, 'offset2': -273.15},
        '°R': {'offset': 491.67, 'factor': 5/9, 'offset2': -273.15}, 'rankine': {'offset': 491.67, 'factor': 5/9, 'offset2': -273.15},
    }
    
    TIME_UNITS = {
        'ns': 1e-9, 'nanosecond': 1e-9, 'nanoseconds': 1e-9,
        'μs': 1e-6, 'microsecond': 1e-6, 'microseconds': 1e-6,
        'ms': 1e-3, 'millisecond': 1e-3, 'milliseconds': 1e-3,
        's': 1.0, 'second': 1.0, 'seconds': 1.0, 'sec': 1.0,
        'min': 60.0, 'minute': 60.0, 'minutes': 60.0,
        'h': 3600.0, 'hour': 3600.0, 'hours': 3600.0, 'hr': 3600.0,
        'd': 86400.0, 'day': 86400.0, 'days': 86400.0,
        'wk': 604800.0, 'week': 604800.0, 'weeks': 604800.0,
        'mo': 2629746.0, 'month': 2629746.0, 'months': 2629746.0,  # Average month
        'yr': 31556952.0, 'year': 31556952.0, 'years': 31556952.0,  # Tropical year
    }
    
    SPEED_UNITS = {
        # Metric
        'm/s': 1.0, 'meter_per_second': 1.0, 'meters_per_second': 1.0,
        'km/h': 0.277778, 'kilometer_per_hour': 0.277778, 'kph': 0.277778,
        'km/s': 1000.0, 'kilometer_per_second': 1000.0,
        # Imperial
        'mph': 0.44704, 'mile_per_hour': 0.44704, 'miles_per_hour': 0.44704,
        'ft/s': 0.3048, 'foot_per_second': 0.3048, 'feet_per_second': 0.3048, 'fps': 0.3048,
        'ft/min': 0.00508, 'foot_per_minute': 0.00508, 'fpm': 0.00508,
        'in/s': 0.0254, 'inch_per_second': 0.0254,
        # Nautical
        'kn': 0.514444, 'knot': 0.514444, 'knots': 0.514444,
        # Other
        'c': 299792458.0, 'speed_of_light': 299792458.0,
        'Mach': 340.29, 'mach': 340.29,  # At sea level, 15°C
    }
    
    FLOW_RATE_UNITS = {
        # Volume flow - Metric
        'L/s': 0.001, 'liter_per_second': 0.001,
        'L/min': 1.6667e-5, 'liter_per_minute': 1.6667e-5, 'lpm': 1.6667e-5,
        'L/h': 2.7778e-7, 'liter_per_hour': 2.7778e-7,
        'm³/s': 1.0, 'cubic_meter_per_second': 1.0,
        'm³/h': 2.7778e-4, 'cubic_meter_per_hour': 2.7778e-4, 'cmh': 2.7778e-4,
        'm³/min': 0.016667, 'cubic_meter_per_minute': 0.016667,
        # Volume flow - Imperial
        'gpm': 6.309e-5, 'gallon_per_minute': 6.309e-5, 'gal/min': 6.309e-5,
        'gph': 1.0515e-6, 'gallon_per_hour': 1.0515e-6,
        'cfm': 4.7195e-4, 'cubic_foot_per_minute': 4.7195e-4, 'ft³/min': 4.7195e-4,
        'cfs': 0.028317, 'cubic_foot_per_second': 0.028317, 'ft³/s': 0.028317,
        # Mass flow
        'kg/s': 1.0, 'kilogram_per_second': 1.0,
        'kg/h': 2.7778e-4, 'kilogram_per_hour': 2.7778e-4,
        'kg/min': 0.016667, 'kilogram_per_minute': 0.016667,
        'lb/s': 0.453592, 'pound_per_second': 0.453592,
        'lb/h': 1.26e-4, 'pound_per_hour': 1.26e-4, 'pph': 1.26e-4,
        'lb/min': 0.00756, 'pound_per_minute': 0.00756,
    }
    
    TORQUE_UNITS = {
        'N·m': 1.0, 'newton_meter': 1.0, 'Nm': 1.0, 'N-m': 1.0,
        'kN·m': 1e3, 'kilonewton_meter': 1e3, 'kNm': 1e3,
        'mN·m': 1e-3, 'millinewton_meter': 1e-3, 'mNm': 1e-3,
        'lb·ft': 1.35582, 'pound_foot': 1.35582, 'lb-ft': 1.35582, 'ft·lb': 1.35582,
        'lb·in': 0.112985, 'pound_inch': 0.112985, 'lb-in': 0.112985, 'in·lb': 0.112985,
        'oz·in': 0.00706155, 'ounce_inch': 0.00706155,
        'kgf·m': 9.80665, 'kilogram_force_meter': 9.80665, 'kgf-m': 9.80665,
        'kgf·cm': 0.0980665, 'kilogram_force_centimeter': 0.0980665,
        'gf·cm': 9.80665e-5, 'gram_force_centimeter': 9.80665e-5,
    }
    
    DENSITY_UNITS = {
        'kg/m³': 1.0, 'kilogram_per_cubic_meter': 1.0,
        'g/cm³': 1000.0, 'gram_per_cubic_centimeter': 1000.0,
        'g/mL': 1000.0, 'gram_per_milliliter': 1000.0,
        'kg/L': 1000.0, 'kilogram_per_liter': 1000.0,
        'lb/ft³': 16.0185, 'pound_per_cubic_foot': 16.0185, 'pcf': 16.0185,
        'lb/in³': 27679.9, 'pound_per_cubic_inch': 27679.9,
        'lb/gal': 119.826, 'pound_per_gallon': 119.826,
        'slug/ft³': 515.379, 'slug_per_cubic_foot': 515.379,
        'API': None,  # API gravity - special formula
    }
    
    VISCOSITY_DYNAMIC_UNITS = {
        'Pa·s': 1.0, 'pascal_second': 1.0, 'Pa-s': 1.0,
        'mPa·s': 1e-3, 'millipascal_second': 1e-3,
        'P': 0.1, 'poise': 0.1,
        'cP': 1e-3, 'centipoise': 1e-3,
        'lb/(ft·s)': 1.48816, 'pound_per_foot_second': 1.48816,
        'lb/(ft·h)': 4.13379e-4, 'pound_per_foot_hour': 4.13379e-4,
    }
    
    VISCOSITY_KINEMATIC_UNITS = {
        'm²/s': 1.0, 'square_meter_per_second': 1.0,
        'mm²/s': 1e-6, 'square_millimeter_per_second': 1e-6,
        'St': 1e-4, 'stokes': 1e-4,
        'cSt': 1e-6, 'centistokes': 1e-6,
        'ft²/s': 0.092903, 'square_foot_per_second': 0.092903,
        'ft²/h': 2.58064e-5, 'square_foot_per_hour': 2.58064e-5,
    }
    
    ANGLE_UNITS = {
        '°': 1.0, 'degree': 1.0, 'degrees': 1.0, 'deg': 1.0,
        'rad': 57.2958, 'radian': 57.2958, 'radians': 57.2958,
        'grad': 0.9, 'gon': 0.9, 'gradian': 0.9,
        'arcmin': 1/60, 'arcminute': 1/60, 'MOA': 1/60,
        'arcsec': 1/3600, 'arcsecond': 1/3600,
        'turn': 360.0, 'revolution': 360.0, 'rev': 360.0,
    }
    
    FREQUENCY_UNITS = {
        'Hz': 1.0, 'hertz': 1.0,
        'kHz': 1e3, 'kilohertz': 1e3,
        'MHz': 1e6, 'megahertz': 1e6,
        'GHz': 1e9, 'gigahertz': 1e9,
        'THz': 1e12, 'terahertz': 1e12,
        'rpm': 1/60, 'revolutions_per_minute': 1/60,
        'rps': 1.0, 'revolutions_per_second': 1.0,
        'rad/s': 0.159155, 'radians_per_second': 0.159155,
    }
    
    ELECTRIC_CURRENT_UNITS = {
        'A': 1.0, 'ampere': 1.0, 'amp': 1.0, 'amps': 1.0,
        'kA': 1e3, 'kiloampere': 1e3,
        'mA': 1e-3, 'milliampere': 1e-3, 'milliamp': 1e-3,
        'μA': 1e-6, 'microampere': 1e-6,
        'nA': 1e-9, 'nanoampere': 1e-9,
    }
    
    VOLTAGE_UNITS = {
        'V': 1.0, 'volt': 1.0, 'volts': 1.0,
        'kV': 1e3, 'kilovolt': 1e3,
        'mV': 1e-3, 'millivolt': 1e-3,
        'μV': 1e-6, 'microvolt': 1e-6,
        'MV': 1e6, 'megavolt': 1e6,
    }
    
    RESISTANCE_UNITS = {
        'Ω': 1.0, 'ohm': 1.0, 'ohms': 1.0,
        'kΩ': 1e3, 'kiloohm': 1e3,
        'MΩ': 1e6, 'megaohm': 1e6,
        'mΩ': 1e-3, 'milliohm': 1e-3,
        'μΩ': 1e-6, 'microohm': 1e-6,
    }
    
    CAPACITANCE_UNITS = {
        'F': 1.0, 'farad': 1.0, 'farads': 1.0,
        'mF': 1e-3, 'millifarad': 1e-3,
        'μF': 1e-6, 'microfarad': 1e-6,
        'nF': 1e-9, 'nanofarad': 1e-9,
        'pF': 1e-12, 'picofarad': 1e-12,
    }
    
    INDUCTANCE_UNITS = {
        'H': 1.0, 'henry': 1.0, 'henries': 1.0,
        'mH': 1e-3, 'millihenry': 1e-3,
        'μH': 1e-6, 'microhenry': 1e-6,
        'nH': 1e-9, 'nanohenry': 1e-9,
    }
    
    # Category mapping
    CATEGORIES = {
        'length': LENGTH_UNITS,
        'area': AREA_UNITS,
        'volume': VOLUME_UNITS,
        'mass': MASS_UNITS,
        'force': FORCE_UNITS,
        'pressure': PRESSURE_UNITS,
        'energy': ENERGY_UNITS,
        'power': POWER_UNITS,
        'temperature': TEMPERATURE_OFFSETS,
        'time': TIME_UNITS,
        'speed': SPEED_UNITS,
        'flow_rate': FLOW_RATE_UNITS,
        'torque': TORQUE_UNITS,
        'density': DENSITY_UNITS,
        'viscosity_dynamic': VISCOSITY_DYNAMIC_UNITS,
        'viscosity_kinematic': VISCOSITY_KINEMATIC_UNITS,
        'angle': ANGLE_UNITS,
        'frequency': FREQUENCY_UNITS,
        'electric_current': ELECTRIC_CURRENT_UNITS,
        'voltage': VOLTAGE_UNITS,
        'resistance': RESISTANCE_UNITS,
        'capacitance': CAPACITANCE_UNITS,
        'inductance': INDUCTANCE_UNITS,
    }
    
    @classmethod
    def get_categories(cls) -> list:
        """Get list of all unit categories"""
        return list(cls.CATEGORIES.keys())
    
    @classmethod
    def get_units_in_category(cls, category: str) -> list:
        """Get list of units in a specific category"""
        if category not in cls.CATEGORIES:
            return []
        return list(cls.CATEGORIES[category].keys())
    
    @classmethod
    def convert(cls, value: float, from_unit: str, to_unit: str, category: str = None) -> dict:
        """
        Convert a value from one unit to another
        
        Args:
            value: The numeric value to convert
            from_unit: Source unit symbol or name
            to_unit: Target unit symbol or name
            category: Optional category hint for ambiguous units
            
        Returns:
            Dictionary with result and metadata
        """
        # Normalize unit names
        from_unit = from_unit.strip().replace(' ', '_').replace('·', '·')
        to_unit = to_unit.strip().replace(' ', '_').replace('·', '·')
        
        # Find the category if not provided
        if category is None:
            category = cls._find_category(from_unit, to_unit)
            if category is None:
                return {
                    'success': False,
                    'error': f'Could not find common category for {from_unit} and {to_unit}',
                    'suggestions': cls._suggest_categories(from_unit, to_unit)
                }
        
        # Check if category exists
        if category not in cls.CATEGORIES:
            return {
                'success': False,
                'error': f'Unknown category: {category}',
                'available_categories': cls.get_categories()
            }
        
        units_dict = cls.CATEGORIES[category]
        
        # Check if units exist in category
        if from_unit not in units_dict:
            # Try to find similar unit
            from_unit = cls._find_similar_unit(from_unit, units_dict)
            if from_unit is None:
                return {
                    'success': False,
                    'error': f'Unit {from_unit} not found in category {category}',
                    'available_units': list(units_dict.keys())
                }
        
        if to_unit not in units_dict:
            to_unit = cls._find_similar_unit(to_unit, units_dict)
            if to_unit is None:
                return {
                    'success': False,
                    'error': f'Unit {to_unit} not found in category {category}',
                    'available_units': list(units_dict.keys())
                }
        
        # Perform conversion
        try:
            if category == 'temperature':
                result = cls._convert_temperature(value, from_unit, to_unit, units_dict)
            elif category == 'density' and (from_unit == 'API' or to_unit == 'API'):
                result = cls._convert_api_gravity(value, from_unit, to_unit)
            else:
                # Standard conversion using factors
                from_factor = units_dict[from_unit]
                to_factor = units_dict[to_unit]
                
                # Convert to base unit, then to target unit
                base_value = value * from_factor
                result = base_value / to_factor
            
            return {
                'success': True,
                'original_value': value,
                'from_unit': from_unit,
                'to_unit': to_unit,
                'category': category,
                'result': result,
                'formatted': cls._format_result(result)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Conversion error: {str(e)}'
            }
    
    @classmethod
    def _find_category(cls, from_unit: str, to_unit: str) -> str:
        """Find the common category for two units"""
        from_categories = []
        to_categories = []
        
        for cat, units in cls.CATEGORIES.items():
            if from_unit in units or cls._find_similar_unit(from_unit, units):
                from_categories.append(cat)
            if to_unit in units or cls._find_similar_unit(to_unit, units):
                to_categories.append(cat)
        
        # Find common category
        common = set(from_categories) & set(to_categories)
        if common:
            return list(common)[0]
        
        return None
    
    @classmethod
    def _find_similar_unit(cls, unit: str, units_dict: dict) -> str:
        """Find a similar unit name in the dictionary"""
        unit_lower = unit.lower().replace(' ', '_').replace('-', '_').replace('·', '')
        
        for u in units_dict.keys():
            u_normalized = u.lower().replace(' ', '_').replace('-', '_').replace('·', '')
            if u_normalized == unit_lower:
                return u
        
        # Try partial match
        for u in units_dict.keys():
            if unit_lower in u.lower() or u.lower() in unit_lower:
                return u
        
        return None
    
    @classmethod
    def _suggest_categories(cls, from_unit: str, to_unit: str) -> list:
        """Suggest categories based on unit names"""
        suggestions = []
        
        for cat, units in cls.CATEGORIES.items():
            if cls._find_similar_unit(from_unit, units) or cls._find_similar_unit(to_unit, units):
                suggestions.append(cat)
        
        return suggestions
    
    @classmethod
    def _convert_temperature(cls, value: float, from_unit: str, to_unit: str, units_dict: dict) -> float:
        """Convert temperature values"""
        from_data = units_dict[from_unit]
        to_data = units_dict[to_unit]
        
        # Convert to Celsius first
        celsius = (value - from_data['offset']) * from_data['factor'] + from_data['offset2']
        
        # Convert from Celsius to target
        if to_unit in ['°C', 'celsius']:
            return celsius
        elif to_unit in ['°F', 'fahrenheit']:
            return celsius * 9/5 + 32
        elif to_unit in ['K', 'kelvin']:
            return celsius + 273.15
        elif to_unit in ['°R', 'rankine']:
            return (celsius + 273.15) * 9/5
        
        return value
    
    @classmethod
    def _convert_api_gravity(cls, value: float, from_unit: str, to_unit: str) -> float:
        """Convert API gravity"""
        if from_unit == 'API' and to_unit != 'API':
            # API to specific gravity
            sg = 141.5 / (value + 131.5)
            # Convert to target density unit
            if to_unit in ['g/cm³', 'g/mL']:
                return sg
            elif to_unit == 'kg/m³':
                return sg * 1000
            elif to_unit == 'lb/ft³':
                return sg * 62.428
        elif to_unit == 'API' and from_unit != 'API':
            # Convert from density to specific gravity first
            if from_unit in ['g/cm³', 'g/mL']:
                sg = value
            elif from_unit == 'kg/m³':
                sg = value / 1000
            elif from_unit == 'lb/ft³':
                sg = value / 62.428
            else:
                sg = value
            # SG to API
            return (141.5 / sg) - 131.5
        
        return value
    
    @classmethod
    def _format_result(cls, value: float) -> str:
        """Format the result with appropriate precision"""
        if abs(value) < 0.001 or abs(value) > 1e6:
            return f"{value:.6e}"
        elif abs(value) < 1:
            return f"{value:.6f}"
        elif abs(value) < 100:
            return f"{value:.4f}"
        elif abs(value) < 10000:
            return f"{value:.2f}"
        else:
            return f"{value:.2f}"
    
    @classmethod
    def batch_convert(cls, conversions: list) -> list:
        """
        Perform multiple conversions
        
        Args:
            conversions: List of dicts with 'value', 'from_unit', 'to_unit', 'category' (optional)
            
        Returns:
            List of conversion results
        """
        results = []
        for conv in conversions:
            result = cls.convert(
                conv.get('value'),
                conv.get('from_unit'),
                conv.get('to_unit'),
                conv.get('category')
            )
            results.append(result)
        return results
    
    @classmethod
    def get_common_units(cls, category: str) -> dict:
        """Get commonly used units for a category with display names"""
        common = {
            'length': {
                'mm': 'Millimeter (mm)',
                'cm': 'Centimeter (cm)',
                'm': 'Meter (m)',
                'km': 'Kilometer (km)',
                'in': 'Inch (in)',
                'ft': 'Foot (ft)',
                'yd': 'Yard (yd)',
                'mi': 'Mile (mi)',
            },
            'area': {
                'mm²': 'Square Millimeter (mm²)',
                'cm²': 'Square Centimeter (cm²)',
                'm²': 'Square Meter (m²)',
                'km²': 'Square Kilometer (km²)',
                'ha': 'Hectare (ha)',
                'in²': 'Square Inch (in²)',
                'ft²': 'Square Foot (ft²)',
                'ac': 'Acre (ac)',
            },
            'volume': {
                'mL': 'Milliliter (mL)',
                'L': 'Liter (L)',
                'm³': 'Cubic Meter (m³)',
                'gal': 'US Gallon (gal)',
                'ft³': 'Cubic Foot (ft³)',
                'in³': 'Cubic Inch (in³)',
                'bbl': 'Barrel (bbl)',
            },
            'mass': {
                'mg': 'Milligram (mg)',
                'g': 'Gram (g)',
                'kg': 'Kilogram (kg)',
                't': 'Metric Ton (t)',
                'oz': 'Ounce (oz)',
                'lb': 'Pound (lb)',
            },
            'force': {
                'N': 'Newton (N)',
                'kN': 'Kilonewton (kN)',
                'MN': 'Meganewton (MN)',
                'kgf': 'Kilogram-force (kgf)',
                'lbf': 'Pound-force (lbf)',
            },
            'pressure': {
                'Pa': 'Pascal (Pa)',
                'kPa': 'Kilopascal (kPa)',
                'MPa': 'Megapascal (MPa)',
                'bar': 'Bar',
                'psi': 'Pound per Square Inch (psi)',
                'atm': 'Atmosphere (atm)',
                'mmHg': 'Millimeter of Mercury (mmHg)',
            },
            'energy': {
                'J': 'Joule (J)',
                'kJ': 'Kilojoule (kJ)',
                'MJ': 'Megajoule (MJ)',
                'kWh': 'Kilowatt-hour (kWh)',
                'cal': 'Calorie (cal)',
                'kcal': 'Kilocalorie (kcal)',
                'BTU': 'British Thermal Unit (BTU)',
            },
            'power': {
                'W': 'Watt (W)',
                'kW': 'Kilowatt (kW)',
                'MW': 'Megawatt (MW)',
                'hp': 'Horsepower (hp)',
                'BTU/h': 'BTU per Hour',
                'TR': 'Ton of Refrigeration (TR)',
            },
            'temperature': {
                '°C': 'Celsius (°C)',
                '°F': 'Fahrenheit (°F)',
                'K': 'Kelvin (K)',
                '°R': 'Rankine (°R)',
            },
            'time': {
                'ms': 'Millisecond (ms)',
                's': 'Second (s)',
                'min': 'Minute (min)',
                'h': 'Hour (h)',
                'd': 'Day (d)',
                'wk': 'Week (wk)',
                'yr': 'Year (yr)',
            },
            'speed': {
                'm/s': 'Meters per Second (m/s)',
                'km/h': 'Kilometers per Hour (km/h)',
                'mph': 'Miles per Hour (mph)',
                'ft/s': 'Feet per Second (ft/s)',
                'kn': 'Knot (kn)',
                'Mach': 'Mach Number',
            },
            'flow_rate': {
                'L/s': 'Liters per Second (L/s)',
                'L/min': 'Liters per Minute (L/min)',
                'm³/h': 'Cubic Meters per Hour (m³/h)',
                'gpm': 'Gallons per Minute (gpm)',
                'cfm': 'Cubic Feet per Minute (cfm)',
                'kg/s': 'Kilograms per Second (kg/s)',
            },
            'torque': {
                'N·m': 'Newton Meter (N·m)',
                'kN·m': 'Kilonewton Meter (kN·m)',
                'lb·ft': 'Pound Foot (lb·ft)',
                'lb·in': 'Pound Inch (lb·in)',
                'kgf·m': 'Kilogram-force Meter (kgf·m)',
            },
            'density': {
                'kg/m³': 'Kilogram per Cubic Meter (kg/m³)',
                'g/cm³': 'Gram per Cubic Centimeter (g/cm³)',
                'lb/ft³': 'Pound per Cubic Foot (lb/ft³)',
                'lb/gal': 'Pound per Gallon (lb/gal)',
            },
            'angle': {
                '°': 'Degree (°)',
                'rad': 'Radian (rad)',
                'grad': 'Gradian (grad)',
                'arcmin': 'Arcminute (′)',
                'arcsec': 'Arcsecond (″)',
            },
            'frequency': {
                'Hz': 'Hertz (Hz)',
                'kHz': 'Kilohertz (kHz)',
                'MHz': 'Megahertz (MHz)',
                'GHz': 'Gigahertz (GHz)',
                'rpm': 'Revolutions per Minute (rpm)',
            },
            'electric_current': {
                'A': 'Ampere (A)',
                'kA': 'Kiloampere (kA)',
                'mA': 'Milliampere (mA)',
                'μA': 'Microampere (μA)',
            },
            'voltage': {
                'V': 'Volt (V)',
                'kV': 'Kilovolt (kV)',
                'mV': 'Millivolt (mV)',
                'MV': 'Megavolt (MV)',
            },
            'resistance': {
                'Ω': 'Ohm (Ω)',
                'kΩ': 'Kiloohm (kΩ)',
                'MΩ': 'Megaohm (MΩ)',
                'mΩ': 'Milliohm (mΩ)',
            },
        }
        
        return common.get(category, {})
