import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineTooltip,
    InlineLinkedHighlight,
    InlineClozeInput,
    InlineFeedback,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import {
    getVariableInfo,
    clozePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "../variables";

// ─────────────────────────────────────────────────────────────────────────────
// Integral statement builder — the pieces of an integral statement lie loose
// below an empty line. A piece settles into a slot only where it makes
// mathematical sense; anywhere else it eases back home with a nudge.
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_WIDTH = 600;
const STAGE_HEIGHT = 330;
const SLOT_Y = 74;
const TILE_HEIGHT = 48;
const SLOT_GAP = 12;
const SNAP_RADIUS = 78;

const ACCENT = "#62D0AD";
const ACCENT_DEEP = "#0F766E";
const INK = "#334155";
const INK_SOFT = "#64748B";

interface TileSpec {
    id: string;
    label: string;
    slot: number;
    width: number;
    home: { x: number; y: number };
    nudge: string;
}

const TILES: TileSpec[] = [
    {
        id: "integral-sign",
        label: "∫",
        slot: 0,
        width: 48,
        home: { x: 270, y: 196 },
        nudge: "The stretched S opens the statement, so it belongs in the very first slot.",
    },
    {
        id: "integrand",
        label: "6x²",
        slot: 1,
        width: 76,
        home: { x: 150, y: 196 },
        nudge: "6x² is the function being reversed, so it sits just after the stretched S.",
    },
    {
        id: "dx",
        label: "dx",
        slot: 2,
        width: 52,
        home: { x: 448, y: 196 },
        nudge: "dx closes off the question, so it goes straight after the function.",
    },
    {
        id: "equals",
        label: "=",
        slot: 3,
        width: 46,
        home: { x: 358, y: 196 },
        nudge: "The equals sign separates the question from the answer.",
    },
    {
        id: "antiderivative",
        label: "2x³",
        slot: 4,
        width: 76,
        home: { x: 246, y: 262 },
        nudge: "2x³ is the answer, so it belongs on the far side of the equals sign.",
    },
    {
        id: "plus-c",
        label: "+ C",
        slot: 5,
        width: 62,
        home: { x: 56, y: 196 },
        nudge: "+ C rides along with the answer, right at the end.",
    },
];

const SLOT_WIDTHS = TILES.slice().sort((a, b) => a.slot - b.slot).map((t) => t.width);
const SLOT_START_X =
    (STAGE_WIDTH - (SLOT_WIDTHS.reduce((sum, w) => sum + w, 0) + SLOT_GAP * (SLOT_WIDTHS.length - 1))) / 2;

const slotX = (index: number): number =>
    SLOT_START_X + SLOT_WIDTHS.slice(0, index).reduce((sum, w) => sum + w + SLOT_GAP, 0);

type Placements = Record<string, number | null>;

const emptyPlacements = (): Placements =>
    TILES.reduce((acc, tile) => ({ ...acc, [tile.id]: null }), {} as Placements);

function IntegralTileBuilderDrawing() {
    const setVar = useSetVar();
    const placedCount = useVar<number>("integralTilesPlaced", 0);
    const highlight = useVar<string>("integralSymbolHighlight", "");

    const [placements, setPlacements] = useState<Placements>(emptyPlacements);
    const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() =>
        TILES.reduce((acc, tile) => ({ ...acc, [tile.id]: { ...tile.home } }), {}),
    );
    const [dragging, setDragging] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const stageRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const dragOffset = useRef({ x: 0, y: 0 });

    useLayoutEffect(() => {
        const element = stageRef.current;
        if (!element) return;
        const measure = () => setScale(Math.min(1, element.clientWidth / STAGE_WIDTH));
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const localPlaced = TILES.filter((tile) => placements[tile.id] !== null).length;

    // Lets an external reset (e.g. a feedback hint) put the puzzle back to the start.
    useEffect(() => {
        if (placedCount === 0 && localPlaced > 0) {
            setPlacements(emptyPlacements());
            setPositions(TILES.reduce((acc, tile) => ({ ...acc, [tile.id]: { ...tile.home } }), {}));
            setMessage(null);
        }
    }, [placedCount, localPlaced]);

    const publish = useCallback(
        (next: Placements) => {
            const count = TILES.filter((tile) => next[tile.id] !== null).length;
            setVar("integralTilesPlaced", count);
            setVar("integralDxPlaced", next["dx"] !== null ? 1 : 0);
        },
        [setVar],
    );

    const toStage = (event: React.PointerEvent): { x: number; y: number } => {
        const rect = stageRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: (event.clientX - rect.left) / scale,
            y: (event.clientY - rect.top) / scale,
        };
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, tile: TileSpec) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        const point = toStage(event);
        const current = positions[tile.id];
        dragOffset.current = { x: point.x - current.x, y: point.y - current.y };
        setDragging(tile.id);
        setMessage(null);
        if (placements[tile.id] !== null) {
            const next = { ...placements, [tile.id]: null };
            setPlacements(next);
            publish(next);
        }
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>, tile: TileSpec) => {
        if (dragging !== tile.id) return;
        const point = toStage(event);
        setPositions((prev) => ({
            ...prev,
            [tile.id]: {
                x: point.x - dragOffset.current.x,
                y: point.y - dragOffset.current.y,
            },
        }));
    };

    const handlePointerUp = (tile: TileSpec) => {
        if (dragging !== tile.id) return;
        setDragging(null);

        const current = positions[tile.id];
        const centre = { x: current.x + tile.width / 2, y: current.y + TILE_HEIGHT / 2 };

        let nearest = -1;
        let nearestDistance = Number.POSITIVE_INFINITY;
        for (let index = 0; index < TILES.length; index += 1) {
            const target = { x: slotX(index) + SLOT_WIDTHS[index] / 2, y: SLOT_Y + TILE_HEIGHT / 2 };
            const distance = Math.hypot(centre.x - target.x, centre.y - target.y);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = index;
            }
        }

        const occupied = Object.values(placements).includes(nearest);
        const lands = nearestDistance < SNAP_RADIUS && nearest === tile.slot && !occupied;

        if (lands) {
            const next = { ...placements, [tile.id]: nearest };
            setPlacements(next);
            setPositions((prev) => ({ ...prev, [tile.id]: { x: slotX(nearest), y: SLOT_Y } }));
            publish(next);
            const complete = TILES.every((entry) => next[entry.id] !== null);
            setMessage(complete ? "∫ 6x² dx = 2x³ + C — a complete integral statement." : null);
        } else {
            setPositions((prev) => ({ ...prev, [tile.id]: { ...tile.home } }));
            if (nearestDistance < SNAP_RADIUS) setMessage(tile.nudge);
        }
    };

    const complete = TILES.every((tile) => placements[tile.id] !== null);

    return (
        <div className="px-6 pt-5">
            <div
                ref={stageRef}
                className="relative w-full"
                style={{ height: STAGE_HEIGHT * scale, touchAction: "none" }}
            >
                <div
                    className="absolute left-0 top-0"
                    style={{
                        width: STAGE_WIDTH,
                        height: STAGE_HEIGHT,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                    }}
                >
                    {/* Empty slots waiting on the statement line */}
                    {SLOT_WIDTHS.map((width, index) => {
                        const filled = Object.values(placements).includes(index);
                        return (
                            <div
                                key={`slot-${index}`}
                                className="absolute rounded-lg"
                                style={{
                                    left: slotX(index),
                                    top: SLOT_Y,
                                    width,
                                    height: TILE_HEIGHT,
                                    border: filled ? "none" : "2px dashed #CBD5E1",
                                    opacity: highlight ? 0.4 : 1,
                                    transition: "opacity 150ms ease-out",
                                }}
                            />
                        );
                    })}

                    {/* The statement line itself */}
                    <div
                        className="absolute"
                        style={{
                            left: SLOT_START_X - 14,
                            top: SLOT_Y + TILE_HEIGHT + 12,
                            width:
                                SLOT_WIDTHS.reduce((sum, w) => sum + w, 0) +
                                SLOT_GAP * (SLOT_WIDTHS.length - 1) +
                                28,
                            height: 2,
                            backgroundColor: complete ? ACCENT : "#E2E8F0",
                            opacity: highlight ? 0.4 : 1,
                            transition: "background-color 200ms ease-out, opacity 150ms ease-out",
                        }}
                    />

                    <div
                        className="absolute"
                        style={{
                            left: 24,
                            top: 26,
                            fontSize: 13,
                            color: INK_SOFT,
                            opacity: highlight ? 0.4 : 1,
                            transition: "opacity 150ms ease-out",
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        {`${localPlaced} of 6 pieces in place`}
                    </div>

                    {/* The loose pieces */}
                    {TILES.map((tile) => {
                        const isPlaced = placements[tile.id] !== null;
                        const isActive = highlight === tile.id;
                        const isDimmed = highlight !== "" && !isActive;
                        const position = positions[tile.id];
                        return (
                            <div
                                key={tile.id}
                                onPointerDown={(event) => handlePointerDown(event, tile)}
                                onPointerMove={(event) => handlePointerMove(event, tile)}
                                onPointerUp={() => handlePointerUp(tile)}
                                onPointerCancel={() => handlePointerUp(tile)}
                                onPointerEnter={() => setVar("integralSymbolHighlight", tile.id)}
                                onPointerLeave={() => setVar("integralSymbolHighlight", "")}
                                className="absolute flex items-center justify-center rounded-lg select-none"
                                style={{
                                    left: position.x,
                                    top: position.y,
                                    width: tile.width,
                                    height: TILE_HEIGHT,
                                    backgroundColor: isPlaced ? "rgba(98, 208, 173, 0.18)" : "#FFFFFF",
                                    border: `${isActive ? 3 : 2}px solid ${isPlaced || isActive ? ACCENT_DEEP : ACCENT}`,
                                    boxShadow: isActive
                                        ? "0 0 0 7px rgba(98, 208, 173, 0.28)"
                                        : dragging === tile.id
                                          ? "0 4px 10px rgba(15, 23, 42, 0.18)"
                                          : "0 1px 3px rgba(15, 23, 42, 0.12)",
                                    opacity: isDimmed ? 0.38 : 1,
                                    transform: `scale(${isActive ? 1.06 : 1})`,
                                    color: INK,
                                    fontSize: 22,
                                    fontFamily: "Georgia, 'Times New Roman', serif",
                                    fontStyle: "italic",
                                    cursor: dragging === tile.id ? "grabbing" : "grab",
                                    transition:
                                        dragging === tile.id
                                            ? "none"
                                            : "left 220ms ease-out, top 220ms ease-out, opacity 150ms ease-out, transform 150ms ease-out, box-shadow 150ms ease-out",
                                    touchAction: "none",
                                }}
                            >
                                {tile.label}
                            </div>
                        );
                    })}
                </div>

                <InteractionHintSequence
                    hintKey="integral-tiles-drag"
                    steps={[
                        {
                            gesture: "drag",
                            label: "Drag the stretched S into the first empty slot",
                            position: { x: "49%", y: "67%" },
                            dragPath: {
                                type: "line",
                                startOffset: { x: 8, y: 8 },
                                endOffset: { x: -78, y: -66 },
                            },
                        },
                    ]}
                />
            </div>

            <div
                className="pb-1 pt-3 text-sm"
                style={{ color: complete ? ACCENT_DEEP : "#B45309", minHeight: 24 }}
            >
                {message ?? ""}
            </div>
        </div>
    );
}

function IntegralTileBuilderFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="integral-tile-builder"
            onReset={() => {
                setVar("integralTilesPlaced", 0);
                setVar("integralDxPlaced", 0);
                setVar("integralSymbolHighlight", "");
            }}
            caption="The six pieces of one integral statement. Drag each piece onto the line: it settles only where it makes mathematical sense, and slides back with a nudge anywhere else."
        >
            <IntegralTileBuilderDrawing />
        </Figure>
    );
}

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
                , and the{" "}
                <InlineLinkedHighlight
                    id="highlight-writing-dx"
                    varName="integralSymbolHighlight"
                    highlightId="dx"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('integralSymbolHighlight'))}
                >
                    dx
                </InlineLinkedHighlight>
                {" "}on the end says which letter you are reversing. The statement below reads as: the
                function that differentiates back to 6x² is 2x³, plus any constant. Its pieces lie
                loose underneath, so drag the{" "}
                <InlineLinkedHighlight
                    id="highlight-writing-integral-sign"
                    varName="integralSymbolHighlight"
                    highlightId="integral-sign"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('integralSymbolHighlight'))}
                >
                    stretched S
                </InlineLinkedHighlight>
                {" "}and the rest into the empty slots and see which order the line accepts.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-integral-formula" maxWidth="xl">
        <Block id="writing-integral-formula" padding="lg">
            <FormulaBlock latex="\int 6x^2 \, dx \;=\; 2x^3 + C" />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-practice-visual" maxWidth="xl">
        <Block id="writing-practice-visual" padding="sm" hasVisualization>
            <IntegralTileBuilderFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-rule-summary" maxWidth="xl">
        <Block id="writing-rule-summary" padding="sm">
            <EditableParagraph id="para-writing-rule-summary" blockId="writing-rule-summary">
                Three moves cover every one of these: raise the power, divide by the new power, add C.
                The stretched S and the dx always travel as a pair, wrapping the function being
                reversed, while the + C only ever appears on the answer side of the equals sign.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-question-reverse" maxWidth="xl">
        <Block id="writing-question-reverse" padding="md">
            <EditableParagraph id="para-writing-question-reverse" blockId="writing-question-reverse">
                Now a fresh one, using the same three moves:{" "}
                <InlineFeedback
                    varName="answer_writing_reverse"
                    correctValue="2"
                    position="mid"
                    successMessage="✓ 12 shared into 6"
                    hint="the power climbs to 6, and 12 is then divided by it"
                >
                    <InlineClozeInput
                        varName="answer_writing_reverse"
                        correctAnswer="2"
                        {...clozePropsFromDefinition(getVariableInfo('answer_writing_reverse'))}
                    />
                </InlineFeedback>
                {" "}is the number in front when ∫ 12x⁵ dx is written out as a term in x⁶ plus C.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-writing-question-naming" maxWidth="xl">
        <Block id="writing-question-naming" padding="md">
            <EditableParagraph id="para-writing-question-naming" blockId="writing-question-naming">
                Inside a statement like ∫ 6x² dx = 2x³ + C, the piece that names which letter is being
                reversed is{" "}
                <InlineFeedback
                    varName="answer_writing_dx"
                    correctValue={["dx", "d x"]}
                    position="terminal"
                    successMessage="— yes, and it always closes the question side, straight after the function"
                    failureMessage="— not that one."
                    hint="It is the piece that never leaves the stretched S on its own"
                    reviewBlockId="writing-notation"
                    reviewLabel="Look again at the notation"
                    visualizationHint={{
                        blockId: "writing-practice-visual",
                        hintKey: "feedback-integral-dx-hint",
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drag the piece that closes the question side into the slot just after 6x²",
                                position: { x: "76%", y: "67%" },
                                dragPath: {
                                    type: "line",
                                    startOffset: { x: 10, y: 10 },
                                    endOffset: { x: -60, y: -70 },
                                },
                                completionVar: "integralDxPlaced",
                                completionValue: 1,
                                completionTolerance: 0.4,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { integralTilesPlaced: 0, integralDxPlaced: 0, integralSymbolHighlight: "" },
                    }}
                >
                    <InlineClozeInput
                        varName="answer_writing_dx"
                        correctAnswer={["dx", "d x"]}
                        {...clozePropsFromDefinition(getVariableInfo('answer_writing_dx'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
