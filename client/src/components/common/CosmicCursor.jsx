import React, { useEffect, useRef } from 'react';

/**
 * CosmicCursor - Celestial Planet Cursor Edition
 * 
 * Thay thế con trỏ chuột bằng một HÀNH TINH VŨ TRỤ 3D (Cosmic Exoplanet with Saturn Rings):
 * - Quả cầu hành tinh 3D phát quang chân thực với ánh sao phản chiếu (spherical 3D shading)
 * - Vành đai hành tinh đa tầng (Saturn planetary rings) nghiêng 3D ôm quanh mặt trước & sau
 * - Vệ tinh / Mặt trăng nhỏ (Orbiting Moon) quay quanh hành tinh theo thời gian thực
 * - Khi di chuyển: Hành tinh rẽ sóng không gian, để lại vệt bụi sao Antigravity và vạch sắc màu
 * - Khi hover vào nút bấm / liên kết: Hành tinh nở lớn, vành đai và vầng hào quang rực sáng
 * - Khi click chuột: Vụ nổ siêu tân tinh (Supernova Burst) 360 độ từ tâm hành tinh
 * - Tâm hành tinh có điểm định vị siêu việt đảm bảo click chính xác từng pixel
 */
export const CosmicCursor = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Không kích hoạt trên màn hình cảm ứng điện thoại
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let animationFrameId;

    // Mouse coordinates (vị trí chuột tức thời)
    let mouse = { x: -200, y: -200, lastX: -200, lastY: -200, isVisible: false };
    let planetState = { x: -200, y: -200, radius: 9, targetRadius: 9, moonAngle: 0 };
    let isHoveringInteractive = false;
    let distanceAccumulator = 0;
    let colorStep = 0;

    // Google Antigravity signature chromatic spectrum for the stardust wake
    const antigravitySpectrum = [
      '#3b82f6', // Cobalt Blue
      '#00f2fe', // Cyan Starlight
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#ec4899', // Pink Magenta
      '#f43f5e', // Coral Rose
      '#f97316', // Solar Orange
      '#fbbf24', // Amber
      '#fde047', // Sunburst Gold
      '#10b981'  // Emerald Mint
    ];

    // Particle pool for the planet's gravitational wake - Tối ưu 65 hạt để giữ 60 FPS tuyệt đối
    const particles = [];
    const MAX_PARTICLES = 65;

    // Shockwaves pool for clicks
    const shockwaves = [];

    // Helper: Draw 3D Celestial Planet with Saturn Rings
    const drawPlanetCursor = (ctx, x, y, radius, isHovering, moonAngle) => {
      ctx.save();
      ctx.translate(x, y);

      const ringTilt = -0.4; // Độ nghiêng vành đai ~ -23 độ
      const ringRx = radius * 2.3;
      const ringRy = radius * 0.72;

      // 1. Nửa sau của Vành đai (Back half of Planetary Ring)
      ctx.save();
      ctx.rotate(ringTilt);
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRx, ringRy, 0, Math.PI, Math.PI * 2);
      ctx.strokeStyle = isHovering ? 'rgba(0, 242, 254, 0.9)' : 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Vành đai phụ ngoài
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRx * 1.3, ringRy * 1.3, 0, Math.PI, Math.PI * 2);
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.restore();

      // 2. Quả cầu Hành tinh 3D (Planet Sphere with 3D Radial Gradient)
      ctx.save();
      ctx.shadowColor = isHovering ? '#00f2fe' : '#38bdf8';
      ctx.shadowBlur = isHovering ? 14 : 8;

      // Đổ bóng 3D hình cầu
      const grad = ctx.createRadialGradient(
        -radius * 0.35, -radius * 0.35, radius * 0.08,
        0, 0, radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.22, '#00f2fe');
      grad.addColorStop(0.55, '#3b82f6');
      grad.addColorStop(0.82, '#1e1b4b');
      grad.addColorStop(1, '#050714');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Các dải khí quyển mỏng trên bề mặt hành tinh
      ctx.save();
      ctx.clip();
      ctx.rotate(ringTilt);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.5, -0.9, 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.85, -0.7, 0.7);
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      // 3. Nửa trước của Vành đai (Front half of Planetary Ring)
      ctx.save();
      ctx.rotate(ringTilt);
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRx, ringRy, 0, 0, Math.PI);
      ctx.strokeStyle = isHovering ? 'rgba(0, 242, 254, 0.95)' : 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Vành đai phụ ngoài nửa trước
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRx * 1.3, ringRy * 1.3, 0, 0, Math.PI);
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.restore();

      // 4. Mặt trăng / Vệ tinh nhỏ quay quanh hành tinh
      const moonDist = ringRx * 1.42;
      const moonX = Math.cos(moonAngle) * moonDist;
      const moonY = Math.sin(moonAngle) * (ringRy * 1.42);
      ctx.save();
      ctx.rotate(ringTilt);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 5. Điểm định vị cực sáng ở tâm hành tinh
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Helper: Draw elegant Antigravity wake capsule dash (Tối ưu 2-pass stroke không lag GPU)
    const drawAntigravityDash = (ctx, p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      ctx.strokeStyle = p.color;
      ctx.lineCap = 'round';
      const halfLen = p.length / 2;

      // Lớp phát quang aura nhẹ (nhẹ hơn 100x so với shadowBlur Gaussian)
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha * 0.3));
      ctx.lineWidth = p.width * 2.2;
      ctx.beginPath();
      ctx.moveTo(-halfLen, 0);
      ctx.lineTo(halfLen, 0);
      ctx.stroke();

      // Vạch lõi sắc nét
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.lineWidth = p.width;
      ctx.beginPath();
      ctx.moveTo(-halfLen, 0);
      ctx.lineTo(halfLen, 0);
      ctx.stroke();

      if (p.hasSparkle) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.6, p.width * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // Helper: Draw micro 4-point star glint (Tối ưu hiệu năng)
    const drawMicroStar = (ctx, p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;

      const sz = p.length * 0.6;
      const inner = sz * 0.22;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(a) * sz, Math.sin(a) * sz);
        ctx.lineTo(Math.cos(a + Math.PI / 4) * inner, Math.sin(a + Math.PI / 4) * inner);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Spawn Antigravity stardust in the planet's gravitational wake
    const spawnPlanetWake = (x, y, dx, dy) => {
      const moveAngle = Math.atan2(dy, dx);
      const moveSpeed = Math.hypot(dx, dy);

      // Tỏa ra hai cánh dải sóng khi hành tinh di chuyển
      const wingSides = [-1, 1];

      wingSides.forEach((side) => {
        if (particles.length >= MAX_PARTICLES) {
          particles.shift();
        }

        const spreadAngle = moveAngle + (side * (Math.PI / 2)) + ((Math.random() - 0.5) * 0.35);
        const pSpeed = Math.random() * 1.8 + 0.8 + (moveSpeed * 0.03);
        const color = antigravitySpectrum[colorStep % antigravitySpectrum.length];

        const length = Math.random() * 5 + 6;
        const isStar = Math.random() < 0.22;

        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(spreadAngle) * pSpeed,
          vy: Math.sin(spreadAngle) * pSpeed - (Math.random() * 0.2),
          angle: spreadAngle + (Math.PI / 2),
          length: length,
          width: 1.6,
          color: color,
          alpha: 0.85,
          decay: Math.random() * 0.02 + 0.015,
          glow: 8,
          isStar: isStar,
          hasSparkle: Math.random() < 0.35,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.06,
          life: 0
        });
      });

      colorStep++;
    };

    // Supernova burst when the planet is clicked
    const spawnSupernovaBurst = (x, y) => {
      shockwaves.push({
        x: x,
        y: y,
        radius: 6,
        maxRadius: 75,
        alpha: 0.9,
        color: '#00f2fe'
      });

      const burstCount = 24;
      for (let i = 0; i < burstCount; i++) {
        if (particles.length >= MAX_PARTICLES) {
          particles.shift();
        }

        const angle = (i / burstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const pSpeed = Math.random() * 4.5 + 2.2;
        const color = antigravitySpectrum[i % antigravitySpectrum.length];

        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * pSpeed,
          vy: Math.sin(angle) * pSpeed,
          angle: angle,
          length: Math.random() * 8 + 5,
          width: 1.6,
          color: color,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02,
          glow: 10,
          isStar: Math.random() < 0.3,
          hasSparkle: true,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.1,
          life: 0
        });
      }
    };

    // Event listeners
    const handleMouseMove = (e) => {
      const newX = e.clientX;
      const newY = e.clientY;

      if (!mouse.isVisible) {
        planetState.x = newX;
        planetState.y = newY;
        mouse.isVisible = true;
      }

      const dx = newX - (mouse.lastX === -200 ? newX : mouse.lastX);
      const dy = newY - (mouse.lastY === -200 ? newY : mouse.lastY);
      const dist = Math.hypot(dx, dy);

      distanceAccumulator += dist;

      // Khi hành tinh di chuyển đạt quãng cách nhất định, sinh vệt bụi sao ngân hà
      if (distanceAccumulator >= 14) {
        spawnPlanetWake(newX, newY, dx, dy);
        distanceAccumulator = 0;
        mouse.lastX = newX;
        mouse.lastY = newY;
      }

      mouse.x = newX;
      mouse.y = newY;

      // Nhận diện hover vào phần tử tương tác
      const target = e.target;
      if (target) {
        const interactive = target.closest('button, a, input, select, textarea, [role="button"], .interactive-element');
        isHoveringInteractive = !!interactive;
      }
    };

    const handleMouseDown = (e) => {
      spawnSupernovaBurst(e.clientX, e.clientY);
    };

    const handleMouseLeave = () => {
      mouse.isVisible = false;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // 60 FPS Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // A. Sóng kích nổ shockwave
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 3.2;
        sw.alpha -= 0.04;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = sw.alpha;
        ctx.strokeStyle = sw.color;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 14;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // B. Vệt bụi sao Antigravity trong quỹ đạo hành tinh
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.93;
        p.vy *= 0.93;

        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        if (p.isStar) {
          drawMicroStar(ctx, p);
        } else {
          drawAntigravityDash(ctx, p);
        }
      }

      // C. Vẽ Hành Tinh Con Trỏ (Celestial Planet Cursor)
      if (mouse.isVisible && mouse.x > 0 && mouse.y > 0) {
        // Cập nhật vị trí hành tinh theo tọa độ chuột với độ mượt mà cao
        planetState.x += (mouse.x - planetState.x) * 0.45;
        planetState.y += (mouse.y - planetState.y) * 0.45;

        // Vệ tinh quay đều quanh hành tinh
        planetState.moonAngle += 0.045;

        // Phóng to nhẹ khi hover vào nút bấm / liên kết
        planetState.targetRadius = isHoveringInteractive ? 13 : 9;
        planetState.radius += (planetState.targetRadius - planetState.radius) * 0.22;

        // Vẽ hành tinh 3D kèm vành đai và vệ tinh
        drawPlanetCursor(
          ctx,
          planetState.x,
          planetState.y,
          planetState.radius,
          isHoveringInteractive,
          planetState.moonAngle
        );
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 999999,
        width: '100vw',
        height: '100vh'
      }}
    />
  );
};
