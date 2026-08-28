import { type ReactElement } from "react";

// Initialize variables and their colors from this file's variable definitions
import { useVariableStore, initializeVariableColors } from "@/stores";
import { getDefaultValues, variableDefinitions } from "./variables";
useVariableStore.getState().initialize(getDefaultValues());
initializeVariableColors(variableDefinitions);

import { introReversingBlocks } from "./sections/introReversing";
import { undoingPowerRuleBlocks } from "./sections/undoingPowerRule";
import { familyOfCurvesBlocks } from "./sections/familyOfCurves";
import { writingItDownBlocks } from "./sections/writingItDown";
import { wrappingUpBlocks } from "./sections/wrappingUp";

export const blocks: ReactElement[] = [
    ...introReversingBlocks,
    ...undoingPowerRuleBlocks,
    ...familyOfCurvesBlocks,
    ...writingItDownBlocks,
    ...wrappingUpBlocks,
];
