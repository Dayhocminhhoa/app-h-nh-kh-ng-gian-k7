
import React from 'react';
import Face from './Face';
import { COLORS } from '../constants';

interface ShapeProps {
  foldProgress: number; // 0 đến 1 (tương ứng góc quay 0 đến 90 độ)
  showLabels: boolean;
  colors: typeof COLORS;
  dimensions: {
    width: number;
    height: number;
    depth: number;
    width2?: number; 
  };
}

/**
 * HÌNH HỘP CHỮ NHẬT (Cuboid)
 */
export const Cuboid: React.FC<ShapeProps> = ({ foldProgress, showLabels, colors, dimensions }) => {
  const angle = (foldProgress * Math.PI) / 2;
  const { width: W, height: H, depth: D } = dimensions;
  return (
    <group position={[-W / 2, 0, -D / 2]}>
      <Face
        label="Mặt đáy"
        showLabels={showLabels}
        color={colors.FACE_BASE}
        vertices={[[0, 0, 0], [W, 0, 0], [W, 0, D], [0, 0, D]]}
        foldAngle={0}
      >
        <Face
          label="Mặt bên"
          showLabels={showLabels}
          color={colors.FACE_SIDE}
          vertices={[[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]]}
          position={[0, 0, D]}
          hingeEdge="bottom"
          foldAngle={angle}
        />
        <Face
          label="Mặt bên"
          showLabels={showLabels}
          color={colors.FACE_SIDE}
          vertices={[[0, 0, 0], [W, 0, 0], [W, 0, -H], [0, 0, -H]]}
          position={[0, 0, 0]}
          hingeEdge="top"
          foldAngle={angle}
        >
           <Face
              label="Mặt đáy"
              showLabels={showLabels}
              color={colors.FACE_TOP}
              vertices={[[0, 0, 0], [W, 0, 0], [W, 0, -D], [0, 0, -D]]}
              position={[0, 0, -H]}
              hingeEdge="top"
              foldAngle={angle}
            />
        </Face>
        <Face
          label="Mặt bên"
          showLabels={showLabels}
          color={colors.FACE_SIDE}
          vertices={[[0, 0, 0], [0, 0, D], [-H, 0, D], [-H, 0, 0]]}
          position={[0, 0, 0]}
          hingeEdge="left"
          foldAngle={angle}
        />
        <Face
          label="Mặt bên"
          showLabels={showLabels}
          color={colors.FACE_SIDE}
          vertices={[[0, 0, 0], [0, 0, D], [H, 0, D], [H, 0, 0]]}
          position={[W, 0, 0]}
          hingeEdge="right"
          foldAngle={angle}
        />
      </Face>
    </group>
  );
};

/**
 * LĂNG TRỤ ĐỨNG TAM GIÁC
 */
export const TriangularPrism: React.FC<ShapeProps> = ({ foldProgress, showLabels, colors, dimensions }) => {
  const { width: w, height: h, depth: d } = dimensions;
  const sideLen = Math.sqrt(Math.pow(w / 2, 2) + Math.pow(d, 2));
  const interiorBaseAngle = Math.atan2(d, w / 2); 
  const sideFoldAngle = foldProgress * (Math.PI - interiorBaseAngle);
  const lidFoldAngle = foldProgress * (Math.PI / 2);
  return (
    <group position={[-w / 2, 0, -h / 2]}>
      <Face
        label="Mặt bên"
        showLabels={showLabels}
        color={colors.FACE_SIDE}
        vertices={[[0, 0, 0], [w, 0, 0], [w, 0, h], [0, 0, h]]}
        foldAngle={0}
      >
        <Face
          label="Mặt bên"
          showLabels={showLabels}
          color={colors.FACE_SIDE}
          vertices={[[0, 0, 0], [-sideLen, 0, 0], [-sideLen, 0, h], [0, 0, h]]}
          position={[0, 0, 0]}
          hingeEdge="left"
          foldAngle={sideFoldAngle}
        />
        <Face
          label="Mặt bên"
          showLabels={showLabels}
          color={colors.FACE_SIDE}
          vertices={[[0, 0, 0], [sideLen, 0, 0], [sideLen, 0, h], [0, 0, h]]}
          position={[w, 0, 0]}
          hingeEdge="right"
          foldAngle={sideFoldAngle}
        />
        <Face
          label="Mặt đáy"
          showLabels={showLabels}
          color={colors.FACE_BASE}
          vertices={[[0, 0, 0], [w, 0, 0], [w / 2, 0, d]]}
          position={[0, 0, h]}
          hingeEdge="bottom"
          foldAngle={lidFoldAngle}
        />
        <Face
          label="Mặt đáy"
          showLabels={showLabels}
          color={colors.FACE_TOP}
          vertices={[[0, 0, 0], [w, 0, 0], [w / 2, 0, -d]]}
          position={[0, 0, 0]}
          hingeEdge="top"
          foldAngle={lidFoldAngle}
        />
      </Face>
    </group>
  );
};

/**
 * LĂNG TRỤ ĐỨNG TỨ GIÁC
 */
export const QuadrilateralPrism: React.FC<ShapeProps> = ({ foldProgress, showLabels, colors, dimensions }) => {
  const lidAngle = (foldProgress * Math.PI) / 2;
  const { width: w1, height: h, depth: d, width2: w2 = 2.0 } = dimensions;
  const sideHingeWidth = Math.sqrt(Math.pow((w1 - w2) / 2, 2) + d * d);
  const trapAngle = Math.atan2(d, (w1 - w2) / 2);
  const sideFoldAngle = foldProgress * (Math.PI - trapAngle);
  const backFoldAngle = foldProgress * trapAngle;
  return (
    <group position={[-w1 / 2, 0, -h / 2]}>
      <Face
        label="Mặt bên"
        showLabels={showLabels}
        color={colors.FACE_SIDE}
        vertices={[[0, 0, 0], [w1, 0, 0], [w1, 0, h], [0, 0, h]]}
        foldAngle={0}
      >
        <Face
          label="Mặt bên"
          showLabels={showLabels}
          color={colors.FACE_SIDE}
          vertices={[[0, 0, 0], [-sideHingeWidth, 0, 0], [-sideHingeWidth, 0, h], [0, 0, h]]}
          position={[0, 0, 0]}
          hingeEdge="left"
          foldAngle={sideFoldAngle}
        />
        <Face
          label="Mặt bên"
          showLabels={showLabels}
          color={colors.FACE_SIDE}
          vertices={[[0, 0, 0], [sideHingeWidth, 0, 0], [sideHingeWidth, 0, h], [0, 0, h]]}
          position={[w1, 0, 0]}
          hingeEdge="right"
          foldAngle={sideFoldAngle}
        >
          <Face
            label="Mặt bên"
            showLabels={showLabels}
            color={colors.FACE_SIDE}
            vertices={[[0, 0, 0], [w2, 0, 0], [w2, 0, h], [0, 0, h]]}
            position={[sideHingeWidth, 0, 0]}
            hingeEdge="right" 
            foldAngle={backFoldAngle}
          />
        </Face>
        <Face
          label="Mặt đáy"
          showLabels={showLabels}
          color={colors.FACE_BASE}
          vertices={[[0, 0, 0], [w1, 0, 0], [(w1 + w2) / 2, 0, d], [(w1 - w2) / 2, 0, d]]}
          position={[0, 0, h]}
          hingeEdge="bottom"
          foldAngle={lidAngle}
        />
        <Face
          label="Mặt đáy"
          showLabels={showLabels}
          color={colors.FACE_TOP}
          vertices={[[0, 0, 0], [w1, 0, 0], [(w1 + w2) / 2, 0, -d], [(w1 - w2) / 2, 0, -d]]}
          position={[0, 0, 0]}
          hingeEdge="top"
          foldAngle={lidAngle}
        />
      </Face>
    </group>
  );
};
