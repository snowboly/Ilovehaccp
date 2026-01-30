export type SamplePlanFixture = {
  businessName: string;
  productName: string;
  productDescription: string;
  intendedUse: string;
  storageType: string;
  mainIngredients: string;
  shelfLife: string;
  planVersion: number;
  isPaid: boolean;
  fullPlan: Record<string, any>;
};

export const samplePlanFixture: SamplePlanFixture = {
  businessName: 'Sample Foods Co.',
  productName: 'Ready-to-Eat Salad',
  productDescription: 'Fresh mixed greens with vegetables',
  intendedUse: 'Ready-to-eat, refrigerated',
  storageType: 'Keep refrigerated at ≤4°C',
  mainIngredients: 'Romaine lettuce, carrots, cherry tomatoes',
  shelfLife: '5 days refrigerated',
  planVersion: 1,
  isPaid: false,
  fullPlan: {
    businessName: 'Sample Foods Co.',
    planVersion: 1,
    _original_inputs: {
      product: {
        product_name: 'Ready-to-Eat Salad',
        product_category: 'Prepared foods',
        key_ingredients: 'Romaine lettuce, carrots, cherry tomatoes',
        allergens: 'None',
        packaging_type: 'Sealed food-grade container',
        shelf_life: '5 days refrigerated',
        storage_conditions: 'Keep refrigerated at ≤4°C',
        intended_use: 'Ready-to-eat',
        intended_consumer: 'General public'
      },
      process: {
        process_steps: [
          {
            step_name: 'Receiving',
            step_description: 'Inspect produce upon delivery for temperature and condition.'
          },
          {
            step_name: 'Washing',
            step_description: 'Wash produce with potable water and sanitized equipment.'
          },
          {
            step_name: 'Packaging',
            step_description: 'Assemble ingredients and seal containers under hygienic conditions.'
          }
        ]
      }
    },
    prerequisite_programs: [
      {
        program: 'Sanitation',
        exists: 'Yes',
        documented: 'Yes',
        reference: 'SSOP-01'
      }
    ],
    hazard_analysis: [
      {
        step_name: 'Washing',
        hazards: 'Biological hazards (pathogens)',
        hazard_type: 'Biological',
        severity: 'High',
        likelihood: 'Medium',
        is_ccp: false,
        control_measure: ['Process control'],
        control_measure_description: 'Wash with potable water and sanitize equipment between batches.'
      }
    ]
  }
};
