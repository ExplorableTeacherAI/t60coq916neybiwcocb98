import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableParagraph,
    InlineFormula,
    InlineTooltip,
} from "@/components/atoms";

// Shared colour roles for this lesson: the number in front is amber, the power
// is indigo, the function being reversed is teal, and the constant is violet.
const COEFFICIENT = "#B45309";
const POWER = "#4338CA";
const FUNCTION_HUE = "#0F766E";
const NOTATION = "#0369A1";

export const introReversingBlocks: ReactElement[] = [
    <StackLayout key="layout-intro-title" maxWidth="xl">
        <Block id="intro-title" padding="md">
            <EditableH1 id="h1-intro-title" blockId="intro-title">
                Indefinite Integration: Reversing Differentiation
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-hook" maxWidth="xl">
        <Block id="intro-hook" padding="sm">
            <EditableParagraph id="para-intro-hook" blockId="intro-hook">
                Every process worth knowing has a reverse. You can rewind a song to the bit you liked,
                undo a message you regret, or retrace your steps to find a dropped key. Differentiation
                has a reverse too, and it has a name:{" "}
                <InlineTooltip
                    id="tooltip-intro-integration"
                    color={NOTATION}
                    bgColor="rgba(98, 204, 249, 0.18)"
                    tooltip="Integration: starting from a derivative and finding every function that differentiates back to it."
                >
                    integration
                </InlineTooltip>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-promise" maxWidth="xl">
        <Block id="intro-promise" padding="sm">
            <EditableParagraph id="para-intro-promise" blockId="intro-promise">
                You already know how to send a function forwards, because the power rule turns{" "}
                <InlineFormula
                    latex="\clr{fn}{x}^{\clr{pow}{5}}"
                    colorMap={{ fn: FUNCTION_HUE, pow: POWER }}
                />
                {" "}into{" "}
                <InlineFormula
                    latex="\clr{coef}{5}\clr{fn}{x}^{\clr{pow}{4}}"
                    colorMap={{ coef: COEFFICIENT, fn: FUNCTION_HUE, pow: POWER }}
                />
                {" "}in a single line: the{" "}
                <InlineTooltip
                    id="tooltip-intro-coefficient"
                    color={COEFFICIENT}
                    bgColor="rgba(247, 178, 59, 0.18)"
                    tooltip="The coefficient: the number written in front of the power of x. It is shown in amber throughout this lesson."
                >
                    number in front
                </InlineTooltip>
                {" "}and the{" "}
                <InlineTooltip
                    id="tooltip-intro-power"
                    color={POWER}
                    bgColor="rgba(142, 144, 245, 0.18)"
                    tooltip="The power: the small raised number on x. It is shown in indigo throughout this lesson."
                >
                    power
                </InlineTooltip>
                {" "}each move. This lesson is the return trip, and there is a surprise waiting, because
                the road home does not lead to just one answer.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
