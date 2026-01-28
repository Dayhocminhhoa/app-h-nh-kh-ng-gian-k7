
export enum ShapeType {
  CUBOID = 'CUBOID',
  TRIANGULAR_PRISM = 'TRIANGULAR_PRISM',
  QUADRILATERAL_PRISM = 'QUADRILATERAL_PRISM',
}

export interface RealWorldExample {
  title: string;
  description: string;
  iconName: string;
}

export interface ShapeConfig {
  id: ShapeType;
  name: string;
  description: string;
  faces: number | string;
  edges: number | string;
  vertices: number | string;
  realWorldExamples: RealWorldExample[];
}
