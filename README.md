# Bézier Physics – Interactive Cubic Bézier Curve Simulator

## 📌 Overview

This project is an **interactive cubic Bézier curve simulation** built using **HTML, CSS, and Vanilla JavaScript**.

The curve behaves like a **springy rope** and responds smoothly to **mouse interaction**.  
All **Bézier math, tangent computation, and physics logic** are implemented **from scratch**, without using any external libraries.

---

## 🎯 Objective

The goal of this project is to demonstrate understanding of:

- Cubic Bézier curve mathematics
- Real-time interaction handling
- Basic spring–damping physics
- Tangent (derivative) visualization
- Canvas-based rendering at 60 FPS

---

## 📐 Cubic Bézier Curve

The curve is defined using **four control points**:

- **P₀** – Fixed start point  
- **P₁** – Dynamic control point  
- **P₂** – Dynamic control point  
- **P₃** – Fixed end point  

The curve is computed using the standard cubic Bézier equation:

