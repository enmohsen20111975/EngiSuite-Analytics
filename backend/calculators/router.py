from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from workflow_database import get_workflow_db
from auth.router import get_current_user
from auth.models import User
from calculators.services.electrical import ElectricalCalculators
from calculators.services.mechanical import MechanicalCalculators
from calculators.services.civil import CivilCalculators
from calculators.services.unit_converter import UnitConverter
from calculators.services.engineering_calculator import EngineeringCalculator
from workflow_models import Equation, EquationCategory, EquationInput, EquationOutput
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

router = APIRouter(prefix="/calculators", tags=["calculators"])

class CalculationRequest(BaseModel):
    inputs: Dict[str, Any]

class UnitConversionRequest(BaseModel):
    value: float
    from_unit: str
    to_unit: str
    category: Optional[str] = None

class BatchConversionRequest(BaseModel):
    conversions: List[Dict[str, Any]]

class ExpressionRequest(BaseModel):
    expression: str
    variables: Optional[Dict[str, float]] = None

class EngineeringCalcRequest(BaseModel):
    calculation_type: str
    parameters: Dict[str, Any]

@router.get("/")
async def get_all_calculations(db: Session = Depends(get_workflow_db)):
    """Get all equations grouped by domain"""
    # Get all equations with their categories
    equations = db.query(Equation).all()
    
    # Group by domain
    result = {}
    for eq in equations:
        if eq.domain not in result:
            result[eq.domain] = []
        
        result[eq.domain].append({
            "id": eq.equation_id,
            "name": eq.name,
            "description": eq.description,
            "equation": eq.equation,
            "category": eq.category.name if eq.category else None,
            "difficulty": eq.difficulty_level
        })
    
    return result

@router.get("/{domain}")
async def get_calculators_by_domain(domain: str, db: Session = Depends(get_workflow_db)):
    """Get equations for a specific domain with category hierarchy"""
    domain = domain.lower()
    if domain not in ["electrical", "mechanical", "civil"]:
        raise HTTPException(status_code=404, detail="Discipline not found")
    
    # Load equations from workflow database
    equations = db.query(Equation).filter_by(domain=domain).all()
    
    # Categorize equations into subcategories for better organization
    categories = {
        "electrical": {
            "3phase": [],
            "cable": [],
            "transformer": [],
            "voltage_drop": [],
            "short_circuit": [],
            "power_factor": [],
            "motor": [],
            "lighting": [],
            "earthing": [],
            "other": []
        },
        "mechanical": {
            "hvac": [],
            "pump": [],
            "pipe": [],
            "duct": [],
            "chiller": [],
            "heat_transfer": [],
            "compressor": [],
            "psychrometrics": [],
            "other": []
        },
        "civil": {
            "beam": [],
            "column": [],
            "foundation": [],
            "retaining_wall": [],
            "earthworks": [],
            "concrete": [],
            "steel": [],
            "other": []
        }
    }
    
    # Categorize equations
    for eq in equations:
        calc_data = {
            "id": eq.equation_id,
            "name": eq.name,
            "description": eq.description,
            "equation": eq.equation,
            "category": eq.category.name if eq.category else None,
            "difficulty": eq.difficulty_level
        }
        
        calc_name = eq.name.lower()
        category_assigned = False
        
        for subcategory in categories[domain]:
            if subcategory in calc_name:
                categories[domain][subcategory].append(calc_data)
                category_assigned = True
                break
        
        if not category_assigned:
            categories[domain]["other"].append(calc_data)
    
    # Remove empty subcategories
    categories[domain] = {k: v for k, v in categories[domain].items() if v}
    
    return {"domain": domain, "categories": categories[domain]}

@router.get("/equation/{equation_id}")
async def get_equation_details(equation_id: str, db: Session = Depends(get_workflow_db)):
    """Get detailed information about a specific equation including inputs and outputs"""
    equation = db.query(Equation).filter_by(equation_id=equation_id).first()
    
    if not equation:
        raise HTTPException(status_code=404, detail="Equation not found")
    
    # Get inputs
    inputs = db.query(EquationInput).filter_by(equation_id=equation.id).order_by(EquationInput.input_order).all()
    
    # Get outputs
    outputs = db.query(EquationOutput).filter_by(equation_id=equation.id).order_by(EquationOutput.output_order).all()
    
    return {
        "id": equation.equation_id,
        "name": equation.name,
        "description": equation.description,
        "equation": equation.equation,
        "equation_latex": equation.equation_latex,
        "domain": equation.domain,
        "category": equation.category.name if equation.category else None,
        "difficulty": equation.difficulty_level,
        "tags": equation.tags,
        "inputs": [
            {
                "name": inp.name,
                "symbol": inp.symbol,
                "description": inp.description,
                "data_type": inp.data_type,
                "unit": inp.unit,
                "unit_category": inp.unit_category,
                "required": inp.required,
                "default_value": inp.default_value,
                "min_value": inp.min_value,
                "max_value": inp.max_value,
                "placeholder": inp.placeholder,
                "help_text": inp.help_text
            }
            for inp in inputs
        ],
        "outputs": [
            {
                "name": out.name,
                "symbol": out.symbol,
                "description": out.description,
                "data_type": out.data_type,
                "unit": out.unit,
                "unit_category": out.unit_category,
                "precision": out.precision
            }
            for out in outputs
        ]
    }


@router.get("/{calculator_id}/details")
async def get_calculator_details(calculator_id: str, db: Session = Depends(get_workflow_db)):
    """Get detailed information about a specific calculator including variables for dynamic input generation"""
    equation = db.query(Equation).filter_by(equation_id=calculator_id).first()
    
    if not equation:
        # Try to find by partial match
        equation = db.query(Equation).filter(Equation.equation_id.like(f"%{calculator_id}%")).first()
    
    if not equation:
        raise HTTPException(status_code=404, detail="Calculator not found")
    
    # Get inputs
    inputs = db.query(EquationInput).filter_by(equation_id=equation.id).order_by(EquationInput.input_order).all()
    
    # Get outputs
    outputs = db.query(EquationOutput).filter_by(equation_id=equation.id).order_by(EquationOutput.output_order).all()
    
    # Build variables list for dynamic form generation
    # Inputs come first, then output as the last variable
    variables = []
    
    for inp in inputs:
        variables.append({
            "name": inp.name,
            "symbol": inp.symbol,
            "description": inp.description,
            "unit": inp.unit,
            "default_value": inp.default_value,
            "min_value": inp.min_value,
            "max_value": inp.max_value,
            "is_output": False
        })
    
    for out in outputs:
        variables.append({
            "name": out.name,
            "symbol": out.symbol,
            "description": out.description,
            "unit": out.unit,
            "is_output": True
        })
    
    return {
        "id": equation.equation_id,
        "name": equation.name,
        "description": equation.description,
        "equation": equation.equation,
        "equation_latex": equation.equation_latex,
        "domain": equation.domain,
        "category": equation.category.name if equation.category else None,
        "variables": variables,
        "inputs": [
            {
                "name": inp.name,
                "symbol": inp.symbol,
                "description": inp.description,
                "data_type": inp.data_type,
                "unit": inp.unit,
                "unit_category": inp.unit_category,
                "required": inp.required,
                "default_value": inp.default_value,
                "min_value": inp.min_value,
                "max_value": inp.max_value,
                "placeholder": inp.placeholder,
                "help_text": inp.help_text
            }
            for inp in inputs
        ],
        "outputs": [
            {
                "name": out.name,
                "symbol": out.symbol,
                "description": out.description,
                "data_type": out.data_type,
                "unit": out.unit,
                "unit_category": out.unit_category,
                "precision": out.precision
            }
            for out in outputs
        ]
    }


@router.post("/{type}/calculate")
async def calculate(
    type: str,
    request: CalculationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if type.startswith("electrical_"):
            method_name = type.replace("electrical_", "")
            if hasattr(ElectricalCalculators, method_name):
                method = getattr(ElectricalCalculators, method_name)
                result = method(**request.inputs)
                return result
        elif type.startswith("mechanical_"):
            method_name = type.replace("mechanical_", "")
            if hasattr(MechanicalCalculators, method_name):
                method = getattr(MechanicalCalculators, method_name)
                result = method(**request.inputs)
                return result
        elif type.startswith("civil_"):
            method_name = type.replace("civil_", "")
            if hasattr(CivilCalculators, method_name):
                method = getattr(CivilCalculators, method_name)
                result = method(**request.inputs)
                return result
        
        raise HTTPException(status_code=404, detail="Calculator type not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== Unit Converter Endpoints ====================

@router.get("/unit-converter/categories")
async def get_unit_categories():
    """Get all available unit categories"""
    return {
        "categories": UnitConverter.get_categories(),
        "common_units": {cat: UnitConverter.get_common_units(cat) for cat in UnitConverter.get_categories()}
    }


@router.get("/unit-converter/categories/{category}")
async def get_units_in_category(category: str):
    """Get all units in a specific category"""
    units = UnitConverter.get_units_in_category(category)
    common_units = UnitConverter.get_common_units(category)
    
    if not units:
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found")
    
    return {
        "category": category,
        "units": units,
        "common_units": common_units
    }


@router.post("/unit-converter/convert")
async def convert_unit(request: UnitConversionRequest):
    """Convert a value from one unit to another"""
    result = UnitConverter.convert(
        value=request.value,
        from_unit=request.from_unit,
        to_unit=request.to_unit,
        category=request.category
    )
    return result


@router.post("/unit-converter/batch-convert")
async def batch_convert_units(request: BatchConversionRequest):
    """Perform multiple unit conversions"""
    results = UnitConverter.batch_convert(request.conversions)
    return {"results": results}


# ==================== Engineering Calculator Endpoints ====================

@router.get("/engineering/functions")
async def get_engineering_functions():
    """Get all available engineering calculation functions"""
    return {
        "functions": EngineeringCalculator.get_available_functions(),
        "constants": EngineeringCalculator.get_constants()
    }


@router.post("/engineering/evaluate")
async def evaluate_expression(request: ExpressionRequest):
    """Evaluate a mathematical expression"""
    result = EngineeringCalculator.evaluate_expression(
        expression=request.expression,
        variables=request.variables
    )
    return result


@router.post("/engineering/calculate")
async def perform_engineering_calculation(request: EngineeringCalcRequest):
    """Perform a specific engineering calculation"""
    calc_type = request.calculation_type
    params = request.parameters
    
    try:
        if calc_type == "ohms_law":
            result = EngineeringCalculator.ohms_law(**params)
        elif calc_type == "power_calculations":
            result = EngineeringCalculator.power_calculations(**params)
        elif calc_type == "beam_deflection":
            result = EngineeringCalculator.beam_deflection(**params)
        elif calc_type == "pipe_flow":
            result = EngineeringCalculator.pipe_flow(**params)
        elif calc_type == "reynolds_number":
            result = EngineeringCalculator.reynolds_number(**params)
        elif calc_type == "pump_power":
            result = EngineeringCalculator.pump_power(**params)
        elif calc_type == "heat_transfer":
            result = EngineeringCalculator.heat_transfer(**params)
        elif calc_type == "ideal_gas":
            result = EngineeringCalculator.ideal_gas(**params)
        elif calc_type == "stress_strain":
            result = EngineeringCalculator.stress_strain(**params)
        elif calc_type == "motor_sizing":
            result = EngineeringCalculator.motor_sizing(**params)
        elif calc_type == "transformer_calculation":
            result = EngineeringCalculator.transformer_calculation(**params)
        elif calc_type == "voltage_drop_calculation":
            result = EngineeringCalculator.voltage_drop_calculation(**params)
        elif calc_type == "power_factor_correction":
            result = EngineeringCalculator.power_factor_correction(**params)
        elif calc_type == "solve_quadratic":
            result = EngineeringCalculator.solve_quadratic(**params)
        elif calc_type == "percentage_calculations":
            result = EngineeringCalculator.percentage_calculations(**params)
        else:
            raise HTTPException(status_code=404, detail=f"Calculation type '{calc_type}' not found")
        
        return result
    except TypeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid parameters: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))