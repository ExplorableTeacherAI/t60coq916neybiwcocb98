import { useRef, useState, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineFormula,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineSpotColor,
    InlineTooltip,
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
    spotColorPropsFromDefinition,
} from "../variables";

// ─────────────────────────────────────────────────────────────────────────────
// y = x² + C — a curve the student slides up and down. Once they let go, every
// other curve that reverses from the same 2x fades in behind it.
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_WIDTH = 520;
const VIEW_HEIGHT = 320;
const PLOT_LEFT = 40;
const PLOT_RIGHT = 490;
const PLOT_TOP = 44;
const PLOT_BOTTOM = 286;

const X_MIN = -2.6;
const X_MAX = 2.6;
const Y_MIN = -4;
const Y_MAX = 10;

const CURVE_HUE = "#62D0AD";
const CURVE_HUE_DEEP = "#0F766E";
const CONSTANT_HUE_DEEP = "#7C3AED";
const POWER_HUE_DEEP = "#4338CA";
const INK = "#334155";
const INK_SOFT = "#64748B";
const AXIS = "#CBD5E1";

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const toX = (x: number) => PLOT_LEFT + ((x - X_MIN) / (X_MAX - X_MIN)) * (PLOT_RIGHT - PLOT_LEFT);
const toCurveY = (y: number) => PLOT_TOP + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * (PLOT_BOTTOM - PLOT_TOP);

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

function FamilyCurveDrawing() {
    const setVar = useSetVar();
    const shift = useVar<number>("familyShift", 0);
    const committed = useVar<number>("familyCommitted", 0);
    const highlight = useVar<string>("familyHighlight", "");

    const svgRef = useRef<SVGSVGElement>(null);
    const [dragging, setDragging] = useState(false);
    const grabOffset = useRef(0);

    const recede = (id: string) => (highlight !== "" && highlight !== id ? 0.35 : 1);
    const curveActive = highlight === "curve";
    const familyActive = highlight === "family";

    const dataFromEvent = (event: React.PointerEvent) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        const stageX = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
        const stageY = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
        return {
            x: X_MIN + ((stageX - PLOT_LEFT) / (PLOT_RIGHT - PLOT_LEFT)) * (X_MAX - X_MIN),
            y: Y_MAX - ((stageY - PLOT_TOP) / (PLOT_BOTTOM - PLOT_TOP)) * (Y_MAX - Y_MIN),
        };
    };

    const startDrag = (event: React.PointerEvent<SVGPathElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        const data = dataFromEvent(event);
        grabOffset.current = shift - (data.y - data.x * data.x);
        setDragging(true);
    };

    const moveDrag = (event: React.PointerEvent<SVGPathElement>) => {
        if (!dragging) return;
        const data = dataFromEvent(event);
        const raw = data.y - data.x * data.x + grabOffset.current;
        setVar("familyShift", clamp(Math.round(raw * 2) / 2, -3, 3));
    };

    const endDrag = () => {
        if (!dragging) return;
        setDragging(false);
        setVar("familyCommitted", 1);
    };

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

                {/* The rest of the family, revealed once the student lets go */}
                <g
                    opacity={committed ? recede("family") : 0}
                    style={{ transition: "opacity 400ms ease-out" }}
                    onPointerEnter={() => setVar("familyHighlight", "family")}
                    onPointerLeave={() => setVar("familyHighlight", "")}
                >
                    {GHOST_CONSTANTS.filter((c) => Math.abs(c - shift) > 0.25).map((c) => (
                        <path
                            key={`ghost-${c}`}
                            d={curvePath(c)}
                            fill="none"
                            stroke={familyActive ? CURVE_HUE_DEEP : INK_SOFT}
                            strokeWidth={familyActive ? 2.5 : 1.5}
                            opacity={familyActive ? 0.9 : 0.5}
                            strokeLinecap="round"
                            style={{ transition: "stroke-width 150ms ease-out, opacity 150ms ease-out" }}
                        />
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
                        style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                        onPointerDown={startDrag}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                        onPointerEnter={() => setVar("familyHighlight", "curve")}
                        onPointerLeave={() => setVar("familyHighlight", "")}
                    />
                </g>

                {/* Readouts */}
                <text
                    x="14" y="24" fontSize="14"
                    fill={shift === 0 ? (curveActive ? CURVE_HUE_DEEP : INK) : CONSTANT_HUE_DEEP}
                    opacity={recede("curve")}
                    style={{ fontVariantNumeric: "tabular-nums", transition: "opacity 150ms ease-out" }}
                >
                    {constantLabel(shift)}
                </text>
                <text
                    x={VIEW_WIDTH - 14} y="24" fontSize="14" textAnchor="end" fill={INK_SOFT}
                    opacity={recede("axes")}
                    style={{ transition: "opacity 150ms ease-out" }}
                >
                    differentiates to 2x
                </text>
                {committed === 0 && (
                    <text x={VIEW_WIDTH / 2} y={VIEW_HEIGHT - 8} fontSize="12" fill={INK_SOFT} textAnchor="middle">
                        Slide the curve where you think it belongs, then let go
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

function FamilyCurveFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="family-curve-view"
            onReset={() => {
                setVar("familyShift", 0);
                setVar("familyCommitted", 0);
                setVar("familyHighlight", "");
            }}
            caption="Every curve here differentiates to 2x. Slide the teal one to where you think the answer sits, and once you let go the rest of the family fades in behind it."
        >
            <FamilyCurveDrawing />
        </Figure>
    );
}

export const familyOfCurvesBlocks: ReactElement[] = [
    <StackLayout key="layout-family-heading" maxWidth="xl">
        <Block id="family-heading" padding="md">
            <EditableH2 id="h2-family-heading" blockId="family-heading">
                The Constant of Integration
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-family-setup" maxWidth="xl">
        <Block id="family-setup" padding="sm">
            <EditableParagraph id="para-family-setup" blockId="family-setup">
                Differentiate 2x⁴ + 7 and the 7 simply disappears, because a constant has no steepness
                to contribute. So the reversal of{" "}
                <InlineFormula
                    latex="\clr{coef}{2}\clr{fn}{x}"
                    colorMap={{ coef: "#B45309", fn: CURVE_HUE_DEEP }}
                />
                {" "}is{" "}
                <InlineFormula
                    latex="\clr{fn}{x}^{\clr{pow}{2}}"
                    colorMap={{ fn: CURVE_HUE_DEEP, pow: POWER_HUE_DEEP }}
                />
                {" "}plus some constant, and here that constant is{" "}
                <InlineScrubbleNumber
                    id="scrubble-family-shift"
                    varName="familyShift"
                    {...numberPropsFromDefinition(getVariableInfo('familyShift'))}
                    formatValue={(value) => value.toFixed(1)}
                />
                . Drag the{" "}
                <InlineLinkedHighlight
                    id="highlight-family-curve"
                    varName="familyHighlight"
                    highlightId="curve"
                    color={CURVE_HUE_DEEP}
                    bgColor="rgba(98, 208, 173, 0.22)"
                >
                    teal curve
                </InlineLinkedHighlight>
                {" "}up or down to the height you think the answer sits at, then let go.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-family-shift-visual" maxWidth="xl">
        <Block id="family-shift-visual" padding="sm" hasVisualization>
            <FamilyCurveFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-family-plus-c" maxWidth="xl">
        <Block id="family-plus-c" padding="sm">
            <EditableParagraph id="para-family-plus-c" blockId="family-plus-c">
                Letting go reveals the catch:{" "}
                <InlineLinkedHighlight
                    id="highlight-family-rest"
                    varName="familyHighlight"
                    highlightId="family"
                    color={CONSTANT_HUE_DEEP}
                    bgColor="rgba(172, 139, 249, 0.22)"
                >
                    every other curve in the family
                </InlineLinkedHighlight>
                {" "}has exactly the same steepness at each x, so all of them differentiate to 2x and
                only the height tells them apart. That is why a reversal is never finished without a{" "}
                <InlineSpotColor
                    id="spot-family-constant"
                    varName="roleConstant"
                    {...spotColorPropsFromDefinition(getVariableInfo('roleConstant'))}
                >
                    + C
                </InlineSpotColor>
                {" "}on the end, standing in for every height at once.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-family-question-count" maxWidth="xl">
        <Block id="family-question-count" padding="md">
            <EditableParagraph id="para-family-question-count" blockId="family-question-count">
                So the number of different functions whose derivative is{" "}
                <InlineFormula
                    latex="\clr{coef}{2}\clr{fn}{x}"
                    colorMap={{ coef: "#B45309", fn: CURVE_HUE_DEEP }}
                />
                {" "}turns out to be{" "}
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
                                label: "Drag the teal curve well above where it started, and read the label on the right",
                                position: { x: "62%", y: "45%" },
                                dragPath: { type: "line", startOffset: { x: 0, y: 20 }, endOffset: { x: 0, y: -30 } },
                                completionVar: "familyShift",
                                completionValue: 2,
                                completionTolerance: 0.6,
                            },
                            {
                                gesture: "drag-vertical",
                                label: "Now drag it below the axis — it still differentiates to 2x",
                                position: { x: "62%", y: "40%" },
                                dragPath: { type: "line", startOffset: { x: 0, y: -20 }, endOffset: { x: 0, y: 30 } },
                                completionVar: "familyShift",
                                completionValue: -2,
                                completionTolerance: 0.6,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { familyShift: 0, familyCommitted: 0, familyHighlight: "" },
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
                Writing the reversal of{" "}
                <InlineFormula
                    latex="\clr{coef}{2}\clr{fn}{x}"
                    colorMap={{ coef: "#B45309", fn: CURVE_HUE_DEEP }}
                />
                {" "}as{" "}
                <InlineFormula
                    latex="\clr{fn}{x}^{\clr{pow}{2}}"
                    colorMap={{ fn: CURVE_HUE_DEEP, pow: POWER_HUE_DEEP }}
                />
                {" "}on its own names one curve out of that whole family, so the{" "}
                <InlineTooltip
                    id="tooltip-family-constant"
                    color={CONSTANT_HUE_DEEP}
                    bgColor="rgba(172, 139, 249, 0.18)"
                    tooltip="The constant of integration: written in violet throughout this lesson, it stands in for every height the curve could sit at."
                >
                    piece still missing
                </InlineTooltip>
                {" "}from the end of the answer is{" "}
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
