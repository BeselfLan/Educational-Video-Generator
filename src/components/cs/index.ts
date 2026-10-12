// Computer-science components: code, terminals, system diagrams, message flows.
export { CodeBlock, type CodeBlockProps, type CodeHighlight, type CodeReveal, type CodeScroll, type LineSpec } from "./CodeBlock";
export { Terminal, commandEnd, type TerminalProps, type TermLine, type TermLineKind } from "./Terminal";
export { DiagramNode, type DiagramNodeProps } from "./DiagramNode";
export { Boundary, type BoundaryProps } from "./Boundary";
export { Connector, resolvePath, pointOn, tangentOn, type ConnectorProps } from "./Connector";
export { Packet, type PacketProps } from "./Packet";
export { SequenceDiagram, type SequenceDiagramProps, type SeqActor, type SeqMessage } from "./SequenceDiagram";
export { AppWindow, type AppWindowProps } from "./AppWindow";
export { LayerStack, type LayerStackProps, type Layer } from "./LayerStack";
