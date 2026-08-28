import { useRef, useState, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import {
    getVariableInfo,
    numberPropsFromDefinition,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "../variables";

// ─────────────────────────────────────────────────────────────────────────────
// Linked pair — LEFT: y = x² + C, a curve the student slides up and down.
// RIGHT: the steepness of that curve at every x, which never moves however far
// the curve slides. Both views read `familyShift`, `familyPointX` and
// `familyHighlight` from the store: one source of truth, no syncing callbacks.
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_WIDTH = 340;
const VIEW_HEIGHT = 300;
const PLOT_LEFT = 40;
const PLOT_RIGHT = 320;
const PLOT_TOP = 40;
const PLOT_BOTTOM = 268;

const X_MIN = -2.6;
const X_MAX = 2.6;
const Y_MIN = -4;
const Y_MAX = 10;
const SLOPE_MIN = -6;
const SLOPE_MAX = 6;

const CURVE_HUE = "#62D0AD";
const CURVE_HUE_DEEP = "#0F766E";
const SLOPE_HUE = "#8E90F5";
const SLOPE_HUE_DEEP = "#4F46E5";
const INK = "#334155";
const INK_SOFT = "#64748B";
const AXIS = "#CBD5E1";

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const toX = (x: number) => PLOT_LEFT + ((x - X_MIN) / (X_MAX - X_MIN)) * (PLOT_RIGHT - PLOT_LEFT);
const toCurveY = (y: number) => PLOT_TOP + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * (PLOT_BOTTOM - PLOT_TOP);
const toSlopeY = (s: number) =>
    PLOT_TOP + ((SLOPE_MAX - s) / (SLOPE_MAX - SLOPE_MIN)) * (PLOT_BOTTOM - PLOT_TOP);

const oneDecimal = (value: number) => value.toFixed(1);
const constantLabel = (c: number) =>
    c === 0 ? "y = x²" : c > 0 ? `y = x² + ${oneDecimal(c)}` : `y = x² − ${oneDecimal(Math.abs(c))}`;

const curvePath = (c: number): string => {
    let path = "";
    for (let index = 0; index <= 80; index += 1) {
        const x = X_MIN + ((X_MAX - X_MIN) * index) / 80;
        const point = `${toX(x).toFixed(1)} ${toCurveY(x * x + c).toFixed(1)}`;
        path += index === 0 ? `M ${point}` : ` L ${point}`;
    }
    return path;
};

const GHOST_CONSTANTS = [-3, -2, -1, 0, 1, 2, 3];

/** Shared highlight behaviour: the target pops, everything else recedes. */
function useFamilyHighlight() {
    const highlight = useVar<string>("familyHighlight", "");
    const setVar = useSetVar();
    return {
        highlight,
        recede: (id: string) => (highlight !== "" && highlight !== id ? 0.35 : 1),
        isActive: (id: string) => highlight === id,
        hover: (id: string) => ({
            onPointerEnter: () => setVar("familyHighlight", id),
            onPointerLeave: () => setVar("familyHighlight", ""),
        }),
    };
}

function useStagePointer(ref: React.RefObject<SVGSVGElement>) {
    return (event: React.PointerEvent): { x: number; y: number } => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH,
            y: ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT,
        };
    };
}

// ── LEFT VIEW ───────────────────────────────────────────────────────────────
function CurveView() {
    const setVar = useSetVar();
    const shift = useVar<number>("familyShift", 0);
    const markerX = useVar<number>("familyPointX", 1);
    const committed = useVar<number>("familyCommitted", 0);
    const { recede, isActive, hover } = useFamilyHighlight();

    const svgRef = useRef<SVGSVGElement>(null);
    const toStage = useStagePointer(svgRef);
    const [dragging, setDragging] = useState<"curve" | "marker" | null>(null);
    const grabOffset = useRef(0);

    const dataFromStage = (point: { x: number; y: number }) => ({
        x: X_MIN + ((point.x - PLOT_LEFT) / (PLOT_RIGHT - PLOT_LEFT)) * (X_MAX - X_MIN),
        y: Y_MAX - ((point.y - PLOT_TOP) / (PLOT_BOTTOM - PLOT_TOP)) * (Y_MAX - Y_MIN),
    });

    const startCurveDrag = (event: React.PointerEvent<SVGPathElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        const data = dataFromStage(toStage(event));
        grabOffset.current = shift - (data.y - data.x * data.x);
        setDragging("curve");
    };

    const moveCurve = (event: React.PointerEvent<SVGPathElement>) => {
        if (dragging !== "curve") return;
        const data = dataFromStage(toStage(event));
        const raw = data.y - data.x * data.x + grabOffset.current;
        setVar("familyShift", clamp(Math.round(raw * 2) / 2, -3, 3));
    };

    const endCurveDrag = () => {
        if (dragging !== "curve") return;
        setDragging(null);
        setVar("familyCommitted", 1);
    };

    const moveMarker = (event: React.PointerEvent<SVGCircleElement>) => {
        if (dragging !== "marker") return;
        const data = dataFromStage(toStage(event));
        setVar("familyPointX", clamp(Math.round(data.x * 10) / 10, -2.2, 2.2));
    };

    const slope = 2 * markerX;
    const markerY = markerX * markerX + shift;
    const tangentHalf = 0.6;
    const tangentStart: [number, number] = [markerX - tangentHalf, markerY - slope * tangentHalf];
    const tangentEnd: [number, number] = [markerX + tangentHalf, markerY + slope * tangentHalf];

    const curveActive = isActive("curve");
    const steepActive = isActive("steepness");

    return (
        <div className="relative">
            <svg ref={svgRef} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="block w-full">
                {/* Axes */}
                <g opacity={recede("axes")} style={{ transition: "opacity 150ms ease-out" }}>
                    <line x1={PLOT_LEFT} y1={toCurveY(0)} x2={PLOT_RIGHT} y2={toCurveY(0)} stroke={AXIS} strokeWidth="1.5" />
                    <line x1={toX(0)} y1={PLOT_TOP} x2={toX(0)} y2={PLOT_BOTTOM} stroke={AXIS} strokeWidth="1.5" />
                    {[-2, -1, 1, 2].map((tick) => (
                        <text key={`x-${tick}`} x={toX(tick)} y={toCurveY(0) + 16} fontSize="11" fill={INK_SOFT} textAnchor="middle">
                            {tick}
                        </text>
                    ))}
                </g>

                {/* The rest of the family, revealed once the student commits */}
                <g
                    opacity={committed ? recede("family") * 0.55 : 0}
                    style={{ transition: "opacity 400ms ease-out" }}
                >
                    {GHOST_CONSTANTS.filter((c) => Math.abs(c - shift) > 0.25).map((c) => (
                        <path key={`ghost-${c}`} d={curvePath(c)} fill="none" stroke={INK_SOFT} strokeWidth="1.5" strokeLinecap="round" />
                    ))}
                </g>

                {/* The curve the student slides */}
                <g opacity={recede("curve")} style={{ transition: "opacity 150ms ease-out" }}>
                    {curveActive && (
                        <path d={curvePath(shift)} fill="none" stroke={CURVE_HUE} strokeWidth="11" opacity={0.28} strokeLinecap="round" />
                    )}
                    <path
                        d={curvePath(shift)}
                        fill="none"
                        stroke={curveActive ? CURVE_HUE_DEEP : CURVE_HUE}
                        strokeWidth={curveActive ? 5 : 3.5}
                        strokeLinecap="round"
                        style={{ transition: "stroke-width 150ms ease-out" }}
                    />
                    <path
                        d={curvePath(shift)}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="26"
                        style={{ cursor: dragging === "curve" ? "grabbing" : "grab", touchAction: "none" }}
                        onPointerDown={startCurveDrag}
                        onPointerMove={moveCurve}
                        onPointerUp={endCurveDrag}
                        onPointerCancel={endCurveDrag}
                        {...hover("curve")}
                    />
                </g>

                {/* Steepness at the marker: the tangent and its handle */}
                <g opacity={recede("steepness")} style={{ transition: "opacity 150ms ease-out" }}>
                    {steepActive && (
                        <line
                            x1={toX(tangentStart[0])} y1={toCurveY(tangentStart[1])}
                            x2={toX(tangentEnd[0])} y2={toCurveY(tangentEnd[1])}
                            stroke={SLOPE_HUE} strokeWidth="11" opacity={0.28} strokeLinecap="round"
                        />
                    )}
                    <line
                        x1={toX(tangentStart[0])} y1={toCurveY(tangentStart[1])}
                        x2={toX(tangentEnd[0])} y2={toCurveY(tangentEnd[1])}
                        stroke={steepActive ? SLOPE_HUE_DEEP : SLOPE_HUE}
                        strokeWidth={steepActive ? 4 : 2.5}
                        strokeLinecap="round"
                        style={{ transition: "stroke-width 150ms ease-out" }}
                    />
                    <circle
                        cx={toX(markerX)} cy={toCurveY(markerY)} r={steepActive ? 8 : 6}
                        fill={SLOPE_HUE} stroke="#FFFFFF" strokeWidth="2"
                        style={{ transition: "r 150ms ease-out" }}
                    />
                    <circle
                        cx={toX(markerX)} cy={toCurveY(markerY)} r="20" fill="transparent"
                        style={{ cursor: dragging === "marker" ? "grabbing" : "grab", touchAction: "none" }}
                        onPointerDown={(event) => {
                            event.currentTarget.setPointerCapture(event.pointerId);
                            setDragging("marker");
                        }}
                        onPointerMove={moveMarker}
                        onPointerUp={() => setDragging(null)}
                        onPointerCancel={() => setDragging(null)}
                        {...hover("steepness")}
                    />
                </g>

                {/* Readouts */}
                <text x="12" y="20" fontSize="13" fill={curveActive ? CURVE_HUE_DEEP : INK} opacity={recede("curve")}
                    style={{ fontVariantNumeric: "tabular-nums", transition: "opacity 150ms ease-out" }}>
                    {constantLabel(shift)}
                </text>
                <text x={VIEW_WIDTH - 12} y="20" fontSize="13" fill={SLOPE_HUE_DEEP} textAnchor="end" opacity={recede("steepness")}
                    style={{ fontVariantNumeric: "tabular-nums", transition: "opacity 150ms ease-out" }}>
                    {`steepness ${oneDecimal(slope)}`}
                </text>
                {committed === 0 && (
                    <text x={VIEW_WIDTH / 2} y={VIEW_HEIGHT - 8} fontSize="12" fill={INK_SOFT} textAnchor="middle">
                        Slide the curve where you think it belongs
                    </text>
                )}
            </svg>

            <InteractionHintSequence
                hintKey="family-curve-slide"
                steps={[
                    {
                        gesture: "drag-vertical",
                        label: "Drag the teal curve up or down",
                        position: { x: "62%", y: "45%" },
                        dragPath: { type: "line", startOffset: { x: 0, y: -26 }, endOffset: { x: 0, y: 26 } },
                    },
                ]}
            />
        </div>
    );
}

// ── RIGHT VIEW ──────────────────────────────────────────────────────────────
function SteepnessView() {
    const setVar = useSetVar();
    const markerX = useVar<number>("familyPointX", 1);
    const shift = useVar<number>("familyShift", 0);
    const { recede, isActive, hover } = useFamilyHighlight();

    const svgRef = useRef<SVGSVGElement>(null);
    const toStage = useStagePointer(svgRef);
    const [dragging, setDragging] = useState(false);

    const moveMarker = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!dragging) return;
        const point = toStage(event);
        const dataX = X_MIN + ((point.x - PLOT_LEFT) / (PLOT_RIGHT - PLOT_LEFT)) * (X_MAX - X_MIN);
        setVar("familyPointX", clamp(Math.round(dataX * 10) / 10, -2.2, 2.2));
    };

    const slope = 2 * markerX;
    const steepActive = isActive("steepness");

    return (
        <div className="relative">
            <svg ref={svgRef} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="block w-full">
                <g opacity={recede("axes")} style={{ transition: "opacity 150ms ease-out" }}>
                    <line x1={PLOT_LEFT} y1={toSlopeY(0)} x2={PLOT_RIGHT} y2={toSlopeY(0)} stroke={AXIS} strokeWidth="1.5" />
                    <line x1={toX(0)} y1={PLOT_TOP} x2={toX(0)} y2={PLOT_BOTTOM} stroke={AXIS} strokeWidth="1.5" />
                    {[-2, -1, 1, 2].map((tick) => (
                        <text key={`sx-${tick}`} x={toX(tick)} y={toSlopeY(0) + 16} fontSize="11" fill={INK_SOFT} textAnchor="middle">
                            {tick}
                        </text>
                    ))}
                </g>

                {/* The steepness of every curve in the family: one unmoving line */}
                <g opacity={recede("steepness")} style={{ transition: "opacity 150ms ease-out" }}>
                    {steepActive && (
                        <line x1={toX(X_MIN + 0.2)} y1={toSlopeY(2 * (X_MIN + 0.2))} x2={toX(X_MAX - 0.2)} y2={toSlopeY(2 * (X_MAX - 0.2))}
                            stroke={SLOPE_HUE} strokeWidth="11" opacity={0.28} strokeLinecap="round" />
                    )}
                    <line
                        x1={toX(X_MIN + 0.2)} y1={toSlopeY(2 * (X_MIN + 0.2))}
                        x2={toX(X_MAX - 0.2)} y2={toSlopeY(2 * (X_MAX - 0.2))}
                        stroke={steepActive ? SLOPE_HUE_DEEP : SLOPE_HUE}
                        strokeWidth={steepActive ? 4 : 2.5}
                        strokeLinecap="round"
                        style={{ transition: "stroke-width 150ms ease-out" }}
                        {...hover("steepness")}
                    />
                    <line
                        x1={toX(markerX)} y1={toSlopeY(slope)} x2={toX(markerX)} y2={toSlopeY(0)}
                        stroke={SLOPE_HUE} strokeWidth="1.5" strokeDasharray="4 4"
                    />
                    <circle cx={toX(markerX)} cy={toSlopeY(slope)} r={steepActive ? 8 : 6}
                        fill={SLOPE_HUE} stroke="#FFFFFF" strokeWidth="2" style={{ transition: "r 150ms ease-out" }} />
                    <circle
                        cx={toX(markerX)} cy={toSlopeY(slope)} r="20" fill="transparent"
                        style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                        onPointerDown={(event) => {
                            event.currentTarget.setPointerCapture(event.pointerId);
                            setDragging(true);
                        }}
                        onPointerMove={moveMarker}
                        onPointerUp={() => setDragging(false)}
                        onPointerCancel={() => setDragging(false)}
                        {...hover("steepness")}
                    />
                </g>

                <text x="12" y="20" fontSize="13" fill={SLOPE_HUE_DEEP} opacity={recede("steepness")}
                    style={{ fontVariantNumeric: "tabular-nums", transition: "opacity 150ms ease-out" }}>
                    steepness = 2x
                </text>
                <text x={VIEW_WIDTH - 12} y="20" fontSize="13" fill={INK} textAnchor="end" opacity={recede("steepness")}
                    style={{ fontVariantNumeric: "tabular-nums", transition: "opacity 150ms ease-out" }}>
                    {`at x = ${oneDecimal(markerX)}: ${oneDecimal(slope)}`}
                </text>
                <text x={VIEW_WIDTH / 2} y={VIEW_HEIGHT - 8} fontSize="12" fill={INK_SOFT} textAnchor="middle"
                    style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`unchanged while the curve sits at ${oneDecimal(shift)}`}
                </text>
            </svg>

            <InteractionHintSequence
                hintKey="family-steepness-marker"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the indigo point along the line",
                        position: { x: "72%", y: "28%" },
                        dragPath: { type: "line", startOffset: { x: -28, y: 0 }, endOffset: { x: 28, y: 0 } },
                    },
                ]}
            />
        </div>
    );
}

function CurveFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="family-curve-view"
            onReset={() => {
                setVar("familyShift", 0);
                setVar("familyCommitted", 0);
                setVar("familyPointX", 1);
                setVar("familyHighlight", "");
            }}
            caption="Slide the teal curve up or down. Once you let go, every other curve with the same steepness fades in behind it."
        >
            <CurveView />
        </Figure>
    );
}

function SteepnessFigure() {
    return (
        <Figure
            id="family-steepness-view"
            caption="The steepness of that curve at every x. Drag the indigo point along it, and watch this whole line stay put while the curve beside it moves."
        >
            <SteepnessView />
        </Figure>
    );
}

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
                The{" "}
                <InlineLinkedHighlight
                    id="highlight-family-curve"
                    varName="familyHighlight"
                    highlightId="curve"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('familyHighlight'))}
                >
                    curve
                </InlineLinkedHighlight>
                {" "}below slides up and down: put it where you think the true answer sits, and watch
                the{" "}
                <InlineLinkedHighlight
                    id="highlight-family-steepness"
                    varName="familyHighlight"
                    highlightId="steepness"
                    color="#4F46E5"
                    bgColor="rgba(142, 144, 245, 0.22)"
                >
                    steepness
                </InlineLinkedHighlight>
                {" "}graph beside it.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-family-shift-visual" ratio="1:1" gap="lg" align="start">
        <Block id="family-shift-visual" padding="sm" hasVisualization>
            <CurveFigure />
        </Block>
        <Block id="family-steepness-visual" padding="sm" hasVisualization>
            <SteepnessFigure />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-family-plus-c" maxWidth="xl">
        <Block id="family-plus-c" padding="sm">
            <EditableParagraph id="para-family-plus-c" blockId="family-plus-c">
                So reversing a derivative never gives one function, it gives a whole family. Slide it
                to x² +{" "}
                <InlineScrubbleNumber
                    varName="familyShift"
                    {...numberPropsFromDefinition(getVariableInfo('familyShift'))}
                />
                {" "}and the steepness beside it never flinches, which is why we write + C for the
                constant we have no way of knowing. Leaving the + C off quietly throws away every
                member of the family but one.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-family-question-count" maxWidth="xl">
        <Block id="family-question-count" padding="md">
            <EditableParagraph id="para-family-question-count" blockId="family-question-count">
                So the number of different functions whose derivative is 2x turns out to be{" "}
                <InlineFeedback
                    varName="answer_family_count"
                    correctValue="infinitely many"
                    position="terminal"
                    successMessage="— yes, one for every height the curve could sit at"
                    failureMessage="— that is the trap."
                    hint="Every height gives another curve, and there is no limit to the heights"
                    visualizationHint={{
                        blockId: "family-shift-visual",
                        hintKey: "feedback-family-count-hint",
                        steps: [
                            {
                                gesture: "drag-vertical",
                                label: "Drag the teal curve well above where it started, and check the steepness graph",
                                position: { x: "62%", y: "45%" },
                                dragPath: { type: "line", startOffset: { x: 0, y: 20 }, endOffset: { x: 0, y: -30 } },
                                completionVar: "familyShift",
                                completionValue: 2,
                                completionTolerance: 0.6,
                            },
                            {
                                gesture: "drag-vertical",
                                label: "Now drag it below the axis — the steepness graph still has not moved",
                                position: { x: "62%", y: "40%" },
                                dragPath: { type: "line", startOffset: { x: 0, y: -20 }, endOffset: { x: 0, y: 30 } },
                                completionVar: "familyShift",
                                completionValue: -2,
                                completionTolerance: 0.6,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { familyShift: 0, familyCommitted: 0, familyPointX: 1, familyHighlight: "" },
                    }}
                >
                    <InlineClozeChoice
                        varName="answer_family_count"
                        correctAnswer="infinitely many"
                        options={["just one", "exactly two", "infinitely many"]}
                        {...choicePropsFromDefinition(getVariableInfo('answer_family_count'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-family-question-constant" maxWidth="xl">
        <Block id="family-question-constant" padding="md">
            <EditableParagraph id="para-family-question-constant" blockId="family-question-constant">
                Writing the reversal of 2x as x² on its own names one curve out of that whole family,
                so the piece still missing from the end of the answer is{" "}
                <InlineFeedback
                    varName="answer_family_constant"
                    correctValue={["C", "+C", "+ C"]}
                    position="terminal"
                    successMessage="— exactly, and it stands in for every height at once"
                    failureMessage="— not quite."
                    hint="It is the part that differentiates away to nothing"
                    reviewBlockId="family-plus-c"
                    reviewLabel="Look again at the family"
                >
                    <InlineClozeInput
                        varName="answer_family_constant"
                        correctAnswer={["C", "+C", "+ C"]}
                        {...clozePropsFromDefinition(getVariableInfo('answer_family_constant'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
