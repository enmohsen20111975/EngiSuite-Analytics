"""
Engineering Calculator Service
Advanced engineering calculations and scientific functions
"""

import math
import re
from typing import Dict, Any, List, Optional, Union

class EngineeringCalculator:
    """
    Comprehensive engineering calculator with scientific functions,
    equation solving, and common engineering formulas
    """
    
    # Mathematical constants
    CONSTANTS = {
        'pi': math.pi,
        'π': math.pi,
        'e': math.e,
        'phi': 1.618033988749895,  # Golden ratio
        'φ': 1.618033988749895,
        'sqrt2': math.sqrt(2),
        'sqrt3': math.sqrt(3),
        'ln2': math.log(2),
        'ln10': math.log(10),
        # Physical constants
        'c': 299792458,  # Speed of light (m/s)
        'g': 9.80665,  # Standard gravity (m/s²)
        'G': 6.67430e-11,  # Gravitational constant
        'h': 6.62607015e-34,  # Planck constant
        'hbar': 1.054571817e-34,  # Reduced Planck constant
        'k': 1.380649e-23,  # Boltzmann constant
        'Na': 6.02214076e23,  # Avogadro's number
        'R': 8.314462618,  # Gas constant
        'epsilon0': 8.8541878128e-12,  # Vacuum permittivity
        'mu0': 1.25663706212e-6,  # Vacuum permeability
        'e_charge': 1.602176634e-19,  # Elementary charge
        'me': 9.1093837015e-31,  # Electron mass
        'mp': 1.67262192369e-27,  # Proton mass
        'mn': 1.67492749804e-27,  # Neutron mass
        'sigma': 5.670374419e-8,  # Stefan-Boltzmann constant
    }
    
    @classmethod
    def evaluate_expression(cls, expression: str, variables: dict = None) -> dict:
        """
        Safely evaluate a mathematical expression
        
        Args:
            expression: Mathematical expression string
            variables: Optional dictionary of variable values
            
        Returns:
            Dictionary with result and metadata
        """
        try:
            # Sanitize expression
            expression = cls._sanitize_expression(expression)
            
            # Build evaluation context
            context = cls._build_eval_context()
            
            # Add variables if provided
            if variables:
                context.update(variables)
            
            # Evaluate
            result = eval(expression, {"__builtins__": {}}, context)
            
            # Handle complex numbers
            if isinstance(result, complex):
                return {
                    'success': True,
                    'result': result,
                    'real': result.real,
                    'imaginary': result.imag,
                    'formatted': cls._format_complex(result)
                }
            
            return {
                'success': True,
                'result': float(result),
                'formatted': cls._format_result(result),
                'expression': expression
            }
            
        except ZeroDivisionError:
            return {
                'success': False,
                'error': 'Division by zero',
                'expression': expression
            }
        except ValueError as e:
            return {
                'success': False,
                'error': f'Value error: {str(e)}',
                'expression': expression
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Evaluation error: {str(e)}',
                'expression': expression
            }
    
    @classmethod
    def _sanitize_expression(cls, expr: str) -> str:
        """Sanitize mathematical expression for safe evaluation"""
        # Remove whitespace
        expr = expr.strip()
        
        # Replace common notation
        expr = expr.replace('^', '**')  # Power notation
        expr = expr.replace('×', '*')  # Multiplication
        expr = expr.replace('÷', '/')  # Division
        expr = expr.replace('−', '-')  # Minus
        
        # Handle implicit multiplication (e.g., 2x -> 2*x, 2pi -> 2*pi)
        expr = re.sub(r'(\d)([a-zA-Zπφ])', r'\1*\2', expr)
        expr = re.sub(r'(\))(\d)', r'\1*\2', expr)
        expr = re.sub(r'(\d)(\()', r'\1*\2', expr)
        expr = re.sub(r'(\))(\()', r'\1*\2', expr)
        
        return expr
    
    @classmethod
    def _build_eval_context(cls) -> dict:
        """Build the evaluation context with math functions and constants"""
        context = {
            # Basic math functions
            'abs': abs,
            'round': round,
            'min': min,
            'max': max,
            'sum': sum,
            
            # Trigonometric functions
            'sin': math.sin,
            'cos': math.cos,
            'tan': math.tan,
            'asin': math.asin,
            'acos': math.acos,
            'atan': math.atan,
            'atan2': math.atan2,
            'sinh': math.sinh,
            'cosh': math.cosh,
            'tanh': math.tanh,
            'asinh': math.asinh,
            'acosh': math.acosh,
            'atanh': math.atanh,
            
            # Logarithmic and exponential
            'log': math.log,
            'log10': math.log10,
            'log2': math.log2,
            'ln': math.log,
            'exp': math.exp,
            'expm1': math.expm1,
            
            # Power and root functions
            'sqrt': math.sqrt,
            'cbrt': lambda x: x ** (1/3),
            'pow': pow,
            'hypot': math.hypot,
            
            # Special functions
            'factorial': math.factorial,
            'gamma': math.gamma,
            'erf': math.erf,
            'erfc': math.erfc,
            
            # Rounding functions
            'floor': math.floor,
            'ceil': math.ceil,
            'trunc': math.trunc,
            
            # Other math functions
            'degrees': math.degrees,
            'radians': math.radians,
            'mod': math.fmod,
            'gcd': math.gcd,
            'lcm': lambda a, b: abs(a * b) // math.gcd(a, b),
            
            # Complex number support
            'complex': complex,
            'real': lambda z: complex(z).real,
            'imag': lambda z: complex(z).imag,
            'conj': lambda z: complex(z).conjugate(),
            'phase': lambda z: math.atan2(complex(z).imag, complex(z).real),
            'polar': lambda z: (abs(complex(z)), math.atan2(complex(z).imag, complex(z).real)),
            'rect': lambda r, phi: complex(r * math.cos(phi), r * math.sin(phi)),
        }
        
        # Add constants
        context.update(cls.CONSTANTS)
        
        return context
    
    @classmethod
    def _format_result(cls, value: float) -> str:
        """Format the result with appropriate precision"""
        if math.isnan(value) or math.isinf(value):
            return str(value)
        
        if abs(value) < 1e-10:
            return f"{value:.6e}"
        elif abs(value) < 0.001 or abs(value) > 1e6:
            return f"{value:.6e}"
        elif abs(value) < 1:
            return f"{value:.8f}"
        elif abs(value) < 100:
            return f"{value:.6f}"
        elif abs(value) < 10000:
            return f"{value:.4f}"
        else:
            return f"{value:.2f}"
    
    @classmethod
    def _format_complex(cls, value: complex) -> str:
        """Format complex number result"""
        real = cls._format_result(value.real)
        imag = abs(value.imag)
        sign = '+' if value.imag >= 0 else '-'
        return f"{real} {sign} {cls._format_result(imag)}i"
    
    # ==================== Engineering Formulas ====================
    
    @classmethod
    def ohms_law(cls, voltage: float = None, current: float = None, 
                 resistance: float = None, power: float = None) -> dict:
        """
        Calculate Ohm's Law relationships
        Provide any two values to calculate the others
        """
        results = {}
        
        if voltage is not None and current is not None:
            results['resistance'] = voltage / current
            results['power'] = voltage * current
        elif voltage is not None and resistance is not None:
            results['current'] = voltage / resistance
            results['power'] = voltage ** 2 / resistance
        elif voltage is not None and power is not None:
            results['current'] = power / voltage
            results['resistance'] = voltage ** 2 / power
        elif current is not None and resistance is not None:
            results['voltage'] = current * resistance
            results['power'] = current ** 2 * resistance
        elif current is not None and power is not None:
            results['voltage'] = power / current
            results['resistance'] = power / current ** 2
        elif resistance is not None and power is not None:
            results['voltage'] = math.sqrt(power * resistance)
            results['current'] = math.sqrt(power / resistance)
        else:
            return {'success': False, 'error': 'Provide at least two values'}
        
        return {'success': True, **results}
    
    @classmethod
    def power_calculations(cls, power_kw: float = None, voltage_v: float = None,
                          current_a: float = None, power_factor: float = 1.0,
                          phase: int = 3) -> dict:
        """
        Calculate AC power relationships
        """
        results = {'phase': phase, 'power_factor': power_factor}
        
        if power_kw is not None and voltage_v is not None:
            if phase == 3:
                results['current_a'] = (power_kw * 1000) / (math.sqrt(3) * voltage_v * power_factor)
                results['apparent_power_kva'] = power_kw / power_factor
                results['reactive_power_kvar'] = results['apparent_power_kva'] * math.sin(math.acos(power_factor))
            else:
                results['current_a'] = (power_kw * 1000) / (voltage_v * power_factor)
                results['apparent_power_kva'] = power_kw / power_factor
                results['reactive_power_kvar'] = results['apparent_power_kva'] * math.sin(math.acos(power_factor))
        elif voltage_v is not None and current_a is not None:
            if phase == 3:
                results['apparent_power_kva'] = (math.sqrt(3) * voltage_v * current_a) / 1000
                results['power_kw'] = results['apparent_power_kva'] * power_factor
                results['reactive_power_kvar'] = results['apparent_power_kva'] * math.sin(math.acos(power_factor))
            else:
                results['apparent_power_kva'] = (voltage_v * current_a) / 1000
                results['power_kw'] = results['apparent_power_kva'] * power_factor
                results['reactive_power_kvar'] = results['apparent_power_kva'] * math.sin(math.acos(power_factor))
        else:
            return {'success': False, 'error': 'Provide power and voltage, or voltage and current'}
        
        return {'success': True, **results}
    
    @classmethod
    def beam_deflection(cls, length: float, load: float, elasticity: float,
                       moment_of_inertia: float, load_type: str = 'point',
                       support_type: str = 'simply_supported') -> dict:
        """
        Calculate beam deflection
        """
        # Common factor
        E_I = elasticity * moment_of_inertia
        
        if support_type == 'simply_supported':
            if load_type == 'point':
                # Point load at center
                max_deflection = (load * length ** 3) / (48 * E_I)
                max_moment = (load * length) / 4
            elif load_type == 'udl':
                # Uniformly distributed load
                max_deflection = (5 * load * length ** 4) / (384 * E_I)
                max_moment = (load * length ** 2) / 8
            else:
                return {'success': False, 'error': 'Unknown load type'}
        elif support_type == 'cantilever':
            if load_type == 'point':
                # Point load at free end
                max_deflection = (load * length ** 3) / (3 * E_I)
                max_moment = load * length
            elif load_type == 'udl':
                # Uniformly distributed load
                max_deflection = (load * length ** 4) / (8 * E_I)
                max_moment = (load * length ** 2) / 2
            else:
                return {'success': False, 'error': 'Unknown load type'}
        elif support_type == 'fixed_both':
            if load_type == 'point':
                # Point load at center
                max_deflection = (load * length ** 3) / (192 * E_I)
                max_moment = (load * length) / 8
            elif load_type == 'udl':
                # Uniformly distributed load
                max_deflection = (load * length ** 4) / (384 * E_I)
                max_moment = (load * length ** 2) / 12
            else:
                return {'success': False, 'error': 'Unknown load type'}
        else:
            return {'success': False, 'error': 'Unknown support type'}
        
        return {
            'success': True,
            'max_deflection': max_deflection,
            'max_moment': max_moment,
            'deflection_ratio': length / max_deflection if max_deflection != 0 else None
        }
    
    @classmethod
    def pipe_flow(cls, diameter: float, velocity: float = None,
                  flow_rate: float = None, fluid_density: float = 1000) -> dict:
        """
        Calculate pipe flow parameters
        """
        area = math.pi * (diameter / 2) ** 2
        
        if velocity is not None and flow_rate is None:
            flow_rate = velocity * area
        elif flow_rate is not None and velocity is None:
            velocity = flow_rate / area
        else:
            return {'success': False, 'error': 'Provide either velocity or flow rate'}
        
        mass_flow = flow_rate * fluid_density
        
        return {
            'success': True,
            'area': area,
            'velocity': velocity,
            'flow_rate': flow_rate,
            'mass_flow_rate': mass_flow,
            'velocity_head': velocity ** 2 / (2 * 9.80665)
        }
    
    @classmethod
    def reynolds_number(cls, velocity: float, diameter: float,
                       density: float, viscosity: float) -> dict:
        """
        Calculate Reynolds number for flow characterization
        """
        Re = (density * velocity * diameter) / viscosity
        
        if Re < 2300:
            flow_type = 'laminar'
        elif Re < 4000:
            flow_type = 'transitional'
        else:
            flow_type = 'turbulent'
        
        return {
            'success': True,
            'reynolds_number': Re,
            'flow_type': flow_type,
            'is_laminar': Re < 2300,
            'is_turbulent': Re > 4000
        }
    
    @classmethod
    def pump_power(cls, flow_rate: float, head: float,
                  efficiency: float = 75, fluid_density: float = 1000) -> dict:
        """
        Calculate pump power requirements
        flow_rate: m³/h
        head: m
        efficiency: %
        """
        # Convert flow rate to m³/s
        flow_m3s = flow_rate / 3600
        
        # Hydraulic power
        hydraulic_power = fluid_density * 9.80665 * flow_m3s * head
        
        # Motor power (accounting for efficiency)
        efficiency_decimal = efficiency / 100
        motor_power = hydraulic_power / efficiency_decimal
        
        return {
            'success': True,
            'hydraulic_power_kw': hydraulic_power / 1000,
            'motor_power_kw': motor_power / 1000,
            'hydraulic_power_hp': hydraulic_power / 745.7,
            'motor_power_hp': motor_power / 745.7,
            'efficiency': efficiency
        }
    
    @classmethod
    def heat_transfer(cls, area: float, temp_diff: float,
                     u_value: float = None, k: float = None, thickness: float = None,
                     h_inside: float = None, h_outside: float = None) -> dict:
        """
        Calculate heat transfer
        """
        if u_value is None:
            if k is not None and thickness is not None:
                # Calculate U-value from thermal conductivity
                r_conduction = thickness / k
                r_total = r_conduction
                
                if h_inside is not None:
                    r_total += 1 / h_inside
                if h_outside is not None:
                    r_total += 1 / h_outside
                
                u_value = 1 / r_total
            else:
                return {'success': False, 'error': 'Provide U-value or k and thickness'}
        
        heat_transfer_rate = u_value * area * temp_diff
        
        return {
            'success': True,
            'u_value': u_value,
            'heat_transfer_rate_w': heat_transfer_rate,
            'heat_transfer_rate_kw': heat_transfer_rate / 1000,
            'heat_flux': heat_transfer_rate / area
        }
    
    @classmethod
    def ideal_gas(cls, pressure: float = None, volume: float = None,
                  moles: float = None, temperature: float = None,
                  R: float = 8.314) -> dict:
        """
        Ideal gas law calculations
        PV = nRT
        """
        results = {'R': R}
        
        if pressure is None:
            if volume and moles and temperature:
                results['pressure'] = (moles * R * temperature) / volume
            else:
                return {'success': False, 'error': 'Missing parameters'}
        elif volume is None:
            if pressure and moles and temperature:
                results['volume'] = (moles * R * temperature) / pressure
            else:
                return {'success': False, 'error': 'Missing parameters'}
        elif moles is None:
            if pressure and volume and temperature:
                results['moles'] = (pressure * volume) / (R * temperature)
            else:
                return {'success': False, 'error': 'Missing parameters'}
        elif temperature is None:
            if pressure and volume and moles:
                results['temperature'] = (pressure * volume) / (moles * R)
            else:
                return {'success': False, 'error': 'Missing parameters'}
        else:
            return {'success': False, 'error': 'Provide exactly three parameters'}
        
        return {'success': True, **results}
    
    @classmethod
    def stress_strain(cls, force: float = None, area: float = None,
                     stress: float = None, strain: float = None,
                     elongation: float = None, original_length: float = None,
                     youngs_modulus: float = None) -> dict:
        """
        Calculate stress-strain relationships
        """
        results = {}
        
        # Calculate stress
        if stress is None and force is not None and area is not None:
            stress = force / area
            results['stress'] = stress
        
        # Calculate strain
        if strain is None:
            if elongation is not None and original_length is not None:
                strain = elongation / original_length
                results['strain'] = strain
        
        # Calculate Young's modulus
        if youngs_modulus is None and stress is not None and strain is not None:
            youngs_modulus = stress / strain
            results['youngs_modulus'] = youngs_modulus
        elif youngs_modulus is not None and stress is None and strain is not None:
            stress = youngs_modulus * strain
            results['stress'] = stress
        elif youngs_modulus is not None and strain is None and stress is not None:
            strain = stress / youngs_modulus
            results['strain'] = strain
        
        # Calculate elongation
        if elongation is None and strain is not None and original_length is not None:
            elongation = strain * original_length
            results['elongation'] = elongation
        
        return {'success': True, **results}
    
    @classmethod
    def motor_sizing(cls, power_kw: float, speed_rpm: float,
                    torque_nm: float = None, efficiency: float = 90) -> dict:
        """
        Calculate motor parameters
        """
        results = {'efficiency': efficiency}
        
        if torque_nm is None:
            # Calculate torque from power
            torque_nm = (power_kw * 1000 * 60) / (2 * math.pi * speed_rpm)
            results['torque_nm'] = torque_nm
        else:
            # Calculate power from torque
            power_kw = (torque_nm * 2 * math.pi * speed_rpm) / (60000)
            results['power_kw'] = power_kw
        
        # Input power accounting for efficiency
        input_power = power_kw / (efficiency / 100)
        results['input_power_kw'] = input_power
        
        # Current estimation (assuming 400V, 3-phase)
        current = (input_power * 1000) / (math.sqrt(3) * 400 * 0.85)
        results['estimated_current_a'] = current
        
        return {'success': True, **results}
    
    @classmethod
    def transformer_calculation(cls, primary_voltage: float, secondary_voltage: float,
                               power_kva: float = None, primary_current: float = None,
                               secondary_current: float = None) -> dict:
        """
        Calculate transformer parameters
        """
        turns_ratio = primary_voltage / secondary_voltage
        results = {
            'turns_ratio': turns_ratio,
            'voltage_ratio': turns_ratio
        }
        
        if power_kva is not None:
            results['power_kva'] = power_kva
            results['primary_current'] = (power_kva * 1000) / (math.sqrt(3) * primary_voltage)
            results['secondary_current'] = (power_kva * 1000) / (math.sqrt(3) * secondary_voltage)
        elif primary_current is not None:
            results['primary_current'] = primary_current
            results['secondary_current'] = primary_current * turns_ratio
            power_kva = (math.sqrt(3) * primary_voltage * primary_current) / 1000
            results['power_kva'] = power_kva
        elif secondary_current is not None:
            results['secondary_current'] = secondary_current
            results['primary_current'] = secondary_current / turns_ratio
            power_kva = (math.sqrt(3) * secondary_voltage * secondary_current) / 1000
            results['power_kva'] = power_kva
        else:
            return {'success': False, 'error': 'Provide power or current values'}
        
        return {'success': True, **results}
    
    @classmethod
    def voltage_drop_calculation(cls, current: float, length: float,
                                cable_size_mm2: float, voltage: float,
                                power_factor: float = 0.85,
                                material: str = 'copper') -> dict:
        """
        Calculate voltage drop in cables
        """
        # Resistivity (Ω·mm²/m)
        resistivity = 0.0172 if material == 'copper' else 0.0282
        
        # Resistance
        resistance = (resistivity * length * 2) / cable_size_mm2
        
        # Reactance (approximate for typical cables)
        reactance = 0.08 * length / 1000  # Ω/km
        
        # Voltage drop
        voltage_drop = current * (resistance * power_factor + reactance * math.sin(math.acos(power_factor)))
        voltage_drop_percent = (voltage_drop / voltage) * 100
        
        return {
            'success': True,
            'resistance': resistance,
            'reactance': reactance,
            'voltage_drop_v': voltage_drop,
            'voltage_drop_percent': voltage_drop_percent,
            'receiving_voltage': voltage - voltage_drop,
            'within_limits': voltage_drop_percent <= 5  # Typical 5% limit
        }
    
    @classmethod
    def power_factor_correction(cls, active_power_kw: float, current_pf: float,
                               target_pf: float = 0.95) -> dict:
        """
        Calculate capacitor size for power factor correction
        """
        # Calculate reactive power before correction
        initial_reactive = active_power_kw * math.tan(math.acos(current_pf))
        
        # Calculate reactive power after correction
        final_reactive = active_power_kw * math.tan(math.acos(target_pf))
        
        # Capacitor reactive power needed
        capacitor_kvar = initial_reactive - final_reactive
        
        # Apparent power before and after
        initial_apparent = active_power_kw / current_pf
        final_apparent = active_power_kw / target_pf
        
        # Current reduction
        current_reduction = (1 - current_pf / target_pf) * 100
        
        return {
            'success': True,
            'initial_reactive_kvar': initial_reactive,
            'final_reactive_kvar': final_reactive,
            'capacitor_kvar': capacitor_kvar,
            'initial_apparent_kva': initial_apparent,
            'final_apparent_kva': final_apparent,
            'current_reduction_percent': current_reduction,
            'power_factor_improved': target_pf > current_pf
        }
    
    @classmethod
    def solve_quadratic(cls, a: float, b: float, c: float) -> dict:
        """
        Solve quadratic equation ax² + bx + c = 0
        """
        discriminant = b ** 2 - 4 * a * c
        
        if discriminant > 0:
            x1 = (-b + math.sqrt(discriminant)) / (2 * a)
            x2 = (-b - math.sqrt(discriminant)) / (2 * a)
            return {
                'success': True,
                'solutions': [x1, x2],
                'x1': x1,
                'x2': x2,
                'discriminant': discriminant,
                'nature': 'two_real_roots'
            }
        elif discriminant == 0:
            x = -b / (2 * a)
            return {
                'success': True,
                'solutions': [x],
                'x': x,
                'discriminant': discriminant,
                'nature': 'one_real_root'
            }
        else:
            real_part = -b / (2 * a)
            imag_part = math.sqrt(-discriminant) / (2 * a)
            return {
                'success': True,
                'solutions': [complex(real_part, imag_part), complex(real_part, -imag_part)],
                'x1': f"{real_part} + {imag_part}i",
                'x2': f"{real_part} - {imag_part}i",
                'discriminant': discriminant,
                'nature': 'complex_roots'
            }
    
    @classmethod
    def percentage_calculations(cls, value: float = None, percentage: float = None,
                               total: float = None, operation: str = 'of') -> dict:
        """
        Various percentage calculations
        """
        results = {}
        
        if operation == 'of':
            # X% of Y
            if percentage is not None and total is not None:
                results['result'] = (percentage / 100) * total
                results['description'] = f"{percentage}% of {total}"
        elif operation == 'is':
            # X is what % of Y
            if value is not None and total is not None:
                results['result'] = (value / total) * 100
                results['description'] = f"{value} is {results['result']:.2f}% of {total}"
        elif operation == 'increase':
            # Increase Y by X%
            if total is not None and percentage is not None:
                results['result'] = total * (1 + percentage / 100)
                results['description'] = f"{total} increased by {percentage}%"
        elif operation == 'decrease':
            # Decrease Y by X%
            if total is not None and percentage is not None:
                results['result'] = total * (1 - percentage / 100)
                results['description'] = f"{total} decreased by {percentage}%"
        elif operation == 'change':
            # Percentage change from X to Y
            if value is not None and total is not None:
                results['result'] = ((value - total) / total) * 100
                results['description'] = f"Change from {total} to {value}"
        else:
            return {'success': False, 'error': 'Unknown operation'}
        
        return {'success': True, **results}
    
    @classmethod
    def get_available_functions(cls) -> dict:
        """Get list of all available functions and their descriptions"""
        return {
            'expression': {
                'description': 'Evaluate mathematical expressions',
                'parameters': ['expression', 'variables (optional)']
            },
            'ohms_law': {
                'description': "Calculate Ohm's Law relationships",
                'parameters': ['voltage', 'current', 'resistance', 'power (provide any two)']
            },
            'power_calculations': {
                'description': 'Calculate AC power relationships',
                'parameters': ['power_kw', 'voltage_v', 'current_a', 'power_factor', 'phase']
            },
            'beam_deflection': {
                'description': 'Calculate beam deflection',
                'parameters': ['length', 'load', 'elasticity', 'moment_of_inertia', 'load_type', 'support_type']
            },
            'pipe_flow': {
                'description': 'Calculate pipe flow parameters',
                'parameters': ['diameter', 'velocity', 'flow_rate', 'fluid_density']
            },
            'reynolds_number': {
                'description': 'Calculate Reynolds number',
                'parameters': ['velocity', 'diameter', 'density', 'viscosity']
            },
            'pump_power': {
                'description': 'Calculate pump power requirements',
                'parameters': ['flow_rate', 'head', 'efficiency', 'fluid_density']
            },
            'heat_transfer': {
                'description': 'Calculate heat transfer',
                'parameters': ['area', 'temp_diff', 'u_value', 'k', 'thickness', 'h_inside', 'h_outside']
            },
            'ideal_gas': {
                'description': 'Ideal gas law calculations',
                'parameters': ['pressure', 'volume', 'moles', 'temperature', 'R']
            },
            'stress_strain': {
                'description': 'Calculate stress-strain relationships',
                'parameters': ['force', 'area', 'stress', 'strain', 'elongation', 'original_length', 'youngs_modulus']
            },
            'motor_sizing': {
                'description': 'Calculate motor parameters',
                'parameters': ['power_kw', 'speed_rpm', 'torque_nm', 'efficiency']
            },
            'transformer_calculation': {
                'description': 'Calculate transformer parameters',
                'parameters': ['primary_voltage', 'secondary_voltage', 'power_kva', 'primary_current', 'secondary_current']
            },
            'voltage_drop_calculation': {
                'description': 'Calculate voltage drop in cables',
                'parameters': ['current', 'length', 'cable_size_mm2', 'voltage', 'power_factor', 'material']
            },
            'power_factor_correction': {
                'description': 'Calculate capacitor size for power factor correction',
                'parameters': ['active_power_kw', 'current_pf', 'target_pf']
            },
            'solve_quadratic': {
                'description': 'Solve quadratic equation',
                'parameters': ['a', 'b', 'c']
            },
            'percentage_calculations': {
                'description': 'Various percentage calculations',
                'parameters': ['value', 'percentage', 'total', 'operation']
            }
        }
    
    @classmethod
    def get_constants(cls) -> dict:
        """Get list of all available constants"""
        return cls.CONSTANTS.copy()
