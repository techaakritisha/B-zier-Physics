// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.width * 0.6 * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const controlPoints = [
        { x: 100, y: 300, vx: 0, vy: 0, fixed: true },
        { x: 250, y: 100, vx: 0, vy: 0, fixed: false },
        { x: 450, y: 100, vx: 0, vy: 0, fixed: false },
        { x: 600, y: 300, vx: 0, vy: 0, fixed: true }
    ];

    const targets = [
        { x: 100, y: 300 },
        { x: 250, y: 100 },
        { x: 450, y: 100 },
        { x: 600, y: 300 }
    ];

    let springK = 0.15;
    let damping = 0.85;
    let curveResolution = 100;
    let tangentCount = 12;
    let animating = true;

    let draggedPoint = null;
    let mouseX = 0;
    let mouseY = 0;

    let fps = 60;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = 0;

    function cubicBezier(t, p0, p1, p2, p3) {
        const t2 = t * t;
        const t3 = t2 * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        
        return {
            x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
            y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
        };
    }

    function cubicBezierDerivative(t, p0, p1, p2, p3) {
        const mt = 1 - t;
        const mt2 = mt * mt;
        const t2 = t * t;
        
        return {
            x: 3 * mt2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x),
            y: 3 * mt2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y)
        };
    }

    function normalize(vec) {
        const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        if (len === 0) return { x: 0, y: 0 };
        return { x: vec.x / len, y: vec.y / len };
    }

    function updatePhysics(deltaTime) {
        for (let i = 0; i < controlPoints.length; i++) {
            if (controlPoints[i].fixed) continue;
            
            const point = controlPoints[i];
            const target = targets[i];
            
            const dx = point.x - target.x;
            const dy = point.y - target.y;
            
            const ax = -springK * dx - (1 - damping) * point.vx;
            const ay = -springK * dy - (1 - damping) * point.vy;
            
            point.vx += ax * deltaTime;
            point.vy += ay * deltaTime;
            
            point.x += point.vx * deltaTime;
            point.y += point.vy * deltaTime;
        }
    }

    function drawCurve() {
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#0f0f1e');
        gradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        
        drawGrid(w, h);
        drawControlPolygon();
        drawBezierCurve();
        drawTangentVectors();
        drawControlPoints();
    }

    function drawGrid(w, h) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < w; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        
        for (let y = 0; y < h; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    }

    function drawControlPolygon() {
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(controlPoints[0].x, controlPoints[0].y);
        for (let i = 1; i < controlPoints.length; i++) {
            ctx.lineTo(controlPoints[i].x, controlPoints[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawBezierCurve() {
        const curveGradient = ctx.createLinearGradient(
            controlPoints[0].x, controlPoints[0].y,
            controlPoints[3].x, controlPoints[3].y
        );
        curveGradient.addColorStop(0, '#ff006e');
        curveGradient.addColorStop(0.5, '#8338ec');
        curveGradient.addColorStop(1, '#3a86ff');
        
        ctx.strokeStyle = curveGradient;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(131, 56, 236, 0.5)';
        ctx.beginPath();
        
        for (let i = 0; i <= curveResolution; i++) {
            const t = i / curveResolution;
            const point = cubicBezier(t, ...controlPoints);
            
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    function drawTangentVectors() {
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 2;
        const tangentLength = 30;
        
        for (let i = 0; i <= tangentCount; i++) {
            const t = i / tangentCount;
            const point = cubicBezier(t, ...controlPoints);
            const tangent = cubicBezierDerivative(t, ...controlPoints);
            const normalized = normalize(tangent);
            
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(
                point.x + normalized.x * tangentLength,
                point.y + normalized.y * tangentLength
            );
            ctx.stroke();
            
            const arrowSize = 8;
            const angle = Math.atan2(normalized.y, normalized.x);
            const endX = point.x + normalized.x * tangentLength;
            const endY = point.y + normalized.y * tangentLength;
            
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - arrowSize * Math.cos(angle - Math.PI / 6),
                endY - arrowSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - arrowSize * Math.cos(angle + Math.PI / 6),
                endY - arrowSize * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
        }
    }

    function drawControlPoints() {
        controlPoints.forEach((point, i) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 14, 0, Math.PI * 2);
            ctx.fillStyle = point.fixed ? 'rgba(76, 201, 240, 0.3)' : 'rgba(255, 0, 110, 0.3)';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = point.fixed ? '#4cc9f0' : '#ff006e';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`P${i}`, point.x, point.y - 20);
        });
    }

    function animate() {
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
        lastTime = currentTime;
        
        frameCount++;
        fpsTime += deltaTime;
        if (fpsTime >= 1) {
            fps = Math.round(frameCount / fpsTime);
            document.getElementById('fps').textContent = fps;
            frameCount = 0;
            fpsTime = 0;
        }
        
        if (animating) {
            updatePhysics(deltaTime);
        }
        
        drawCurve();
        requestAnimationFrame(animate);
    }

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width) / window.devicePixelRatio,
            y: (e.clientY - rect.top) * (canvas.height / rect.height) / window.devicePixelRatio
        };
    }

    canvas.addEventListener('mousedown', (e) => {
        const pos = getMousePos(e);
        
        for (let i = 0; i < controlPoints.length; i++) {
            if (controlPoints[i].fixed) continue;
            
            const dx = pos.x - controlPoints[i].x;
            const dy = pos.y - controlPoints[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 15) {
                draggedPoint = i;
                canvas.style.cursor = 'grabbing';
                break;
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const pos = getMousePos(e);
        mouseX = pos.x;
        mouseY = pos.y;
        
        if (draggedPoint !== null) {
            targets[draggedPoint].x = pos.x;
            targets[draggedPoint].y = pos.y;
        } else {
            let hovering = false;
            for (let i = 0; i < controlPoints.length; i++) {
                if (controlPoints[i].fixed) continue;
                const dx = pos.x - controlPoints[i].x;
                const dy = pos.y - controlPoints[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 15) {
                    hovering = true;
                    break;
                }
            }
            canvas.style.cursor = hovering ? 'grab' : 'crosshair';
        }
    });

    canvas.addEventListener('mouseup', () => {
        draggedPoint = null;
        canvas.style.cursor = 'crosshair';
    });

    canvas.addEventListener('mouseleave', () => {
        draggedPoint = null;
        canvas.style.cursor = 'crosshair';
    });

    document.getElementById('stiffness').addEventListener('input', (e) => {
        springK = parseFloat(e.target.value);
        document.getElementById('stiffness-val').textContent = springK.toFixed(2);
    });

    document.getElementById('damping').addEventListener('input', (e) => {
        damping = parseFloat(e.target.value);
        document.getElementById('damping-val').textContent = damping.toFixed(2);
    });

    document.getElementById('tangents').addEventListener('input', (e) => {
        tangentCount = parseInt(e.target.value);
        document.getElementById('tangents-val').textContent = tangentCount;
        document.getElementById('tangent-count').textContent = tangentCount;
    });

    document.getElementById('resolution').addEventListener('input', (e) => {
        curveResolution = parseInt(e.target.value);
        document.getElementById('resolution-val').textContent = curveResolution;
        document.getElementById('points').textContent = curveResolution;
    });

    window.resetSimulation = function() {
        controlPoints[1] = { x: 250, y: 100, vx: 0, vy: 0, fixed: false };
        controlPoints[2] = { x: 450, y: 100, vx: 0, vy: 0, fixed: false };
        targets[1] = { x: 250, y: 100 };
        targets[2] = { x: 450, y: 100 };
    };

    window.toggleAnimation = function() {
        animating = !animating;
        document.getElementById('anim-text').textContent = animating ? 'Pause' : 'Resume';
    };

    animate();
});
