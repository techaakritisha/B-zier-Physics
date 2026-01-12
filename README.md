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
B(t) = (1−t)³P₀ + 3(1−t)²tP₁ + 3(1−t)t²P₂ + t³P₃

- `t` ranges from `0` to `1`
- The curve is drawn by sampling multiple `t` values

---

## 🔬 Physics Model (Spring–Damping)

The dynamic control points (**P₁ and P₂**) move using a simple spring–damping model:
acceleration = -k × (position − target) − damping × velocity

This creates smooth, rope-like motion instead of instant snapping.

- **k** → spring stiffness
- **damping** → reduces oscillation

Both parameters can be adjusted in real time.

---

## 📊 Tangent Visualization

Tangent vectors are computed using the **derivative of the Bézier curve**:
B'(t) = 3(1−t)²(P₁−P₀) + 6(1−t)t(P₂−P₁) + 3t²(P₃−P₂)


- Tangents are normalized
- Short tangent lines are drawn at regular intervals
- This shows the direction of the curve at each point

---

## 🖱️ Interaction

- Drag **P₁ and P₂** using the mouse
- **P₀ and P₃** remain fixed
- The curve updates in real time
- Physics continues to run smoothly at ~60 FPS

---

## 🚫 Constraints Followed

- ❌ No Bézier libraries
- ❌ No physics or animation libraries
- ❌ No built-in curve APIs
- ✅ All math and physics implemented manually

---

## 🛠️ Tech Stack

- **HTML5**
- **CSS3**
- **JavaScript**

---

## ▶️ How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/techaakritisha/B-zier-Physics.git
