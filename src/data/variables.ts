/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /**
     * Correct answer for cloze input validation.
     * Accepts a single string, pipe-separated alternates (e.g. "first | 1 | 1st"),
     * or an array of accepted answers (e.g. ["first", "1", "1st"]).
     */
    correctAnswer?: string | string[];
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ========================================
    // ADD YOUR VARIABLES HERE
    // ========================================

    // ─────────────────────────────────────────
    // Section: The Family of Curves (linked curve + steepness views)
    // ─────────────────────────────────────────
    familyShift: {
        defaultValue: 0,
        type: 'number',
        label: 'Constant added to the curve',
        description: 'The constant C in y = x^2 + C; shared by both linked views',
        min: -3,
        max: 3,
        step: 0.5,
        color: '#62D0AD',
    },
    familyCommitted: {
        defaultValue: 0,
        type: 'number',
        label: 'Prediction committed',
        description: 'Set to 1 once the student has released the curve, revealing the rest of the family',
        min: 0,
        max: 1,
        step: 1,
    },
    familyHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Family figure highlight',
        description: 'Which part of the linked curve and steepness views is highlighted from the prose',
        color: '#0F766E',
        bgColor: 'rgba(98, 208, 173, 0.22)',
    },
    answer_family_count: {
        defaultValue: '',
        type: 'select',
        label: 'How many functions have derivative 2x',
        description: 'Student answer for the number of functions sharing the derivative 2x',
        placeholder: '???',
        correctAnswer: 'infinitely many',
        options: ['just one', 'exactly two', 'infinitely many'],
        color: '#7C3AED',
        bgColor: 'rgba(172, 139, 249, 0.18)',
    },
    answer_family_constant: {
        defaultValue: '',
        type: 'text',
        label: 'Missing constant',
        description: 'Student answer for what must be added when reversing 2x',
        placeholder: '???',
        correctAnswer: ['C', '+C', '+ C'],
        color: '#7C3AED',
        bgColor: 'rgba(172, 139, 249, 0.18)',
    },

    // ─────────────────────────────────────────
    // Section: Undoing the Power Rule (answer-box builder)
    // ─────────────────────────────────────────
    reverseCoefficient: {
        defaultValue: 0,
        type: 'number',
        label: 'Answer coefficient',
        description: 'The number tile currently sitting in the answer box (0 means empty)',
        min: 0,
        max: 8,
        step: 1,
        color: '#62D0AD',
    },
    reversePower: {
        defaultValue: 0,
        type: 'number',
        label: 'Answer power',
        description: 'The power tile currently sitting in the answer box (0 means empty)',
        min: 0,
        max: 5,
        step: 1,
        color: '#62D0AD',
    },
    reverseMatched: {
        defaultValue: 0,
        type: 'number',
        label: 'Answer matches target',
        description: 'Set to 1 once the built answer differentiates back to 8x^3',
        min: 0,
        max: 1,
        step: 1,
        color: '#62D0AD',
    },
    reverseHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Reversal figure highlight',
        description: 'Which part of the answer-box figure is highlighted from the prose',
        color: '#0F766E',
        bgColor: 'rgba(98, 208, 173, 0.22)',
    },
    answer_undoing_twenty: {
        defaultValue: '',
        type: 'text',
        label: 'Reverse 20x^3 answer',
        description: 'Student answer for the number in front when reversing 20x^3',
        placeholder: '???',
        correctAnswer: '5',
        color: '#B45309',
        bgColor: 'rgba(247, 178, 59, 0.18)',
    },
    answer_undoing_power: {
        defaultValue: '',
        type: 'text',
        label: 'Power of the reversed term',
        description: 'Student answer for the power the reversal of 6x^5 must contain',
        placeholder: '???',
        correctAnswer: '6',
        color: '#4338CA',
        bgColor: 'rgba(142, 144, 245, 0.18)',
    },

    // ─────────────────────────────────────────
    // Section: Writing It Down (integral notation tile builder)
    // ─────────────────────────────────────────
    integralTilesPlaced: {
        defaultValue: 0,
        type: 'number',
        label: 'Integral pieces placed',
        description: 'How many symbol tiles the student has correctly placed on the statement line (0-6)',
        min: 0,
        max: 6,
        step: 1,
        color: '#62D0AD',
    },
    integralDxPlaced: {
        defaultValue: 0,
        type: 'number',
        label: 'dx piece placed',
        description: 'Set to 1 once the dx tile is correctly placed in the statement',
        min: 0,
        max: 1,
        step: 1,
        color: '#62D0AD',
    },
    integralSymbolHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Integral symbol highlight',
        description: 'Which piece of the integral statement is currently highlighted from the prose',
        color: '#0F766E',
        bgColor: 'rgba(98, 208, 173, 0.22)',
    },
    answer_writing_reverse: {
        defaultValue: '',
        type: 'text',
        label: 'Reverse 12x^5 answer',
        description: 'Student answer for the number in front when reversing 12x^5',
        placeholder: '???',
        correctAnswer: '2',
        color: '#B45309',
        bgColor: 'rgba(247, 178, 59, 0.18)',
    },
    answer_writing_dx: {
        defaultValue: '',
        type: 'text',
        label: 'Naming piece answer',
        description: 'Student answer naming the piece of notation that says which letter is reversed',
        placeholder: '???',
        correctAnswer: ['dx', 'd x'],
        color: '#0369A1',
        bgColor: 'rgba(98, 204, 249, 0.18)',
    },

    // ─────────────────────────────────────────
    // Shared colour roles — one quantity, one colour, everywhere
    // (prose spot colours, formula terms, and figure ink all read from here)
    // ─────────────────────────────────────────
    roleCoefficient: {
        defaultValue: 0,
        type: 'spotColor',
        label: 'Number in front',
        description: 'Warm amber: the coefficient sitting in front of a power of x',
        color: '#B45309',
    },
    rolePower: {
        defaultValue: 0,
        type: 'spotColor',
        label: 'Power',
        description: 'Soft indigo: the exponent on x',
        color: '#4338CA',
    },
    roleConstant: {
        defaultValue: 0,
        type: 'spotColor',
        label: 'Constant of integration',
        description: 'Soft violet: the + C that reversing always leaves behind',
        color: '#7C3AED',
    },
    roleNotation: {
        defaultValue: 0,
        type: 'spotColor',
        label: 'Integral notation',
        description: 'Soft sky: the stretched S and the dx that wrap the function',
        color: '#0369A1',
    },
    roleFunction: {
        defaultValue: 0,
        type: 'spotColor',
        label: 'Function being reversed',
        description: 'Soft teal: the function you start from and the answer you land on',
        color: '#0F766E',
    },

    // ─────────────────────────────────────────
    // Section: Undoing the Power Rule (live reversal formula)
    // ─────────────────────────────────────────
    reverseStartCoefficient: {
        defaultValue: 8,
        type: 'number',
        label: 'Coefficient being reversed',
        description: 'The number in front of the term the formula is reversing',
        min: 1,
        max: 12,
        step: 1,
        color: '#B45309',
    },
    reverseStartPower: {
        defaultValue: 3,
        type: 'number',
        label: 'Power being reversed',
        description: 'The power on x in the term the formula is reversing',
        min: 1,
        max: 6,
        step: 1,
        color: '#4338CA',
    },
    reverseNewPower: {
        defaultValue: 4,
        type: 'number',
        label: 'Raised power',
        description: 'Derived: the power after it climbs by one',
        min: 2,
        max: 7,
        step: 1,
        color: '#4338CA',
    },
    reverseResultCoefficient: {
        defaultValue: 2,
        type: 'number',
        label: 'Coefficient of the reversed term',
        description: 'Derived: the starting coefficient divided by the raised power',
        min: 0,
        max: 12,
        step: 0.01,
        color: '#B45309',
    },
    reverseExample: {
        defaultValue: '',
        type: 'text',
        label: 'Named example to jump to',
        description: 'Set by an inline trigger to snap the live formula onto a named case',
    },

    // ─────────────────────────────────────────
    // Section: Writing It Down (general rule check inside the formula)
    // ─────────────────────────────────────────
    ruleDivisor: {
        defaultValue: '',
        type: 'select',
        label: 'What you divide by',
        description: 'Student choice for the divisor in the general reversal rule',
        placeholder: '?',
        correctAnswer: 'n + 1',
        options: ['n - 1', 'n', 'n + 1'],
        color: '#B45309',
        bgColor: 'rgba(247, 178, 59, 0.18)',
    },
    ruleConstant: {
        defaultValue: '',
        type: 'text',
        label: 'Missing constant in the general rule',
        description: 'Student answer for the constant term at the end of the general rule',
        placeholder: '?',
        correctAnswer: ['C', '+C', '+ C'],
        color: '#7C3AED',
        bgColor: 'rgba(172, 139, 249, 0.18)',
    },

    // Uncomment and modify these examples for your lesson:

    /*
    // ─────────────────────────────────────────
    // NUMBER - Use with sliders
    // ─────────────────────────────────────────
    myValue: {
        defaultValue: 5,
        type: 'number',
        label: 'My Value',
        description: 'A number that controls something',
        unit: 'm',           // optional unit display
        min: 0,
        max: 10,
        step: 0.5,
    },

    // ─────────────────────────────────────────
    // TEXT - Free text input
    // ─────────────────────────────────────────
    lessonTitle: {
        defaultValue: 'My Lesson',
        type: 'text',
        label: 'Lesson Title',
        description: 'The title of your lesson',
        placeholder: 'Enter a title...',
    },

    // ─────────────────────────────────────────
    // SELECT - Dropdown with options
    // ─────────────────────────────────────────
    difficulty: {
        defaultValue: 'medium',
        type: 'select',
        label: 'Difficulty',
        description: 'The difficulty level of the lesson',
        options: ['easy', 'medium', 'hard', 'expert'],
    },

    // ─────────────────────────────────────────
    // BOOLEAN - Toggle switch
    // ─────────────────────────────────────────
    showHints: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Hints',
        description: 'Toggle to show or hide hints',
    },

    // ─────────────────────────────────────────
    // ARRAY - List of numbers
    // ─────────────────────────────────────────
    dataPoints: {
        defaultValue: [1, 4, 9, 16, 25],
        type: 'array',
        label: 'Data Points',
        description: 'Y-values for plotting a graph',
    },

    // ─────────────────────────────────────────
    // OBJECT - Complex structured data
    // ─────────────────────────────────────────
    graphSettings: {
        defaultValue: { 
            xMin: -10, 
            xMax: 10, 
            showGrid: true 
        },
        type: 'object',
        label: 'Graph Settings',
        description: 'Configuration for the graph display',
        schema: '{ xMin: number, xMax: number, showGrid: boolean }',
    },
    */
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
