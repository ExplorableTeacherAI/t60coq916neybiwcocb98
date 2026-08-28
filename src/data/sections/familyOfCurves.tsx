import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

export const familyOfCurvesBlocks: ReactElement[] = [
    <StackLayout key="layout-family-heading" maxWidth="xl">
        <Block id="family-heading" padding="md">
            <EditableH2 id="h2-family-heading" blockId="family-heading">
                The Family of Curves
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-family-same-derivative" maxWidth="xl">
        <Block id="family-same-derivative" padding="sm">
            <EditableParagraph id="para-family-same-derivative" blockId="family-same-derivative">
                Differentiate x² + 1 with the power rule and you get 2x. Now differentiate x² + 7: the
                x² still gives 2x, and a lone number gives nothing at all, so the answer is 2x again.
                Both functions reverse back to exactly the same place.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <Block key="layout-family-shift-visual" id="family-shift-visual">
        <VisualOptionCards
            blockId="family-shift-visual"
            cards={[
                {
                    id: "predict-the-only-answer",
                    title: "A faint curve students slide up and down, with its steepness drawn beside it",
                    looks: "Imagine a faint curve on a grid that students can slide up or down the screen, with a second grid beside it showing how steep that curve is at every point, drawn as its own line. However far the curve slides, that second line never budges. Once the student commits, more curves fade in above and below.",
                    manipulate: "Slide the faint curve to where they think the one correct answer sits, then release to see every other curve that works just as well appear behind it",
                    reveals: "Shifting a curve up or down never changes how steep it is, so all of those curves are correct integrals of the same function",
                    targetsMisconception: "Students think each function has only one integral, forgetting +C",
                    paradigm: "prediction",
                    secondView: {
                        shows: "The steepness of the chosen curve at every point, drawn as its own line that stays put while the curve moves",
                        role: "complementary",
                        syncedBy: "the shared shift constant variable, plus a hover highlight linking the point on the curve to the matching point on the steepness line",
                    },
                    recommended: true,
                },
                {
                    id: "stack-the-curves",
                    title: "A pile of identical curves at different heights, all carrying the same slope arrow",
                    looks: "Imagine one curve on a grid with a short arrow resting on it, showing how steeply it is climbing at a chosen spot. Students add more copies of the curve at heights of their choosing, and each new copy arrives with its own arrow, every one of them tilted at exactly the same angle.",
                    manipulate: "Click at different heights to drop new copies of the curve, then drag the chosen spot sideways to swing all the arrows at once",
                    reveals: "The whole family climbs in step, which is why the constant is invisible to differentiation",
                    paradigm: "constructivist",
                },
                {
                    id: "two-curves-compared",
                    title: "Two copies of one curve at different heights, measured by the same vertical line",
                    looks: "Imagine two identical curves sitting one above the other on the same grid, with a vertical line students can sweep left and right. Wherever the line lands it meets both curves, and the height of each meeting point is printed at the side, along with the steepness of each curve at that spot.",
                    manipulate: "Sweep the vertical line across the grid and compare the two steepness readings it collects",
                    reveals: "The heights never agree, but the steepness readings always do, so the gap between the curves is a constant that differentiation cannot see",
                    paradigm: "comparison",
                },
            ]}
        />
    </Block>,

    <StackLayout key="layout-family-plus-c" maxWidth="xl">
        <Block id="family-plus-c" padding="sm">
            <EditableParagraph id="para-family-plus-c" blockId="family-plus-c">
                So reversing a derivative never gives one function. It gives a whole family, and we
                write + C on the end to stand for the constant we have no way of knowing. Leaving the
                + C off does not simplify the answer, it quietly throws away every member of the family
                but one.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
