import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH1, EditableParagraph } from "@/components/atoms";

export const introReversingBlocks: ReactElement[] = [
    <StackLayout key="layout-intro-title" maxWidth="xl">
        <Block id="intro-title" padding="md">
            <EditableH1 id="h1-intro-title" blockId="intro-title">
                Integration: Reversing Differentiation
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-hook" maxWidth="xl">
        <Block id="intro-hook" padding="sm">
            <EditableParagraph id="para-intro-hook" blockId="intro-hook">
                Every process worth knowing has a reverse. You can rewind a song to the bit you liked,
                undo a message you regret, or retrace your steps to find a dropped key. Differentiation
                has a reverse too, and it has a name: integration.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-promise" maxWidth="xl">
        <Block id="intro-promise" padding="sm">
            <EditableParagraph id="para-intro-promise" blockId="intro-promise">
                You already know how to send a function forwards, because the power rule turns x⁵ into
                5x⁴ in a single line. This lesson is the return trip: given 5x⁴, working out what you
                started with. There is a surprise waiting on the way back, because the road home does
                not lead to just one answer.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
