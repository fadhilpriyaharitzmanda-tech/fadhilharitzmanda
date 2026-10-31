import React, { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { Physics, RigidBody, useRopeJoint, useSphericalJoint, BallCollider, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

extend({ MeshLineGeometry, MeshLineMaterial });

const cardGlb = '/assets/card-BP4TWJmK.glb';
const lanyardBand = '/assets/lanyard-band-VjQJaFOi.png';
const lanyardBack = '/assets/lanyard-back-C3--bKJr.png';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Lanyard 3D Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-white border-4 border-on-surface brick-shadow max-w-sm text-center">
          <img
            src={lanyardBack}
            alt="Lanyard Card"
            className="w-48 h-auto rounded-lg shadow-md border-2 border-on-surface mb-3"
          />
          <p className="font-label-caps text-xs text-on-surface-variant font-bold">
            {this.state.error?.message || '3D Acceleration Loading...'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const frontUV = { x: 0, y: 0, w: 0.5, h: 0.755 };
const backUV = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

const vec = new THREE.Vector3();
const angvelVec = new THREE.Vector3();
const rotVec = new THREE.Vector3();
const dirVec = new THREE.Vector3();

const segmentProps = {
  type: 'dynamic',
  canSleep: true,
  colliders: false,
  angularDamping: 2,
  linearDamping: 2,
};

function Band({
  maxSpeed = 60,
  minSpeed = 10,
  isMobile = false,
  frontImage = lanyardBack,
  backImage = lanyardBack,
  imageFit = 'cover',
  lanyardImage = lanyardBand,
  lanyardWidth = 1,
}) {
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();

  const { nodes, materials } = useGLTF(cardGlb);
  const bandTexture = useTexture(lanyardImage || lanyardBand);
  const frontTexture = useTexture(frontImage || lanyardBack);
  const backTexture = useTexture(backImage || lanyardBack);

  const cardMap = useMemo(() => {
    try {
      const baseMap = materials?.base?.map;
      const baseImg = baseMap?.image;
      const width = baseImg && baseImg.width > 0 ? baseImg.width : 2048;
      const height = baseImg && baseImg.height > 0 ? baseImg.height : 2048;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return baseMap || null;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      if (baseImg && baseImg.width > 0 && baseImg.height > 0) {
        try {
          ctx.drawImage(baseImg, 0, 0, width, height);
        } catch {}
      }

      const drawToRegion = (tex, uv) => {
        const img = tex?.image || tex;
        if (!img || !img.width || !img.height) return;

        const rx = uv.x * width;
        const ry = uv.y * height;
        const rw = uv.w * width;
        const rh = uv.h * height;

        ctx.save();
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.clip();

        if (imageFit === 'fill') {
          try {
            ctx.drawImage(img, rx, ry, rw, rh);
          } catch {}
          ctx.restore();
          return;
        }

        const scale = (imageFit === 'contain' ? Math.min : Math.max)(
          rw / img.width,
          rh / img.height
        );
        const nw = img.width * scale;
        const nh = img.height * scale;
        const nx = rx + (rw - nw) / 2;
        const ny = ry + (rh - nh) / 2;

        try {
          ctx.drawImage(img, nx, ny, nw, nh);
        } catch {}
        ctx.restore();
      };

      if (frontTexture) drawToRegion(frontTexture, frontUV);
      if (backTexture) drawToRegion(backTexture, backUV);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      if (baseMap) texture.flipY = baseMap.flipY;
      texture.anisotropy = 16;
      texture.needsUpdate = true;
      return texture;
    } catch (err) {
      console.warn('cardMap generation error:', err);
      return materials?.base?.map || null;
    }
  }, [imageFit, frontTexture, backTexture, materials?.base?.map]);

  useEffect(() => {
    return () => {
      if (cardMap && typeof cardMap.dispose === 'function') {
        cardMap.dispose();
      }
    };
  }, [cardMap]);

  const [curve] = useState(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
  ]));

  const [dragged, setDragged] = useState(false);
  const [hovered, setHovered] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dirVec.copy(vec).sub(state.camera.position).normalize();
      vec.add(dirVec.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (fixed.current && card.current && band.current) {
      [j1, j2].forEach((ref) => {
        if (ref.current) {
          if (!ref.current.lerped) {
            ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
          }
          const dist = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
          ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + dist * (maxSpeed - minSpeed)));
        }
      });

      if (j3.current && j2.current?.lerped && j1.current?.lerped && fixed.current) {
        curve.points[0].copy(j3.current.translation());
        curve.points[1].copy(j2.current.lerped);
        curve.points[2].copy(j1.current.lerped);
        curve.points[3].copy(fixed.current.translation());
        band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      }

      angvelVec.copy(card.current.angvel());
      rotVec.copy(card.current.rotation());
      card.current.setAngvel({
        x: angvelVec.x,
        y: angvelVec.y - rotVec.y * 0.25,
        z: angvelVec.z,
      });
    }
  });

  curve.curveType = 'chordal';
  if (bandTexture) {
    bandTexture.wrapS = bandTexture.wrapT = THREE.RepeatWrapping;
  }

  if (!nodes?.card) return null;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerUp={(e) => {
              e.target.releasePointerCapture(e.pointerId);
              setDragged(false);
            }}
            onPointerDown={(e) => {
              e.target.setPointerCapture(e.pointerId);
              setDragged(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={0.4}
                clearcoatRoughness={0.25}
                roughness={0.35}
                metalness={0.02}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[window.innerWidth, window.innerHeight]}
          useMap={1}
          map={bandTexture}
          repeat={[-3, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}

export default function Lanyard({
  position = [0, 0, 24],
  gravity = [0, -60, 0],
  fov = 20,
  transparent = true,
  frontImage = lanyardBack,
  backImage = lanyardBack,
  imageFit = 'cover',
  lanyardImage = lanyardBand,
  lanyardWidth = 1,
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ErrorBoundary>
      <div className="relative z-50 w-full h-full flex justify-center items-center pointer-events-auto">
        <Canvas
          camera={{ position, fov }}
          dpr={[1, isMobile ? 1.5 : 2]}
          gl={{ alpha: transparent, antialias: true }}
          onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0), +!transparent)}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[0, 6, 12]} intensity={0.65} />
          <directionalLight position={[-5, 2, 8]} intensity={0.15} />
          <directionalLight position={[5, -2, 8]} intensity={0.15} />
          <Suspense fallback={null}>
            <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
              <Band
                isMobile={isMobile}
                frontImage={frontImage}
                backImage={backImage}
                imageFit={imageFit}
                lanyardImage={lanyardImage}
                lanyardWidth={lanyardWidth}
              />
            </Physics>
            <Environment blur={0.8}>
              <Lightformer intensity={0.4} color="white" position={[0, 2, 8]} scale={[25, 25, 1]} />
              <Lightformer intensity={0.25} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.3, 1]} />
              <Lightformer intensity={0.25} color="white" position={[-1, -1, 2]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.3, 1]} />
              <Lightformer intensity={0.25} color="white" position={[1, 1, 2]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.3, 1]} />
              <Lightformer intensity={0.35} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
            </Environment>
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}

