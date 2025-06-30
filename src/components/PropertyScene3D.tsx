import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { PropertyCard3D } from './PropertyCard3D';

interface PropertyScene3DProps {
  images: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  if (!imagePath.startsWith('/public/')) {
    imagePath = imagePath.replace(/^\//, '');
    imagePath = '/public/' + imagePath;
  }
  return `${API_URL}${imagePath}`;
};

export function PropertyScene3D({ images }: PropertyScene3DProps) {
  return (
    <div className="h-[400px] w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        {images.map((image, index) => (
          <PropertyCard3D
            key={index}
            image={getImageUrl(image)}
            position={[index * 2.5 - (images.length - 1), 0, 0]}
            rotation={[0, 0, 0]}
          />
        ))}
        
        <OrbitControls enableZoom={false} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
} 