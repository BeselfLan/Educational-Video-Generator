// Subject-independent building blocks: theme, timing helpers, geometry and
// layout/text primitives. Math, stats and CS components all build on these.
export * from "./theme";
export * from "./animation";
export * from "./geometry";
export { Scene, type SceneProps } from "./Scene";
export { Appear, type AppearProps, type AppearFrom } from "./Appear";
export { Title, type TitleProps } from "./Title";
export { Captions, type CaptionsProps, type Cue } from "./Captions";
export { Typewriter, type TypewriterProps } from "./Typewriter";
export { Badge, type BadgeProps } from "./Badge";
export { Panel, type PanelProps } from "./Panel";
export { Icon, type IconName, type IconProps } from "./Icon";
export { BulletList, type BulletListProps, type Bullet } from "./BulletList";
export { Annotation, type AnnotationProps } from "./Annotation";
