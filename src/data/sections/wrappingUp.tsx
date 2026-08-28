import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";

export const wrappingUpBlocks: ReactElement[] = [
    <StackLayout key="layout-wrapping-heading" maxWidth="xl">
        <Block id="wrapping-heading" padding="md">
            <EditableH2 id="h2-wrapping-heading" blockId="wrapping-heading">
                Wrapping Up
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapping-recap" maxWidth="xl">
        <Block id="wrapping-recap" padding="sm">
            <EditableParagraph id="para-wrapping-recap" blockId="wrapping-recap">
                Integration turned out to be differentiation walked backwards. Raise the power, divide
                by the new power, and check the answer by differentiating it back. The + C is not
                decoration, it is an honest admission that the road home has many endings, stacked one
                above another.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapping-next" maxWidth="xl">
        <Block id="wrapping-next" padding="sm">
            <EditableParagraph id="para-wrapping-next" blockId="wrapping-next">
                That is the heart of it. Later you will use the same reversal to turn a speed into a
                distance travelled, or to measure the area trapped under a curve, and both of those
                jobs are the trip you just made with 8x³. The stretched S is worth getting friendly
                with, because it turns up everywhere from physics to economics.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
