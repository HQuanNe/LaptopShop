import React, { useEffect, useRef } from 'react';

/**
 * CosmicStarfield
 * Hệ thống bầu trời sao vũ trụ đa tầng kết hợp:
 * - Đa tầng sao lấp lánh (Twinkling Starfield) với màu sắc vũ trụ (White, Icy Cyan, Nebula Blue)
 * - Các ngôi sao sáng có tia sáng 4 cánh (Cross-glint stars)
 * - Mây tinh vân vũ trụ (Cosmic Nebulae) phát sáng chuyển động chậm
 * - Sao băng lướt ngang bầu trời (Shooting Stars / Meteors)
 * - Tương tác Parallax nhẹ theo chuyển động chuột
 */
export const CosmicStarfield = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse parallax tracking
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // 1. Khởi tạo danh sách các vì sao (Multi-tier Stars)
    const STAR_COUNT = Math.min(Math.floor((width * height) / 6000), 220);
    let stars = [];

    const starColors = [
      'rgba(255, 255, 255, ',     // Pure White Diamond
      'rgba(56, 189, 248, ',     // Icy Cyan
      'rgba(96, 165, 250, ',     // Celestial Blue
      'rgba(192, 132, 252, ',    // Nebula Purple
      'rgba(224, 242, 254, '     // Polar Starlight
    ];

    function initStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        const depth = Math.random(); // 0 (xa nhất) đến 1 (gần nhất)
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseRadius: depth > 0.85 ? Math.random() * 1.5 + 1.2 : Math.random() * 0.9 + 0.4,
          colorPrefix: starColors[Math.floor(Math.random() * starColors.length)],
          baseAlpha: Math.random() * 0.6 + 0.25,
          twinkleSpeed: Math.random() * 0.03 + 0.008,
          twinklePhase: Math.random() * Math.PI * 2,
          depth: depth * 0.6 + 0.2, // Hệ số dịch chuyển parallax
          hasGlint: depth > 0.92,   // Ngôi sao cực sáng có tia chéo 4 cánh
          driftX: (Math.random() - 0.5) * 0.08,
          driftY: (Math.random() - 0.5) * 0.06
        });
      }
    }

    initStars();

    // 2. Hệ thống Sao Băng (Shooting Stars / Meteors)
    let shootingStars = [];

    function spawnShootingStar() {
      // Xuất phát từ góc trên hoặc cạnh trái, quét chéo sang dưới phải
      const startX = Math.random() * (width * 0.8);
      const startY = Math.random() * (height * 0.4);
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.25; // ~45 độ
      const speed = Math.random() * 8 + 12;
      const length = Math.random() * 90 + 70;

      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: length,
        life: 0,
        maxLife: Math.random() * 35 + 30,
        width: Math.random() * 1.5 + 1.2,
        color: Math.random() > 0.5 ? '#38bdf8' : '#e0f2fe'
      });
    }

    let nextMeteorTimer = 120; // Frame đếm ngược kích hoạt sao băng

    // 3. Render Loop (60 FPS Canvas)
    let time = 0;

    const render = () => {
      time += 1;

      // Làm mượt chuyển động chuột (Lerp)
      mouseX += (targetMouseX - mouseX) * 0.03;
      mouseY += (targetMouseY - mouseY) * 0.03;
      const parallaxOffsetX = (mouseX - width / 2) * 0.025;
      const parallaxOffsetY = (mouseY - height / 2) * 0.025;

      // Xóa khung hình với nền trong suốt (nền tinh vân đã được GPU xử lý qua CSS)
      ctx.clearRect(0, 0, width, height);

      // --- A. Vẽ các vì sao lấp lánh (Twinkling Stars - Tối ưu hóa hiệu năng 60 FPS) ---
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Trôi nhẹ
        star.x += star.driftX;
        star.y += star.driftY;
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Vị trí có Parallax
        const renderX = star.x - parallaxOffsetX * star.depth;
        const renderY = star.y - parallaxOffsetY * star.depth;

        // Độ sáng nhấp nháy theo sin
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const currentAlpha = Math.max(0.1, Math.min(1, star.baseAlpha + twinkle * 0.35));
        const currentRadius = Math.max(0.3, star.baseRadius * (1 + twinkle * 0.2));

        // Vầng hào quang nhẹ không dùng createRadialGradient để đạt 60 FPS mượt mà
        if (star.baseRadius > 1.0) {
          ctx.fillStyle = `${star.colorPrefix}${currentAlpha * 0.25})`;
          ctx.beginPath();
          ctx.arc(renderX, renderY, currentRadius * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Tâm ngôi sao sáng
        ctx.fillStyle = `${star.colorPrefix}${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(renderX, renderY, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Vẽ tia sáng chéo 4 cánh cho các vì sao cực sáng (Cross-Glint)
        if (star.hasGlint && currentAlpha > 0.5) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.6})`;
          ctx.lineWidth = 0.6;
          const glintLen = currentRadius * 4.2;

          ctx.beginPath();
          // Tia dọc
          ctx.moveTo(renderX, renderY - glintLen);
          ctx.lineTo(renderX, renderY + glintLen);
          // Tia ngang
          ctx.moveTo(renderX - glintLen, renderY);
          ctx.lineTo(renderX + glintLen, renderY);
          ctx.stroke();
        }
      }

      // --- C. Xử lý & Vẽ Sao Băng (Shooting Stars) ---
      nextMeteorTimer--;
      if (nextMeteorTimer <= 0) {
        spawnShootingStar();
        // Thời gian ngẫu nhiên giữa các lần xuất hiện sao băng: 150 - 350 frames (~3 đến 6 giây)
        nextMeteorTimer = Math.floor(Math.random() * 220 + 130);
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const m = shootingStars[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life++;

        // Tính alpha tăng dần rồi mờ dần
        const progress = m.life / m.maxLife;
        const alpha = progress < 0.2 
          ? (progress / 0.2) 
          : (1 - (progress - 0.2) / 0.8);

        if (progress >= 1 || m.x > width + 100 || m.y > height + 100) {
          shootingStars.splice(i, 1);
          continue;
        }

        // Vẽ vệt đuôi sao băng (Luminous meteor tail)
        const tailX = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.length;
        const tailY = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.length;

        const meteorGrad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        meteorGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
        meteorGrad.addColorStop(0.2, m.color === '#38bdf8' ? `rgba(56, 189, 248, ${alpha * 0.8})` : `rgba(224, 242, 254, ${alpha * 0.8})`);
        meteorGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = m.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Đầu sao băng phát sáng chói
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.width * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        background: 'radial-gradient(ellipse at 25% 20%, rgba(14, 116, 144, 0.14) 0%, transparent 55%), radial-gradient(ellipse at 80% 65%, rgba(126, 34, 206, 0.1) 0%, transparent 55%), radial-gradient(ellipse at 50% 95%, rgba(30, 58, 138, 0.12) 0%, transparent 65%), #05060a'
      }}
      aria-hidden="true"
    />
  );
};
