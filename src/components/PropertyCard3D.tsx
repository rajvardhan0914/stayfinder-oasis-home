import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Mesh } from 'three';

interface PropertyCard3DProps {
  image: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function PropertyCard3D({ image, position = [0, 0, 0], rotation = [0, 0, 0] }: PropertyCard3DProps) {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(image);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <boxGeometry args={[2, 1.5, 0.1]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
} 