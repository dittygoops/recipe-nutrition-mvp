import { useState } from 'react'
import { INGREDIENTS, UNITS } from './constants'

interface Ingredient {
  id: string
  name: string
  amount: string
  unit: string
}

// Fuzzy search utility function
function fuzzySearch(query: string, options: readonly string[]): string[] {
  if (!query.trim()) return []
  
  const searchTerm = query.toLowerCase()
  return options
    .filter(option => {
      const optionLower = option.toLowerCase()
      return optionLower.includes(searchTerm) || 
             searchTerm.split(' ').every(word => optionLower.includes(word))
    })
    .slice(0, 10) // Limit to 10 results
}

function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: '', amount: '', unit: '' }
  ])
  const [showNameDropdown, setShowNameDropdown] = useState<string | null>(null)
  const [showUnitDropdown, setShowUnitDropdown] = useState<string | null>(null)

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: '',
      amount: '',
      unit: ''
    }
    setIngredients([...ingredients, newIngredient])
  }

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(ingredient => ingredient.id !== id))
    }
  }

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setIngredients(ingredients.map(ingredient => 
      ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
    ))
    
    // Show dropdowns when typing
    if (field === 'name') {
      setShowNameDropdown(id)
      setShowUnitDropdown(null)
    } else if (field === 'unit') {
      setShowUnitDropdown(id)
      setShowNameDropdown(null)
    }
  }

  const calculateMacros = async () => {
    console.log('Calculating macros for ingredients:', ingredients)
    
    // Format ingredients for API
    const ingredientsList = ingredients.map(ingredient => `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`)
    
    // Prepare request data
    const requestData = {
      ingredients: ingredientsList,
      title: "Recipe",
      servings: 1
    }
    
    try {
      const response = await fetch('https://web-production-15cb5.up.railway.app/calculate_macros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Macro calculation result:', data)
        // TODO: Display the results in the UI
      } else {
        console.error('Error calculating macros:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error sending request:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Recipe Nutrition Calculator
          </h1>
          <p className="text-gray-600">
            Add your ingredients to calculate nutritional information
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Ingredients
            </h2>
            
            {ingredients.map((ingredient, index) => (
              <div key={ingredient.id} className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredient Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                      placeholder="e.g., Chicken breast"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {ingredient.name && showNameDropdown === ingredient.id && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {fuzzySearch(ingredient.name, INGREDIENTS).map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              updateIngredient(ingredient.id, 'name', suggestion)
                              setShowNameDropdown(null)
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={ingredient.amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and decimals
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        updateIngredient(ingredient.id, 'amount', value);
                      }
                    }}
                    placeholder="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                      placeholder="g"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {ingredient.unit && showUnitDropdown === ingredient.id && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {fuzzySearch(ingredient.unit, UNITS).map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              updateIngredient(ingredient.id, 'unit', suggestion)
                              setShowUnitDropdown(null)
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => removeIngredient(ingredient.id)}
                    disabled={ingredients.length === 1}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <button
              onClick={addIngredient}
              className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors font-medium"
            >
              + Add Another Ingredient
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={calculateMacros}
            disabled={ingredients.some(ing => !ing.name || !ing.amount || !ing.unit)}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
          >
            Calculate Macros
          </button>
        </div>
      </div>
    </div>
  )
}

export default App