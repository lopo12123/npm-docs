import {
    Adornment,
    Binding,
    Diagram, GraphLinksModel,
    GraphObject, Link, Model,
    Node, Palette,
    Panel,
    Placeholder,
    Point,
    Shape,
    Size,
    Spot,
    TextBlock
} from "gojs"

/**
 * @description item in palette
 */
interface PaletteItem {
    // text in item
    text: string
    // type of item
    figure: BuildInFigure
    // bg-color of item
    fill: string
}

/**
 * @description enum of build-in figures
 */
const enum BuildInFigure {
    "Rectangle" = "Rectangle",
    "Square" = "Square",
    "RoundedRectangle" = "RoundedRectangle",
    "Border" = "Border",
    "Ellipse" = "Ellipse",
    "Circle" = "Circle",
    "TriangleRight" = "TriangleRight",
    "TriangleDown" = "TriangleDown",
    "TriangleLeft" = "TriangleLeft",
    "TriangleUp" = "TriangleUp",
    "Triangle" = "Triangle",
    "Diamond" = "Diamond",
    "LineH" = "LineH",
    "LineV" = "LineV",
    "None" = "None",
    "BarH" = "BarH",
    "BarV" = "BarV",
    "MinusLine" = "MinusLine",
    "PlusLine" = "PlusLine",
    "XLine" = "XLine"
}

// alias for gojs.GraphObject.make
const $make = GraphObject.make

// region misc
/**
 * @description [port] create port for elements on the diagram
 * @param name port name
 * @param spot the Spot of the element this port is
 * @param output if the port can output
 * @param input if the port can input
 */
const makePort = (name: 'T' | 'R' | 'B' | 'L', spot: Spot, output: boolean, input: boolean) => {
    return $make(Shape, 'Circle', {
        // default is not seen
        fill: null, stroke: null,
        // port size
        desiredSize: new Size(7, 7),
        // port position
        alignment: spot,
        // port name
        portId: name,
        // declare where links may connect at this port
        fromSpot: spot, toSpot: spot,
        // declare whether the user may draw links to/from here
        fromLinkable: output, toLinkable: input,
        // cursor
        cursor: 'pointer'
    })
}
const showPort = (node: GraphObject, show: boolean) => {
    console.log(node, show ? 'in' : 'out')
    // node.ports.each((port) => {
    //     if(port.portId !== '') {
    //         port.fill = show ? '#0000004d' : null
    //     }
    // })
}
// endregion

// region core
/**
 * @description generate an empty model
 */
const emptyModel = () => {
    return Model.fromJson(JSON.stringify({
        class: 'GraphLinkModel',
        linkFromPortIdProperty: 'fromPort',
        linkToPortIdPorperty: 'toPort',
        nodeDataArray: [],
        linkDataArray: []
    }))
}
/**
 * @description create a diagram on specific element
 */
const baseDiagram = (el: HTMLDivElement) => {
    return $make(
        Diagram, el,
        {
            // 背景网格
            grid: $make(
                Panel, "Grid",
                $make(Shape, 'LineH', { stroke: 'lightgray', strokeWidth: 0.5 }),
                $make(Shape, 'LineH', { stroke: 'gray', strokeWidth: 0.5, interval: 10 }),
                $make(Shape, 'LineV', { stroke: 'lightgray', strokeWidth: 0.5 }),
                $make(Shape, 'LineV', { stroke: 'gray', strokeWidth: 0.5, interval: 10 }),
            ),
            // 拖拽功能
            // 不允许拖拽线条
            "draggingTool.dragsLink": false,
            "draggingTool.isGridSnapEnabled": true,
            // 连线功能
            // 不允许无连接的线
            "linkingTool.isUnconnectedLinkValid": true,
            "linkingTool.portGravity": 20,
            // 编辑连线连接目标
            // 不允许无连接的线
            "relinkingTool.isUnconnectedLinkValid": false,
            "relinkingTool.portGravity": 20,
            "relinkingTool.fromHandleArchetype": $make(Shape, 'Diamond', {
                segmentIndex: 0,
                cursor: 'pointer',
                desiredSize: new Size(8, 8),
                fill: 'lightblue',
                stroke: 'lightblue'
            }),
            "relinkingTool.toHandleArchetype": $make(Shape, 'Diamond', {
                segmentIndex: -1,
                cursor: 'pointer',
                desiredSize: new Size(8, 8),
                fill: 'lightblue',
                stroke: 'lightblue'
            }),
            // 编辑连线转折
            "linkReshapingTool.handleArchetype": $make(Shape, 'Diamond', {
                desiredSize: new Size(7, 7),
                fill: 'lightblue',
                stroke: 'lightblue'
            }),
            "rotatingTool.handleAngle": 270,
            "rotatingTool.handleDistance": 30,
            "rotatingTool.snapAngleMultiple": 15,
            "rotatingTool.snapAngleEpsilon": 15,
            "undoManager.isEnabled": true
        }
    )
}
/**
 * @description [template: node-selection] selection adornment template for node
 */
const nodeSelectTemplate = () => {
    return $make(
        Adornment, 'Auto',
        $make(Shape, { fill: null, stroke: 'deepskyblue', strokeWidth: 1, strokeDashArray: [ 4, 2 ] }),
        $make(Placeholder)
    )
}
/**
 * @description [template: node-resize] resize adornment template for node
 */
const nodeResizeTemplate = () => {
    return $make(
        Adornment, 'Spot', { locationSpot: Spot.Right },
        $make(Placeholder),
        $make(Shape, {
            alignment: Spot.TopLeft,
            cursor: 'nw-resize',
            desiredSize: new Size(6, 6),
            fill: 'lightblue',
            stroke: 'deepskyblue'
        }),
        $make(Shape, {
            alignment: Spot.Top,
            cursor: 'n-resize',
            desiredSize: new Size(6, 6),
            fill: 'lightblue',
            stroke: 'deepskyblue'
        }),
        $make(Shape, {
            alignment: Spot.TopRight,
            cursor: 'ne-resize',
            desiredSize: new Size(6, 6),
            fill: 'lightblue',
            stroke: 'deepskyblue'
        }),
        $make(Shape, {
            alignment: Spot.Right,
            cursor: 'e-resize',
            desiredSize: new Size(6, 6),
            fill: 'lightblue',
            stroke: 'deepskyblue'
        }),
        $make(Shape, {
            alignment: Spot.BottomRight,
            cursor: 'sw-resize',
            desiredSize: new Size(6, 6),
            fill: 'lightblue',
            stroke: 'deepskyblue'
        }),
        $make(Shape, {
            alignment: Spot.Bottom,
            cursor: 's-resize',
            desiredSize: new Size(6, 6),
            fill: 'lightblue',
            stroke: 'deepskyblue'
        }),
        $make(Shape, {
            alignment: Spot.BottomLeft,
            cursor: 'se-resize',
            desiredSize: new Size(6, 6),
            fill: 'lightblue',
            stroke: 'deepskyblue'
        }),
        $make(Shape, {
            alignment: Spot.Left,
            cursor: 'w-resize',
            desiredSize: new Size(6, 6),
            fill: 'lightblue',
            stroke: 'deepskyblue'
        }),
    )
}
/**
 * @description [template: node-rotate] rotate adornment template for node
 */
const nodeRotateTemplate = () => {
    return $make(
        Adornment, { locationSpot: Spot.Center, locationObjectName: 'CIRCLE' },
        $make(Shape, 'Circle', {
            name: 'CIRCLE',
            cursor: 'pointer',
            desiredSize: new Size(7, 7),
            fill: 'lightblue',
            stroke: 'deepskyblue'
        }),
        $make(Shape, {
            geometryString: 'M3.5 7 L3.5 30',
            isGeometryPositioned: true,
            stroke: 'deepskyblue',
            strokeWidth: 1,
            strokeDashArray: [ 4, 2 ]
        })
    )
}
/**
 * @description [template: link-selection] selection adornment template for link
 */
const linkSelectTemplate = () => {
    return $make(
        Adornment, 'Link',
        $make(Shape, {
            // isPanelMain declares that this Shape shares the Link.geometry
            isPanelMain: true,
            fill: null,
            stroke: 'deepskyblue',
            // use selection object's strokeWidth
            strokeWidth: 0
        })
    )
}
/**
 * @description [template: node] template for node
 */
const nodeTemplate = () => {
    return $make(
        Node, 'Spot',
        {
            locationSpot: Spot.Center,
            selectable: true, selectionAdornmentTemplate: nodeSelectTemplate(),
            resizable: true, resizeObjectName: 'PANEL', resizeAdornmentTemplate: nodeResizeTemplate(),
            rotatable: true, rotateAdornmentTemplate: nodeRotateTemplate()
        },
        new Binding('location', 'loc', Point.parse).makeTwoWay(Point.stringify),
        new Binding('angle').makeTwoWay(),
        // the main object is a Panel that surrounds a TextBlock with a Shape
        $make(
            Panel, 'Auto', { name: 'PANEL' },
            new Binding('desiredSize', 'Size', Size.parse).makeTwoWay(Size.stringify),
            // region 外侧边框
            $make(
                Shape, 'Rectangle', {
                    // the default port: if no spot on link data, use closest side
                    portId: '',
                    fromLinkable: true, toLinkable: true,
                    cursor: 'pointer',
                    // default color (can be changed by new Binding('fill'))
                    fill: 'white',
                    strokeWidth: 1
                },
                // custom color
                new Binding('fill'),
                new Binding('figure')
            ),
            // endregion
            // region 内部文字
            $make(
                TextBlock, {
                    font: 'bold 11pt Helvetica, Arial, sans-serif',
                    margin: 8,
                    maxSize: new Size(160, NaN),
                    wrap: TextBlock.WrapFit,
                    editable: true
                },
                new Binding('text').makeTwoWay()
            )
            // endregion
        ),
        // four small named ports, one on each side:
        makePort('T', Spot.Top, false, true),
        makePort('R', Spot.Top, true, true),
        makePort('B', Spot.Top, true, false),
        makePort('L', Spot.Top, true, true),
        // handle mouse enter/leave events to show/hide the ports
        {
            mouseEnter: (e, node) => {
                showPort(node, true)
            },
            mouseLeave: (e, node) => {
                showPort(node, false)
            }
        }
    )
}
const linkTemplate = () => {
    return $make(
        Link,
        {
            routing: Link.AvoidsNodes,
            curve: Link.JumpOver,
            corner: 5,
            toShortLength: 4,
            // select adornment
            selectable: true,
            selectionAdornmentTemplate: linkSelectTemplate(),
            // edit config
            relinkableFrom: true,
            relinkableTo: true,
            reshapable: true
        },
        new Binding('points').makeTwoWay(),
        // 连线的形状
        $make(Shape, { isPanelMain: true, strokeWidth: 2 }),
        // 箭头
        $make(Shape, { toArrow: 'Standard', stroke: null }),
        // 连线上的文字块
        $make(
            Panel, 'Auto',
            // region 外框
            $make(
                Shape, 'RoundedRectangle',
                { fill: null, stroke: '#999999', minSize: new Size(40, NaN) },
                // 不选中时使此文本框不可见
                new Binding('visible', 'isSelected').ofObject()
            ),
            // endregion
            // region 内容
            $make(
                TextBlock,
                {
                    textAlign: 'center',
                    font: '10pt helvetica, arial, sans-serif',
                    // 连线文字颜色
                    stroke: '#777777',
                    margin: 5,
                    minSize: new Size(40, NaN),
                    editable: true
                },
                new Binding('text').makeTwoWay(),
                new Binding('stroke')
            )
            // endregion
        )
    )
}
// endregion

// region utils
/**
 * @description create diagram with template and event bind
 */
const createDiagram = (diagramEl: HTMLDivElement) => {
    // create basic diagram
    const _diagram = baseDiagram(diagramEl)

    // set node template (select、resize、rotate)
    _diagram.nodeTemplate = nodeTemplate()
    // set link template (select、resize)
    _diagram.linkTemplate = linkTemplate()

    return _diagram
}
const createPalette = (paletteEl: HTMLDivElement, diagram: Diagram, items: PaletteItem[]) => {
    return $make(
        Palette, paletteEl,
        {
            maxSelectionCount: 1,
            nodeTemplateMap: diagram.nodeTemplateMap,
            model: new GraphLinksModel(items)
        }
    )
}

// endregion

class GojsOperate {
    private readonly diagram: Diagram
    private readonly palette: Palette
    private readonly model: Model

    constructor(diagramEl: HTMLDivElement, paletteEl: HTMLDivElement) {
        // create an empty model
        this.model = new GraphLinksModel([
            { key: '1' },
            { key: '2' }
        ], [
            { from: '1', to: '2' }
        ])
        // create diagram
        this.diagram = createDiagram(diagramEl)
        // bind model
        this.diagram.model = this.model
        // create palette
        this.palette = createPalette(paletteEl, this.diagram, [
            { text: 'Start', figure: BuildInFigure.Circle, fill: 'lightblue' }
        ])
    }
}

export {
    GojsOperate
}