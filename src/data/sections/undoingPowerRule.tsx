import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
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
// Reversal builder — 8x³ is the target derivative. The student drops a number
// tile and a power tile into an empty answer box; the box is differentiated
// live and printed beside the target so the two can be compared.
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_WIDTH = 600;
const STAGE_HEIGHT = 290;
const TILE = 48;

const ACCENT = "#62D0AD";
const ACCENT_DEEP = "#0F766E";
const INK = "#334155";
const INK_SOFT = "#64748B";

const TARGET_COEFFICIENT = 8;
const TARGET_POWER = 3;

const SUPERSCRIPT: Record<number, string> = { 1: "", 2: "²", 3: "³", 4: "⁴", 5: "⁵" };
const term = (coefficient: number, power: number): string =>
    `${coefficient}x${SUPERSCRIPT[power] ?? ""}`;

interface SlotSpec {
    kind: "number" | "power";
    x: number;
    y: number;
    size: number;
}

const NUMBER_SLOT: SlotSpec = { kind: "number", x: 32, y: 42, size: 52 };
const POWER_SLOT: SlotSpec = { kind: "power", x: 124, y: 24, size: 52 };

interface TileSpec {
    id: string;
    kind: "number" | "power";
    value: number;
    home: { x: number; y: number };
}

const TILES: TileSpec[] = [
    { id: "number-1", kind: "number", value: 1, home: { x: 32, y: 214 } },
    { id: "number-2", kind: "number", value: 2, home: { x: 92, y: 214 } },
    { id: "number-4", kind: "number", value: 4, home: { x: 152, y: 214 } },
    { id: "number-8", kind: "number", value: 8, home: { x: 212, y: 214 } },
    { id: "power-2", kind: "power", value: 2, home: { x: 320, y: 214 } },
    { id: "power-3", kind: "power", value: 3, home: { x: 380, y: 214 } },
    { id: "power-4", kind: "power", value: 4, home: { x: 440, y: 214 } },
    { id: "power-5", kind: "power", value: 5, home: { x: 500, y: 214 } },
];

const slotPosition = (slot: SlotSpec) => ({
    x: slot.x + (slot.size - TILE) / 2,
    y: slot.y + (slot.size - TILE) / 2,
});

function ReversalBuilderDrawing() {
    const setVar = useSetVar();
    const storedCoefficient = useVar<number>("reverseCoefficient", 0);
    const storedPower = useVar<number>("reversePower", 0);
    const highlight = useVar<string>("reverseHighlight", "");

    const [inNumberSlot, setInNumberSlot] = useState<string | null>(null);
    const [inPowerSlot, setInPowerSlot] = useState<string | null>(null);
    const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() =>
        TILES.reduce((acc, tile) => ({ ...acc, [tile.id]: { ...tile.home } }), {}),
    );
    const [dragging, setDragging] = useState<string | null>(null);

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

    const coefficient = inNumberSlot ? TILES.find((t) => t.id === inNumberSlot)!.value : 0;
    const power = inPowerSlot ? TILES.find((t) => t.id === inPowerSlot)!.value : 0;
    const built = coefficient > 0 && power > 0;
    const derivedCoefficient = coefficient * power;
    const matches = built && derivedCoefficient === TARGET_COEFFICIENT && power - 1 === TARGET_POWER;

    const clear = useCallback(() => {
        setInNumberSlot(null);
        setInPowerSlot(null);
        setPositions(TILES.reduce((acc, tile) => ({ ...acc, [tile.id]: { ...tile.home } }), {}));
    }, []);

    // Lets an external reset (e.g. a feedback hint) empty the answer box.
    useEffect(() => {
        if (storedCoefficient === 0 && storedPower === 0 && (inNumberSlot || inPowerSlot)) clear();
    }, [storedCoefficient, storedPower, inNumberSlot, inPowerSlot, clear]);

    useEffect(() => {
        setVar("reverseCoefficient", coefficient);
        setVar("reversePower", power);
        setVar("reverseMatched", matches ? 1 : 0);
    }, [coefficient, power, matches, setVar]);

    const toStage = (event: React.PointerEvent): { x: number; y: number } => {
        const rect = stageRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return { x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale };
    };

    const sendHome = (id: string) => {
        const home = TILES.find((tile) => tile.id === id)!.home;
        setPositions((prev) => ({ ...prev, [id]: { ...home } }));
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, tile: TileSpec) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        const point = toStage(event);
        const current = positions[tile.id];
        dragOffset.current = { x: point.x - current.x, y: point.y - current.y };
        setDragging(tile.id);
        if (inNumberSlot === tile.id) setInNumberSlot(null);
        if (inPowerSlot === tile.id) setInPowerSlot(null);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>, tile: TileSpec) => {
        if (dragging !== tile.id) return;
        const point = toStage(event);
        setPositions((prev) => ({
            ...prev,
            [tile.id]: { x: point.x - dragOffset.current.x, y: point.y - dragOffset.current.y },
        }));
    };

    const handlePointerUp = (tile: TileSpec) => {
        if (dragging !== tile.id) return;
        setDragging(null);

        const current = positions[tile.id];
        const centre = { x: current.x + TILE / 2, y: current.y + TILE / 2 };
        const slot = tile.kind === "number" ? NUMBER_SLOT : POWER_SLOT;
        const slotCentre = { x: slot.x + slot.size / 2, y: slot.y + slot.size / 2 };
        const distance = Math.hypot(centre.x - slotCentre.x, centre.y - slotCentre.y);

        if (distance < 90) {
            const previous = tile.kind === "number" ? inNumberSlot : inPowerSlot;
            if (previous && previous !== tile.id) sendHome(previous);
            if (tile.kind === "number") setInNumberSlot(tile.id);
            else setInPowerSlot(tile.id);
            setPositions((prev) => ({ ...prev, [tile.id]: slotPosition(slot) }));
        } else {
            sendHome(tile.id);
        }
    };

    const dim = (id: string) => (highlight !== "" && highlight !== id ? 0.38 : 1);
    const answerActive = highlight === "answer";
    const checkActive = highlight === "check";
    const targetActive = highlight === "target";

    const verdict = !built
        ? "Drop one number tile and one power tile into the box."
        : matches
          ? `${term(coefficient, power)} differentiates to ${term(TARGET_COEFFICIENT, TARGET_POWER)} — that is the reversal.`
          : power - 1 === TARGET_POWER
            ? `The power is right, but ${coefficient} × ${power} gives ${derivedCoefficient}, not ${TARGET_COEFFICIENT}.`
            : `That leaves x${SUPERSCRIPT[power - 1] ?? ""}, and the target carries x${SUPERSCRIPT[TARGET_POWER]}.`;

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
                    {/* Answer box: the two empty slots and the x between them */}
                    <div
                        className="absolute"
                        style={{
                            left: 32,
                            top: 20,
                            fontSize: 13,
                            color: INK_SOFT,
                            opacity: dim("answer"),
                            transition: "opacity 150ms ease-out",
                        }}
                    >
                        Your answer
                    </div>
                    {[NUMBER_SLOT, POWER_SLOT].map((slot) => {
                        const filled = slot.kind === "number" ? inNumberSlot : inPowerSlot;
                        return (
                            <div
                                key={`slot-${slot.kind}`}
                                className="absolute rounded-lg"
                                style={{
                                    left: slot.x,
                                    top: slot.y,
                                    width: slot.size,
                                    height: slot.size,
                                    border: filled ? "none" : "2px dashed #CBD5E1",
                                    boxShadow: answerActive && !filled
                                        ? "0 0 0 7px rgba(98, 208, 173, 0.28)"
                                        : "none",
                                    opacity: dim("answer"),
                                    transition: "opacity 150ms ease-out, box-shadow 150ms ease-out",
                                }}
                            />
                        );
                    })}
                    <div
                        className="absolute flex items-center justify-center"
                        style={{
                            left: 92,
                            top: 42,
                            width: 26,
                            height: 52,
                            fontSize: 32,
                            color: INK,
                            fontFamily: "Georgia, 'Times New Roman', serif",
                            fontStyle: "italic",
                            opacity: dim("answer"),
                            transition: "opacity 150ms ease-out",
                        }}
                    >
                        x
                    </div>

                    {/* Target derivative */}
                    <div
                        className="absolute"
                        style={{
                            left: 360,
                            top: 20,
                            fontSize: 13,
                            color: INK_SOFT,
                            opacity: dim("target"),
                            transition: "opacity 150ms ease-out",
                        }}
                    >
                        Target derivative
                    </div>
                    <div
                        onPointerEnter={() => setVar("reverseHighlight", "target")}
                        onPointerLeave={() => setVar("reverseHighlight", "")}
                        className="absolute rounded-lg px-2"
                        style={{
                            left: 356,
                            top: 44,
                            fontSize: 34,
                            color: INK,
                            fontFamily: "Georgia, 'Times New Roman', serif",
                            fontStyle: "italic",
                            boxShadow: targetActive ? "0 0 0 7px rgba(98, 208, 173, 0.28)" : "none",
                            backgroundColor: targetActive ? "rgba(98, 208, 173, 0.18)" : "transparent",
                            opacity: dim("target"),
                            transition: "opacity 150ms ease-out, box-shadow 150ms ease-out",
                        }}
                    >
                        {term(TARGET_COEFFICIENT, TARGET_POWER)}
                    </div>

                    {/* Live check */}
                    <div
                        onPointerEnter={() => setVar("reverseHighlight", "check")}
                        onPointerLeave={() => setVar("reverseHighlight", "")}
                        className="absolute"
                        style={{
                            left: 32,
                            top: 112,
                            width: 536,
                            opacity: dim("check"),
                            transition: "opacity 150ms ease-out",
                        }}
                    >
                        <div style={{ fontSize: 13, color: INK_SOFT }}>Your answer differentiates to</div>
                        <div className="flex items-baseline gap-4">
                            <div
                                style={{
                                    fontSize: 30,
                                    color: matches ? ACCENT_DEEP : INK,
                                    fontFamily: "Georgia, 'Times New Roman', serif",
                                    fontStyle: "italic",
                                    minWidth: 96,
                                    paddingTop: 6,
                                    textShadow: checkActive ? "0 0 14px rgba(98, 208, 173, 0.55)" : "none",
                                    transition: "color 150ms ease-out",
                                }}
                            >
                                {built ? term(derivedCoefficient, power - 1) : "—"}
                            </div>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: matches ? ACCENT_DEEP : "#B45309",
                                    maxWidth: 420,
                                    lineHeight: 1.4,
                                }}
                            >
                                {verdict}
                            </div>
                        </div>
                    </div>

                    {/* Loose tiles */}
                    <div
                        className="absolute"
                        style={{ left: 32, top: 192, fontSize: 13, color: INK_SOFT, opacity: dim("tiles") }}
                    >
                        Numbers
                    </div>
                    <div
                        className="absolute"
                        style={{ left: 320, top: 192, fontSize: 13, color: INK_SOFT, opacity: dim("tiles") }}
                    >
                        Powers
                    </div>
                    {TILES.map((tile) => {
                        const isPlaced = inNumberSlot === tile.id || inPowerSlot === tile.id;
                        const position = positions[tile.id];
                        return (
                            <div
                                key={tile.id}
                                onPointerDown={(event) => handlePointerDown(event, tile)}
                                onPointerMove={(event) => handlePointerMove(event, tile)}
                                onPointerUp={() => handlePointerUp(tile)}
                                onPointerCancel={() => handlePointerUp(tile)}
                                className="absolute flex items-center justify-center rounded-lg select-none"
                                style={{
                                    left: position.x,
                                    top: position.y,
                                    width: TILE,
                                    height: TILE,
                                    backgroundColor: isPlaced ? "rgba(98, 208, 173, 0.18)" : "#FFFFFF",
                                    border: `2px solid ${isPlaced ? ACCENT_DEEP : ACCENT}`,
                                    boxShadow:
                                        dragging === tile.id
                                            ? "0 4px 10px rgba(15, 23, 42, 0.18)"
                                            : "0 1px 3px rgba(15, 23, 42, 0.12)",
                                    opacity: highlight !== "" && !(isPlaced && highlight === "answer") ? 0.38 : 1,
                                    color: INK,
                                    fontSize: 22,
                                    fontFamily: "Georgia, 'Times New Roman', serif",
                                    fontStyle: "italic",
                                    cursor: dragging === tile.id ? "grabbing" : "grab",
                                    transition:
                                        dragging === tile.id
                                            ? "none"
                                            : "left 220ms ease-out, top 220ms ease-out, opacity 150ms ease-out",
                                    touchAction: "none",
                                }}
                            >
                                {tile.value}
                            </div>
                        );
                    })}
                </div>

                <InteractionHintSequence
                    hintKey="reversal-builder-drag"
                    steps={[
                        {
                            gesture: "drag",
                            label: "Drag a number tile into the empty box",
                            position: { x: "9%", y: "82%" },
                            dragPath: {
                                type: "line",
                                startOffset: { x: 8, y: 8 },
                                endOffset: { x: 4, y: -76 },
                            },
                        },
                        {
                            gesture: "drag",
                            label: "Now drag a power tile into the raised slot",
                            position: { x: "56%", y: "82%" },
                            dragPath: {
                                type: "line",
                                startOffset: { x: 8, y: 8 },
                                endOffset: { x: -70, y: -80 },
                            },
                        },
                    ]}
                    currentStep={inNumberSlot ? 1 : 0}
                />
            </div>
        </div>
    );
}

function ReversalBuilderFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="reversal-builder"
            onReset={() => {
                setVar("reverseCoefficient", 0);
                setVar("reversePower", 0);
                setVar("reverseMatched", 0);
                setVar("reverseHighlight", "");
            }}
            caption="8x³ is the derivative you are trying to come back from. Drop a number and a power into the empty box, and the line below differentiates whatever you build so you can compare it with the target."
        >
            <ReversalBuilderDrawing />
        </Figure>
    );
}

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
                Differentiating x³ gives 3x², so the power rule does two jobs: multiply by the power,
                then drop the power by one. Coming back, you do both jobs the other way round: raise
                the power first, then divide by that new power.
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
                Follow it on 8x³: raise the power to x⁴, then divide by that new power, leaving 2x⁴.
                Differentiate 2x⁴ and 8x³ comes straight back, which is how you check a reversal. The
                same{" "}
                <InlineLinkedHighlight
                    id="highlight-undoing-target"
                    varName="reverseHighlight"
                    highlightId="target"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('reverseHighlight'))}
                >
                    8x³
                </InlineLinkedHighlight>
                {" "}waits below beside an{" "}
                <InlineLinkedHighlight
                    id="highlight-undoing-answer"
                    varName="reverseHighlight"
                    highlightId="answer"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('reverseHighlight'))}
                >
                    empty box
                </InlineLinkedHighlight>
                , so drop a number and a power into it and watch the check happen underneath.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-undoing-machine-visual" maxWidth="xl">
        <Block id="undoing-machine-visual" padding="sm" hasVisualization>
            <ReversalBuilderFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-undoing-check-hook" maxWidth="xl">
        <Block id="undoing-check-hook" padding="sm">
            <EditableParagraph id="para-undoing-check-hook" blockId="undoing-check-hook">
                So far the reversal looks safe, because{" "}
                <InlineLinkedHighlight
                    id="highlight-undoing-check"
                    varName="reverseHighlight"
                    highlightId="check"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('reverseHighlight'))}
                >
                    differentiating your answer
                </InlineLinkedHighlight>
                {" "}always brings the original back. But run that check on 2x⁴ + 7, and something
                strange happens.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-undoing-question-twenty" maxWidth="xl">
        <Block id="undoing-question-twenty" padding="md">
            <EditableParagraph id="para-undoing-question-twenty" blockId="undoing-question-twenty">
                Take a new one through the same two moves:{" "}
                <InlineFeedback
                    varName="answer_undoing_twenty"
                    correctValue="5"
                    position="mid"
                    successMessage="✓ 20 shared into 4"
                    hint="the power climbs to 4, and 20 is then divided by it"
                >
                    <InlineClozeInput
                        varName="answer_undoing_twenty"
                        correctAnswer="5"
                        {...clozePropsFromDefinition(getVariableInfo('answer_undoing_twenty'))}
                    />
                </InlineFeedback>
                {" "}is the number in front when 20x³ is reversed into a term in x⁴.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-undoing-question-power" maxWidth="xl">
        <Block id="undoing-question-power" padding="md">
            <EditableParagraph id="para-undoing-question-power" blockId="undoing-question-power">
                Here the numbers change but the pattern does not. Reversing 6x⁵ produces a term in x to
                the power{" "}
                <InlineFeedback
                    varName="answer_undoing_power"
                    correctValue="6"
                    position="terminal"
                    successMessage="— exactly, the power always climbs by one on the way back"
                    failureMessage="— not that one."
                    hint="Differentiating drops the power by one, so reversing has to put it back"
                    reviewBlockId="undoing-forward"
                    reviewLabel="Look again at the two moves"
                    visualizationHint={{
                        blockId: "undoing-machine-visual",
                        hintKey: "feedback-reversal-power-hint",
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drop the power tile 4 into the raised slot and watch the power on the check line",
                                position: { x: "76%", y: "82%" },
                                dragPath: {
                                    type: "line",
                                    startOffset: { x: 8, y: 8 },
                                    endOffset: { x: -70, y: -80 },
                                },
                                completionVar: "reversePower",
                                completionValue: 4,
                                completionTolerance: 0.4,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { reverseCoefficient: 0, reversePower: 0, reverseMatched: 0, reverseHighlight: "" },
                    }}
                >
                    <InlineClozeInput
                        varName="answer_undoing_power"
                        correctAnswer="6"
                        {...clozePropsFromDefinition(getVariableInfo('answer_undoing_power'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
