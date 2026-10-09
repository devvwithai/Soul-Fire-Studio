"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/** True-3D product viewer: the customer's design is composited onto a print
 *  canvas (front zone calibrated so the design faces the camera) and used as
 *  a live texture. Drag = 360°, Video mode = auto-spin + downloadable video. */

const SHAPE_CONF = {
  mug:      { kind: "mug",    cw: 2048, ch: 904,  base: "#f4f6f8" },
  bottle:   { kind: "bottle", cw: 2048, ch: 1100, base: "#14171c" },
  pad:      { kind: "pad",    cw: 1600, ch: 1080, base: "#0b0d10" },
  disc:     { kind: "disc",   cw: 1024, ch: 1024, base: "#f4f6f8" },
  cloth:    { kind: "cloth",  cw: 1200, ch: 1400, base: "#0b0d10" },
};

function drawFlame(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -50);
  ctx.bezierCurveTo(26, -18, 44, -2, 44, 22);
  ctx.bezierCurveTo(44, 44, 24, 58, 0, 58);
  ctx.bezierCurveTo(-24, 58, -44, 44, -44, 22);
  ctx.bezierCurveTo(-44, -2, -24, -18, 0, -50);
  ctx.fill();
  ctx.beginPath(); ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.moveTo(0, 6); ctx.bezierCurveTo(14, 20, 18, 28, 18, 38);
  ctx.bezierCurveTo(18, 48, 10, 54, 0, 54);
  ctx.bezierCurveTo(-10, 54, -18, 48, -18, 38);
  ctx.bezierCurveTo(-18, 28, -12, 18, 0, 6); ctx.fill();
  ctx.restore();
}

export default function Viewer3D({ shape = "mug", designSrc, text = "", productName = "product", printZone, basePhoto, autoSpin = false }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});
  const [fit, setFit] = useState(shape === "mug" || shape === "bottle" ? "center" : "wrap");
  const [scale, setScale] = useState(1);
  const [spin, setSpin] = useState(autoSpin);
  const [recording, setRecording] = useState(false);
  const [ready, setReady] = useState(false);
  const conf = SHAPE_CONF[shape] || SHAPE_CONF.mug;

  // ---- composite print canvas ----
  const buildTexture = async () => {
    const st = stateRef.current;
    if (!st.canvas) return;
    const token = (st.texToken = (st.texToken || 0) + 1);
    const { canvas } = st;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const load = (src) => new Promise((res) => {
      if (!src) return res(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => res(img);
      img.onerror = () => res(null);
      img.src = src;
    });
    const [design, photo] = await Promise.all([load(designSrc), conf.kind === "cloth" ? load(basePhoto) : null]);
    if (st.texToken !== token) return; // a newer design already replaced this paint

    if (conf.kind === "cloth" && photo) {
      // cover the tee photo, then print design into its print zone
      const s = Math.max(W / photo.width, H / photo.height);
      ctx.drawImage(photo, (W - photo.width * s) / 2, (H - photo.height * s) / 2, photo.width * s, photo.height * s);
      if (design && printZone) {
        const zx = (printZone.x / 100) * W, zy = (printZone.y / 100) * H;
        const zw = (printZone.w / 100) * W * scale, zh = (printZone.h / 100) * H * scale;
        const ds = Math.min(zw / design.width, zh / design.height);
        ctx.globalAlpha = 0.96;
        ctx.drawImage(design, zx + (printZone.w / 100 * W - design.width * ds) / 2, zy + (printZone.h / 100 * H - design.height * ds) / 2, design.width * ds, design.height * ds);
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.fillStyle = conf.base; ctx.fillRect(0, 0, W, H);
      if (design) {
        if (fit === "wrap" && conf.kind !== "disc") {
          const s = Math.max(W / design.width, H / design.height);
          ctx.drawImage(design, (W - design.width * s) / 2, (H - design.height * s) / 2, design.width * s, design.height * s);
        } else {
          // centred in the front zone (mug/bottle: x 27–73%; flat: whole face with margin)
          const zx = conf.kind === "pad" || conf.kind === "disc" ? W * 0.04 : W * 0.27;
          const zw = (conf.kind === "pad" || conf.kind === "disc" ? W * 0.92 : W * 0.46) * scale;
          const zy = conf.kind === "pad" || conf.kind === "disc" ? H * 0.04 : H * 0.16;
          const zh = (conf.kind === "pad" || conf.kind === "disc" ? H * 0.92 : H * 0.68) * scale;
          const ds = Math.min(zw / design.width, zh / design.height);
          ctx.drawImage(design, zx + (zw - design.width * ds) / 2, zy + (zh - design.height * ds) / 2, design.width * ds, design.height * ds);
        }
      } else {
        // placeholder studio art
        const g = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.55);
        g.addColorStop(0, "rgba(56,200,255,.20)"); g.addColorStop(1, "rgba(56,200,255,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        drawFlame(ctx, W / 2, H / 2 - 60, Math.min(W, H) / 300, "#12b5ff");
        ctx.fillStyle = conf.base === "#f4f6f8" ? "#33475e" : "#bfe6ff";
        ctx.font = `800 ${Math.round(H * 0.085)}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("YOUR DESIGN HERE", W / 2, H / 2 + H * 0.22);
        ctx.font = `500 ${Math.round(H * 0.042)}px Arial, sans-serif`;
        ctx.fillStyle = conf.base === "#f4f6f8" ? "#7186a0" : "#6f87a3";
        ctx.fillText("Upload a photo and watch it wrap in 3D", W / 2, H / 2 + H * 0.31);
      }
      if (text) {
        ctx.fillStyle = conf.base === "#f4f6f8" ? "#0b2239" : "#eaf6ff";
        ctx.font = `800 ${Math.round(H * 0.075)}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(text.slice(0, 28), W / 2, H * 0.9);
      }
    }
    if (st.texture) st.texture.needsUpdate = true;
  };

  // ---- scene ----
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const canvas = document.createElement("canvas");
    canvas.width = conf.cw; canvas.height = conf.ch;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    // Calibrated for cylinders only: front-zone centre (u=0.5) faces the camera.
    // Flat shapes (pad/disc/cloth) must NOT be offset or their design shifts half a turn.
    if (conf.kind === "mug" || conf.kind === "bottle") texture.offset.x = 0.5;
    texture.anisotropy = 8;
    stateRef.current = { canvas, texture };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:none;";

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 1.1, 6.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 3.6; controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI * 0.72;
    controls.autoRotateSpeed = 2.4;
    stateRef.current.controls = controls;
    stateRef.current.renderer = renderer;
    controls.saveState();

    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3.5, 6, 4); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.PointLight(0x38c8ff, 30, 30); rim.position.set(-5, 2.5, -4); scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xdfefff, 0x0a0f16, 0.55));

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(4.4, 48),
      new THREE.ShadowMaterial({ opacity: 0.32 })
    );
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
    scene.add(floor);

    const texMat = (extra = {}) => new THREE.MeshStandardMaterial({ map: texture, roughness: 0.32, metalness: 0.02, envMapIntensity: 0.75, ...extra });
    const group = new THREE.Group();
    const white = new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.28, envMapIntensity: 0.7 });
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x2a2f36, roughness: 0.45, metalness: 0.55 });

    if (conf.kind === "mug") {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.93, 2.1, 96, 1, true), texMat());
      body.castShadow = true; group.add(body);
      const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.93, 48), white);
      bottom.rotation.x = Math.PI / 2; bottom.position.y = -1.05; group.add(bottom);
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.93, 0.93, 2.1, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0x23272e, side: THREE.BackSide, roughness: 0.6 }));
      group.add(inner);
      const innerBottom = new THREE.Mesh(new THREE.CircleGeometry(0.93, 48), new THREE.MeshStandardMaterial({ color: 0x3a2a18, roughness: 0.9 }));
      innerBottom.rotation.x = -Math.PI / 2; innerBottom.position.y = -0.55; group.add(innerBottom);
      const rimT = new THREE.Mesh(new THREE.TorusGeometry(1, 0.045, 16, 96), white);
      rimT.rotation.x = Math.PI / 2; rimT.position.y = 1.05; group.add(rimT);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.1, 18, 48, Math.PI), white);
      handle.rotation.z = -Math.PI / 2; handle.position.x = 1.0; handle.castShadow = true; group.add(handle);
      group.position.y = 0.15; floor.position.y = -1.0;
    } else if (conf.kind === "bottle") {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.94, 2.0, 96, 1, true), texMat({ roughness: 0.42 }));
      body.castShadow = true; group.add(body);
      const bBase = new THREE.Mesh(new THREE.CircleGeometry(0.94, 48), new THREE.MeshStandardMaterial({ color: 0x14171c, roughness: 0.5 }));
      bBase.rotation.x = Math.PI / 2; bBase.position.y = -1.0; group.add(bBase);
      const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x14171c, roughness: 0.42, envMapIntensity: 0.6 });
      const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.8, 0.55, 64), shoulderMat);
      shoulder.position.y = 1.27; group.add(shoulder);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.5, 48), darkMetal);
      cap.position.y = 1.72; cap.castShadow = true; group.add(cap);
      group.position.y = -0.15; floor.position.y = -1.18;
    } else if (conf.kind === "pad") {
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x0c0e11, roughness: 0.92 });
      const boxGeo = new THREE.BoxGeometry(3.4, 0.09, 2.3);
      const box = new THREE.Mesh(boxGeo, baseMat); box.castShadow = true; group.add(box);
      const top = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.3), texMat({ roughness: 0.85 }));
      top.rotation.x = -Math.PI / 2; top.position.y = 0.048; group.add(top);
      group.rotation.x = 0.5; group.position.y = 0.1; floor.position.y = -1.15;
      controls.maxPolarAngle = Math.PI * 0.55;
    } else if (conf.kind === "disc") {
      const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.09, 72), new THREE.MeshStandardMaterial({ color: 0xd8dde3, roughness: 0.5 }));
      edge.rotation.x = 0; group.add(edge);
      const front = new THREE.Mesh(new THREE.CircleGeometry(0.97, 72), texMat({ roughness: 0.5 }));
      front.position.z = 0.048; group.add(front);
      const back = new THREE.Mesh(new THREE.CircleGeometry(0.97, 72), texMat({ roughness: 0.5 }));
      back.rotation.y = Math.PI; back.position.z = -0.048; group.add(back);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 14, 40), new THREE.MeshStandardMaterial({ color: 0xb9c2cc, metalness: 0.95, roughness: 0.25 }));
      ring.position.y = 1.28; group.add(ring);
      const link = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 12), darkMetal);
      link.position.y = 1.05; group.add(link);
      group.rotation.x = 0.15; floor.position.y = -1.35;
    } else if (conf.kind === "cloth") {
      const geo = new THREE.PlaneGeometry(2.7, 3.1, 42, 42);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        pos.setZ(i, Math.sin(x * 1.15) * 0.13 + Math.cos(y * 0.8) * 0.05);
      }
      geo.computeVertexNormals();
      const cloth = new THREE.Mesh(geo, texMat({ roughness: 0.9, side: THREE.DoubleSide }));
      cloth.castShadow = true; group.add(cloth);
      controls.minAzimuthAngle = -1.15; controls.maxAzimuthAngle = 1.15;
      floor.position.y = -1.8;
    }
    scene.add(group);
    stateRef.current.group = group;

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(mount);

    let raf;
    const tick = () => { controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(tick); };
    tick();
    buildTexture().then(() => setReady(true));

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      controls.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.map && m.map !== texture) m.map.dispose(); m.dispose(); });
      });
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
      texture.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape]);

  useEffect(() => { buildTexture(); }, [designSrc, text, fit, scale]);
  useEffect(() => { if (stateRef.current.controls) stateRef.current.controls.autoRotate = spin && !recording; }, [spin, recording]);

  const downloadVideo = async () => {
    const st = stateRef.current;
    if (!st.renderer || recording) return;
    const stream = st.renderer.domElement.captureStream(30);
    const mime = ["video/webm;codecs=vp9", "video/webm", "video/mp4"].find((m) => window.MediaRecorder?.isTypeSupported(m)) || "";
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 8_000_000 } : undefined);
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: mime || "video/webm" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-360.${mime.includes("mp4") ? "mp4" : "webm"}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      setRecording(false);
    };
    setRecording(true);
    const prev = st.controls.autoRotateSpeed;
    st.controls.autoRotate = true; st.controls.autoRotateSpeed = 10; // ≈ one full turn in ~6s
    rec.start();
    setTimeout(() => { rec.stop(); st.controls.autoRotateSpeed = prev; }, 6400);
  };

  return (
    <div className="viewer3d-wrap">
      <div ref={mountRef} className="viewer3d" />
      {!ready && <div className="viewer-loading">Building your 3D product…</div>}
      <div className="viewer-bar">
        {(conf.kind === "mug" || conf.kind === "bottle") && (
          <div className="seg">
            <button className={fit === "center" ? "on" : ""} onClick={() => setFit("center")}>Centred Logo</button>
            <button className={fit === "wrap" ? "on" : ""} onClick={() => setFit("wrap")}>Full Wrap</button>
          </div>
        )}
        {fit === "center" && (conf.kind === "mug" || conf.kind === "bottle") && (
          <label className="vscale">Size <input type="range" min="0.5" max="1.4" step="0.05" value={scale} onChange={(e) => setScale(+e.target.value)} /></label>
        )}
        <button className="vbtn" onClick={() => stateRef.current.controls?.reset()}>⟲ Front View</button>
        <button className={`vbtn ${spin ? "on" : ""}`} onClick={() => setSpin(!spin)}>{spin ? "⏸ Pause Spin" : "▶ Auto-Spin"}</button>
        <button className="vbtn rec" onClick={downloadVideo} disabled={recording}>{recording ? "● Recording…" : "⬇ 360° Video"}</button>
      </div>
      <p className="viewer-hint">🖱️ Drag to rotate 360° · Scroll to zoom · Your design is placed exactly as it will print</p>
    </div>
  );
}
