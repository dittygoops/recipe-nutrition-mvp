import csv

def process_ingredients_csv():
    ingredients = []
    units_set = set()
    
    # Read the CSV file
    with open('ingredients-with-possible-units.csv', 'r', encoding='utf-8') as file:
        for line in file:
            # Split by semicolon
            parts = line.strip().split(';')
            if len(parts) >= 3:
                # First part is ingredient name
                ingredient_name = parts[0].strip()
                ingredients.append(ingredient_name)
                
                # Last part contains units (comma-separated)
                units_part = parts[-1].strip()
                units = [unit.strip() for unit in units_part.split(',')]
                
                # Add each unit to the set
                for unit in units:
                    if unit:  # Only add non-empty units
                        units_set.add(unit)
    
    # Convert units set to array
    units_array = sorted(list(units_set))
    
    # Generate the constants.ts file
    with open('../src/constants.ts', 'w', encoding='utf-8') as file:
        file.write('// Auto-generated from ingredients-with-possible-units.csv\n\n')
        
        # Write ingredients array
        file.write('export const INGREDIENTS = [\n')
        for ingredient in ingredients:
            file.write(f"  '{ingredient}',\n")
        file.write('] as const;\n\n')
        
        # Write units array
        file.write('export const UNITS = [\n')
        for unit in units_array:
            file.write(f"  '{unit}',\n")
        file.write('] as const;\n\n')
        
        # Write type definitions
        file.write('export type Ingredient = typeof INGREDIENTS[number];\n')
        file.write('export type Unit = typeof UNITS[number];\n')
    
    print(f"Processed {len(ingredients)} ingredients")
    print(f"Found {len(units_array)} unique units")
    print("Generated constants.ts file successfully!")

if __name__ == "__main__":
    process_ingredients_csv()
