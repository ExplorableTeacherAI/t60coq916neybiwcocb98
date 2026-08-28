import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { VisualOptionCards } from "@/components/organisms";

export const undoingPowerRuleBlocks: ReactElement[] = [
    <StackLayout key="layout-undoing-heading" maxWidth="xl">
        <Block id="undoing-heading" padding="md">
            <EditableH2 id="h2-undoing-heading" blockId="undoing-heading">
                Undoing the Power Rule
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-undoing-forward" maxWidth="xl">
        <Block id="undoing-forward" padding="sm">
            <EditableParagraph id="para-undoing-forward" blockId="undoing-forward">
                Differentiating x³ gives 3x², so the power rule does two jobs: it multiplies by the
                power, then drops the power by one. Coming back, you do both jobs the opposite way
                round. Raise the power by one first, then divide by that new power.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-undoing-worked-formula" maxWidth="xl">
        <Block id="undoing-worked-formula" padding="lg">
            <FormulaBlock latex="8x^3 \;\longrightarrow\; \frac{8x^{4}}{4} \;=\; 2x^{4}" />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-undoing-worked-example" maxWidth="xl">
        <Block id="undoing-worked-example" padding="sm">
            <EditableParagraph id="para-undoing-worked-example" blockId="undoing-worked-example">
                Follow it on 8x³: raise the power to get x⁴, then divide by that new power, which
                leaves 2x⁴. Differentiate 2x⁴ and 8x³ comes straight back, and that check is how you
                know a reversal is right.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <Block key="layout-undoing-machine-visual" id="undoing-machine-visual">
        <VisualOptionCards
            blockId="undoing-machine-visual"
            cards={[
                {
                    id: "reversible-timeline",
                    title: "A term on a timeline that runs forwards into its derivative and back again",
                    looks: "Imagine the term 2x⁴ written large on the left of a short timeline, with a handle students can slide. As the handle moves right, the term changes one step at a time: the power slides down to 3, then the 4 swings round to the front, until 8x³ is left standing on the right.",
                    manipulate: "Slide the handle along the timeline to walk the term forwards into its derivative, then drag it back the other way",
                    reveals: "Going back is the same two steps in the opposite order, so the power goes up before the dividing happens",
                    paradigm: "temporal",
                    recommended: true,
                },
                {
                    id: "derivative-drag-back",
                    title: "A derivative on top, with the term it came from rebuilding itself underneath",
                    looks: "Imagine 8x³ written at the top of the screen, with its number and its power both grabbable. Underneath, on a second line, the term it must have come from writes itself out as the top line changes, with a small arrow between the two lines showing which way the reversing runs.",
                    manipulate: "Drag the number in front and the power of the top term, and watch the line below rebuild itself to match",
                    reveals: "Whatever derivative you make, the term below always has a power one higher and a number divided by it",
                    paradigm: "inversion",
                },
                {
                    id: "build-and-check",
                    title: "An empty answer box beside 8x³, with number and power tiles to fill it",
                    looks: "Imagine 8x³ printed on the left and an empty box on the right, shaped to hold a number and a power. Loose tiles wait below. As soon as a tile lands in the box, the box is differentiated automatically and the result appears underneath, right next to 8x³ so the two can be compared.",
                    manipulate: "Drag a number tile and a power tile into the empty box, then read the line underneath to see whether it differentiates back to 8x³",
                    reveals: "There is exactly one pair of numbers that differentiates back correctly, and hunting for it teaches the raise-then-divide rule",
                    paradigm: "constructivist",
                },
            ]}
        />
    </Block>,

    <StackLayout key="layout-undoing-check-hook" maxWidth="xl">
        <Block id="undoing-check-hook" padding="sm">
            <EditableParagraph id="para-undoing-check-hook" blockId="undoing-check-hook">
                So far the reversal looks safe, because differentiating your answer always brings the
                original back. But try that check on 2x⁴ + 7, and then on 2x⁴ + 100, and something
                strange happens.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
