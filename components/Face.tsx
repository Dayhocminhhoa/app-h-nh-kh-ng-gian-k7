
import React, { useState, useMemo } from 'react';
import { DoubleSide, Euler, BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';
import { Html, Edges } from '@react-three/drei';
import { COLORS } from '../constants';

interface FaceProps {
  vertices: [number, number, number][]; // Tọa độ các đỉnh tương đối với bản lề (0,0,0)
  color: string;
  foldAngle: number; // Góc xoay hiện tại (radian)
  position?: [number, number, number]; // V vị trí của bản lề trong không gian cha
  hingeEdge?: 'left' | 'right' | 'top' | 'bottom';
  label?: string;
  showLabels?: boolean;
  children?: React.ReactNode;
}

const Face: React.FC<FaceProps> = ({
  vertices,
  color,
  foldAngle,
  position = [0, 0, 0],
  hingeEdge,
  label,
  showLabels = false,
  children
}) => {
  const [hovered, setHovered] = useState(false);

  // Tạo geometry cho mặt
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const flatVertices = new Float32Array(vertices.flat());
    geo.setAttribute('position', new Float32BufferAttribute(flatVertices, 3));
    
    let indices: number[] = [];
    if (vertices.length === 3) {
      indices = [0, 1, 2];
    } else if (vertices.length === 4) {
      indices = [0, 1, 2, 0, 2, 3];
    }
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [vertices]);

  // Tính toán tâm để đặt nhãn
  const center = useMemo(() => {
    const vectors = vertices.map(v => new Vector3(...v));
    const min = new Vector3(Infinity, Infinity, Infinity);
    const max = new Vector3(-Infinity, -Infinity, -Infinity);
    vectors.forEach(v => {
      min.min(v);
      max.max(v);
    });
    return new Vector3().addVectors(min, max).multiplyScalar(0.5);
  }, [vertices]);

  const internalRotation = new Euler(0, 0, 0);
  if (hingeEdge === 'top') {
    internalRotation.x = foldAngle;
  } else if (hingeEdge === 'bottom') {
    internalRotation.x = -foldAngle;
  } else if (hingeEdge === 'left') {
    internalRotation.z = -foldAngle;
  } else if (hingeEdge === 'right') {
    internalRotation.z = foldAngle;
  }

  return (
    <group position={position}>
      <group rotation={internalRotation}>
        {/* Mặt chính với hiệu ứng TRONG SUỐT */}
        <mesh
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
          onPointerOut={() => setHovered(false)}
          geometry={geometry}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={hovered ? COLORS.HIGHLIGHT : color}
            side={DoubleSide}
            transparent
            opacity={hovered ? 0.8 : 0.6} // Tăng độ đậm khi hover
            roughness={0.4}
            metalness={0.1}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />

          {/* Viền các cạnh phát sáng vàng khi hover, mặc định là đen */}
          <Edges 
            threshold={15} 
            color={hovered ? COLORS.HIGHLIGHT : "#000000"} 
            scale={1.001} // Nhích nhẹ để không bị z-fighting
          >
            <meshBasicMaterial 
              color={hovered ? COLORS.HIGHLIGHT : "#000000"} 
              toneMapped={false} 
            />
          </Edges>

          {showLabels && label && (
            <Html 
              position={[center.x, center.y, center.z]} 
              center 
              distanceFactor={8}
              occlude
            >
              <div className="pointer-events-none select-none">
                <div className={`backdrop-blur-md text-white px-2 py-1 rounded shadow-lg border text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${hovered ? 'bg-amber-600 border-white scale-110' : 'bg-slate-900/90 border-white/20'}`}>
                  {label}
                </div>
              </div>
            </Html>
          )}
        </mesh>
        
        {children}
      </group>
    </group>
  );
};

export default Face;
