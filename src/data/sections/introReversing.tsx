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
                This lesson makes the return trip, from a derivative back to the function it came
                from. In short:
                <br />
                {"\u2022 Forwards: the power rule sends "}
                <InlineFormula
                    latex="\clr{fn}{x}^{\clr{pow}{5}}"
                    colorMap={{ fn: FUNCTION_HUE, pow: POWER }}
                />
                {" to "}
                <InlineFormula
                    latex="\clr{coef}{5}\clr{fn}{x}^{\clr{pow}{4}}"
                    colorMap={{ coef: COEFFICIENT, fn: FUNCTION_HUE, pow: POWER }}
                />
                {", moving the "}
                <InlineTooltip
                    id="tooltip-intro-coefficient"
                    color={COEFFICIENT}
                    bgColor="rgba(247, 178, 59, 0.18)"
                    tooltip="The coefficient: the number written in front of the power of x. It is shown in amber throughout this lesson."
                >
                    number in front
                </InlineTooltip>
                {" and the "}
                <InlineTooltip
                    id="tooltip-intro-power"
                    color={POWER}
                    bgColor="rgba(142, 144, 245, 0.18)"
                    tooltip="The power: the small raised number on x. It is shown in indigo throughout this lesson."
                >
                    power
                </InlineTooltip>
                {"."}
                <br />
                {"\u2022 Backwards: antidifferentiation asks which function differentiates to the one you were handed."}
                <br />
                {"\u2022 As area: "}
                <InlineFormula
                    latex="\textcolor{#0369A1}{\int_{a}^{b}} \textcolor{#0F766E}{f(x)}\,\textcolor{#0369A1}{dx}"
                    colorMap={{}}
                />
                {" is the area between the curve and the x-axis from a to b."}
                <br />
                {"\u2022 The "}
                <InlineTooltip
                    id="tooltip-intro-fundamental-theorem"
                    color={NOTATION}
                    bgColor="rgba(98, 204, 249, 0.18)"
                    tooltip="The Fundamental Theorem of Calculus: if F is an antiderivative of f, then the area under f from a to b equals F(b) - F(a). Finding areas and reversing derivatives are the same task."
                >
                    Fundamental Theorem of Calculus
                </InlineTooltip>
                {" joins those two, because that area is found by antidifferentiating f."}
                <br />
                {"\u2022 The catch: the road home does not lead to just one answer."}
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
