import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph, InlineTooltip } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { VisualOptionCards } from "@/components/organisms";

export const writingItDownBlocks: ReactElement[] = [
    <StackLayout key="layout-writing-heading" maxWidth="xl">
        <Block id="writing-heading" padding="md">
            <EditableH2 id="h2-writing-heading" blockId="writing-heading">
                Writing It Down
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-notation" maxWidth="xl">
        <Block id="writing-notation" padding="sm">
            <EditableParagraph id="para-writing-notation" blockId="writing-notation">
                Mathematicians mark this reversal with a stretched S called the{" "}
                <InlineTooltip id="tooltip-integral-sign" tooltip="The elongated S written before a function to mean: find every function that differentiates back to this one.">
                    integral sign
                </InlineTooltip>
                . The statement below reads as: the functions that differentiate back to 6x² are 2x³
                plus any constant. The dx on the end simply says which letter you are reversing.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-integral-formula" maxWidth="xl">
        <Block id="writing-integral-formula" padding="lg">
            <FormulaBlock latex="\int 6x^2 \, dx \;=\; 2x^3 + C" />
        </Block>
    </StackLayout>,

    <Block key="layout-writing-practice-visual" id="writing-practice-visual">
        <VisualOptionCards
            blockId="writing-practice-visual"
            cards={[
                {
                    id: "hit-the-target-derivative",
                    title: "An integral with two blanks, checked against the derivative it has to produce",
                    looks: "Imagine the integral sign with 12x³ tucked inside it, and to its right an answer with two empty slots: a number in front and a power on the x. On the line below, that answer is differentiated automatically and printed right beside 12x³, so the two lines either agree or they don't.",
                    manipulate: "Drag the number and the power in the answer until the line differentiated back underneath matches 12x³ exactly",
                    reveals: "Only one pair of values survives the check, and finding it is the raise-then-divide rule in action",
                    paradigm: "goal",
                    recommended: true,
                },
                {
                    id: "loose-symbol-tiles",
                    title: "The pieces of an integral statement scattered below an empty line",
                    looks: "Imagine an empty line with faint outlined slots waiting on it, and the pieces of a statement scattered underneath: a stretched S, the term 6x², a dx, an equals sign, 2x³ and a + C. A piece settles into a slot only when it lands somewhere that makes mathematical sense, and slides back out when it doesn't.",
                    manipulate: "Drag each piece onto the empty line to assemble one complete, correct integral statement",
                    reveals: "The stretched S and the dx are a matching pair that wrap the function, and the + C belongs on the answer side",
                    paradigm: "constructivist",
                },
                {
                    id: "set-the-answer-first",
                    title: "An answer students write first, with the integral question appearing above it",
                    looks: "Imagine the answer line at the bottom of the screen, showing a term whose number and power students can grab, followed by + C. Above it, the integral question that this answer belongs to writes itself out in full notation as the answer changes, with the stretched S and the dx appearing around it.",
                    manipulate: "Drag the number and the power on the answer line, and read the question that assembles itself above",
                    reveals: "Every answer of this shape is the integral of something, which is why writing the question is just differentiating the answer",
                    paradigm: "inversion",
                },
            ]}
        />
    </Block>,

    <StackLayout key="layout-writing-rule-summary" maxWidth="xl">
        <Block id="writing-rule-summary" padding="sm">
            <EditableParagraph id="para-writing-rule-summary" blockId="writing-rule-summary">
                Three moves cover every one of these: raise the power, divide by the new power, add C.
                The check never changes either, because differentiating your answer should hand you
                back the function you started with.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
