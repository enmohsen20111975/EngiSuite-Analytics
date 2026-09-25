/**
 * Update Backup Power Assessment Pipeline
 * Updates the pipeline with proper UPS/Battery equations and realistic data
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../Databases/workflows.db');

try {
  const db = new Database(dbPath, { readonly: false });
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  console.log('\n=== Updating Backup Power Assessment Pipeline ===\n');
  
  // Find the pipeline
  const pipeline = db.prepare(`
    SELECT * FROM calculation_pipelines 
    WHERE pipeline_id = 'electrical_pipeline_backup_power_assessment'
  `).get();
  
  if (!pipeline) {
    console.error('Pipeline not found!');
    process.exit(1);
  }
  
  console.log(`Found pipeline: ${pipeline.name} (ID: ${pipeline.id})`);
  
  // Update pipeline description
  db.prepare(`
    UPDATE calculation_pipelines 
    SET description = 'Complete UPS and battery backup power assessment including capacity sizing, runtime calculation, and load analysis per IEEE standards'
    WHERE id = ?
  `).run(pipeline.id);
  
  // Delete existing steps
  db.prepare('DELETE FROM calculation_steps WHERE pipeline_id = ?').run(pipeline.id);
  console.log('Deleted old steps');
  
  // Define new steps with proper equation references and configurations
  const steps = [
    {
      step_number: 1,
      step_id: 'step_battery_capacity',
      name: 'Battery Capacity Calculation',
      description: 'Calculate required battery capacity in Amp-Hours based on load and backup duration',
      calculation_type: 'equation',
      formula_ref: 'eq_battery_capacity_ah',
      formula: 'Ah = (P * t * SF) / (V_dc * eta)',
      input_config: JSON.stringify([
        {
          name: 'load_power',
          symbol: 'P',
          unit: 'W',
          type: 'number',
          required: true,
          default: 5000,
          min_value: 100,
          max_value: 1000000,
          help_text: 'Total power consumption of connected loads'
        },
        {
          name: 'backup_time',
          symbol: 't',
          unit: 'hours',
          type: 'number',
          required: true,
          default: 2,
          min_value: 0.25,
          max_value: 24,
          help_text: 'Required backup duration'
        },
        {
          name: 'safety_factor',
          symbol: 'SF',
          unit: '',
          type: 'number',
          required: true,
          default: 1.25,
          min_value: 1.0,
          max_value: 2.0,
          help_text: 'Safety margin (typically 1.2-1.5)'
        },
        {
          name: 'dc_voltage',
          symbol: 'V_dc',
          unit: 'V',
          type: 'number',
          required: true,
          default: 48,
          min_value: 12,
          max_value: 600,
          help_text: 'Battery bank DC voltage (common: 12V, 24V, 48V)'
        },
        {
          name: 'efficiency',
          symbol: 'eta',
          unit: '',
          type: 'number',
          required: true,
          default: 0.90,
          min_value: 0.70,
          max_value: 0.98,
          help_text: 'UPS/Inverter efficiency (typical: 0.85-0.95)'
        }
      ]),
      output_config: JSON.stringify([
        {
          name: 'battery_capacity',
          symbol: 'Ah',
          unit: 'Ah',
          type: 'number',
          precision: 1,
          description: 'Required battery capacity in Amp-Hours'
        }
      ])
    },
    {
      step_number: 2,
      step_id: 'step_energy_storage',
      name: 'Energy Storage Calculation',
      description: 'Calculate total energy storage capacity in Watt-Hours',
      calculation_type: 'equation',
      formula_ref: 'eq_battery_energy_wh',
      formula: 'E_wh = V_dc * Ah',
      input_config: JSON.stringify([
        {
          name: 'dc_voltage',
          symbol: 'V_dc',
          unit: 'V',
          type: 'number',
          required: true,
          default: 48,
          min_value: 12,
          max_value: 600,
          help_text: 'Battery bank voltage'
        },
        {
          name: 'capacity_ah',
          symbol: 'Ah',
          unit: 'Ah',
          type: 'number',
          required: true,
          default: 100,
          min_value: 1,
          max_value: 10000,
          help_text: 'Battery capacity from previous step or available capacity'
        }
      ]),
      output_config: JSON.stringify([
        {
          name: 'energy_storage',
          symbol: 'E_Wh',
          unit: 'Wh',
          type: 'number',
          precision: 1,
          description: 'Total energy storage capacity'
        }
      ])
    },
    {
      step_number: 3,
      step_id: 'step_ups_runtime',
      name: 'UPS Runtime Verification',
      description: 'Calculate actual runtime based on battery capacity and connected load',
      calculation_type: 'equation',
      formula_ref: 'eq_ups_runtime',
      formula: 't_runtime = (V_dc * Ah * eta) / P',
      input_config: JSON.stringify([
        {
          name: 'dc_voltage',
          symbol: 'V_dc',
          unit: 'V',
          type: 'number',
          required: true,
          default: 48,
          min_value: 12,
          max_value: 600,
          help_text: 'Battery bank voltage'
        },
        {
          name: 'capacity_ah',
          symbol: 'Ah',
          unit: 'Ah',
          type: 'number',
          required: true,
          default: 100,
          min_value: 1,
          max_value: 10000,
          help_text: 'Available battery capacity'
        },
        {
          name: 'efficiency',
          symbol: 'eta',
          unit: '',
          type: 'number',
          required: true,
          default: 0.90,
          min_value: 0.70,
          max_value: 0.98,
          help_text: 'System efficiency'
        },
        {
          name: 'load_power',
          symbol: 'P',
          unit: 'W',
          type: 'number',
          required: true,
          default: 2000,
          min_value: 10,
          max_value: 1000000,
          help_text: 'Connected load power'
        }
      ]),
      output_config: JSON.stringify([
        {
          name: 'runtime',
          symbol: 't_runtime',
          unit: 'hours',
          type: 'number',
          precision: 2,
          description: 'Expected backup runtime'
        }
      ])
    },
    {
      step_number: 4,
      step_id: 'step_ups_load',
      name: 'UPS Load Utilization Check',
      description: 'Verify UPS load percentage is within acceptable range (typically 50-80%)',
      calculation_type: 'equation',
      formula_ref: 'eq_ups_load_percentage',
      formula: 'Load_pct = (P_load / P_ups_rated) * 100',
      input_config: JSON.stringify([
        {
          name: 'load_power',
          symbol: 'P_load',
          unit: 'kVA',
          type: 'number',
          required: true,
          default: 30,
          min_value: 0.1,
          max_value: 10000,
          help_text: 'Total connected load'
        },
        {
          name: 'ups_rated_power',
          symbol: 'P_ups',
          unit: 'kVA',
          type: 'number',
          required: true,
          default: 40,
          min_value: 1,
          max_value: 10000,
          help_text: 'UPS nameplate rating'
        }
      ]),
      output_config: JSON.stringify([
        {
          name: 'load_percentage',
          symbol: 'Load_%',
          unit: '%',
          type: 'number',
          precision: 1,
          description: 'UPS load utilization percentage'
        }
      ])
    }
  ];
  
  // Insert new steps
  const insertStep = db.prepare(`
    INSERT INTO calculation_steps (
      pipeline_id, step_number, step_id, name, description,
      calculation_type, formula_ref, formula, 
      input_config, output_config,
      step_type, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'calculation', 1)
  `);
  
  for (const step of steps) {
    insertStep.run(
      pipeline.id,
      step.step_number,
      step.step_id,
      step.name,
      step.description,
      step.calculation_type,
      step.formula_ref,
      step.formula,
      step.input_config,
      step.output_config
    );
    console.log(`✓ Added Step ${step.step_number}: ${step.name}`);
  }
  
  console.log('\n✅ Pipeline updated successfully!');
  console.log('\nSummary:');
  console.log(`  - Pipeline: ${pipeline.name}`);
  console.log(`  - Steps: ${steps.length}`);
  console.log('  - All steps now have proper equations, units, and descriptions');
  
  db.close();
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
