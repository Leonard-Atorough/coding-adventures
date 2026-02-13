# Architecture

## Table of Contents

- [1. Game Systems Overview](#1-game-systems-overview)
- [2. Domain Model](#2-domain-model)
- [3. Approach A — Pure Object-Oriented](#3-approach-a--pure-object-oriented)
- [4. Approach B — Entity-Component-System (ECS)](#4-approach-b--entity-component-system-ecs)
- [5. Side-by-Side Comparison](#5-side-by-side-comparison)
- [6. Hybrid Recommendation](#6-hybrid-recommendation)
- [7. Technology Stack](#7-technology-stack)

---

## 1. Game Systems Overview

The game decomposes into four major subsystems, each with distinct performance and extensibility requirements:

| Subsystem              | Hot Path? | Entity Count                         | Tick Rate           | Primary Concern                |
| ---------------------- | --------- | ------------------------------------ | ------------------- | ------------------------------ |
| **Ship Designer**      | No        | 1 (active design)                    | Event-driven        | Correctness, UX responsiveness |
| **Tactical Combat**    | **Yes**   | 10–200+ ships, 100–1000+ projectiles | 30–60 Hz            | Raw throughput, determinism    |
| **Strategic Campaign** | No        | 10–50 fleets                         | Turn-based / low Hz | State management, persistence  |
| **Multiplayer Sync**   | **Yes**   | Mirrors combat                       | Network tick        | Determinism, bandwidth         |

The **tactical combat** simulation is the performance-critical subsystem and the primary driver for architectural decisions. The ship designer and campaign layers are UI-heavy and I/O-bound — architecture matters less there.

### Core Simulation Loops

```
┌─────────────────────────────────────────────────┐
│                  GAME LOOP (60 Hz)              │
│                                                 │
│  1. Input Processing    (player commands)       │
│  2. AI Decision         (autonomous behaviour)  │
│  3. Movement / Physics  (position, heading)     │
│  4. Weapon Systems      (fire control, reload)  │
│  5. Projectile Sim      (flight, guidance)      │
│  6. Damage Resolution   (hit detection, armor)  │
│  7. Status Effects      (fire, flooding, etc.)  │
│  8. Detection / Sensors (radar, sonar)          │
│  9. Render              (sprite transforms)     │
│ 10. Network Sync        (state delta broadcast) │
└─────────────────────────────────────────────────┘
```

---

## 2. Domain Model

Before comparing architectures, here are the core domain concepts the game must represent:

### Ship Subsystems

- **Hull** — displacement, draft, beam, structural HP, armor belt
- **Propulsion** — engine config (CODAG, COGAG, etc.), power output, fuel capacity, current speed
- **Weapons** — gun mounts, missile launchers, torpedo tubes, CIWS — each with calibre, rate of fire, ammo, arc of fire
- **Sensors** — radar (surface/air), sonar, ESM, fire control directors
- **Damage Control** — crew, fire suppression, flooding pumps, repair rate
- **Electronics** — ECM/ECCM, communications, data links

### Combat Entities

- **Projectile** — position, velocity, type (shell/missile/torpedo), guidance mode, warhead
- **Formation** — group of ships, formation pattern, flagship
- **Environment** — sea state, weather, time of day (affects detection)

### Campaign Entities

- **Fleet** — collection of ships, home port, operational area
- **Nation/Faction** — budget, tech tree, doctrine
- **Mission** — objectives, theater, victory conditions

---

## 3. Approach A — Pure Object-Oriented

### 3.1 Class Hierarchy

```
                        Entity (abstract)
                       /       \
              CombatEntity    CampaignEntity
             /     |    \         |
          Ship  Projectile  Formation  Fleet
           |
     ┌─────┼─────────┬───────────┬──────────┐
     Hull  Propulsion WeaponMount SensorSuite DamageControl
                         |
                   ┌─────┼─────┐
                 GunMount MissileLauncher TorpedoTube
```

### 3.2 Core Classes (TypeScript)

```typescript
// ── Base ──────────────────────────────────────────────
abstract class Entity {
  readonly id: string;
  abstract update(dt: number): void;
  abstract destroy(): void;
}

abstract class CombatEntity extends Entity {
  position: Vec2;
  heading: number; // radians
  velocity: Vec2;
  isAlive: boolean;

  abstract takeDamage(amount: number, type: DamageType): void;
}

// ── Ship ──────────────────────────────────────────────
class Ship extends CombatEntity {
  hull: Hull;
  propulsion: PropulsionSystem;
  weapons: WeaponMount[];
  sensors: SensorSuite;
  damageControl: DamageControlSystem;
  crew: CrewComplement;
  faction: FactionId;

  // AI / orders
  currentOrder: Order | null;
  autonomyLevel: AutonomyLevel;

  update(dt: number): void {
    this.propulsion.update(dt);
    this.updateMovement(dt);
    this.sensors.scan(dt, this.position);
    this.weapons.forEach((w) => w.update(dt, this));
    this.damageControl.update(dt);
    this.executeOrders(dt);
  }

  takeDamage(amount: number, type: DamageType): void {
    const penetrating = this.hull.applyArmor(amount, type);
    this.hull.hp -= penetrating;
    this.damageControl.onDamage(penetrating, type);
    if (this.hull.hp <= 0) this.sink();
  }

  private executeOrders(dt: number): void {
    /* AI + player command execution */
  }
  private sink(): void {
    this.isAlive = false;
  }
}

// ── Subsystems ────────────────────────────────────────
class PropulsionSystem {
  config: PropulsionConfig; // reuse existing POC configs
  currentPower: number; // 0.0 – 1.0 throttle
  fuelRemaining: number; // tonnes
  damaged: boolean;

  update(dt: number): void {
    this.consumeFuel(dt);
    if (this.damaged) this.currentPower = Math.min(this.currentPower, 0.5);
  }

  getMaxSpeed(displacement: number): number {
    return calculateSpeedFromPower(this.config, this.currentPower, displacement);
  }
}

abstract class WeaponMount {
  calibre: number;
  rateOfFire: number; // rounds per minute
  ammoRemaining: number;
  reloadTimer: number;
  arcOfFire: { min: number; max: number }; // degrees relative to bow
  damaged: boolean;

  abstract canEngage(target: CombatEntity, owner: Ship): boolean;
  abstract fire(target: CombatEntity, owner: Ship): Projectile | null;

  update(dt: number, owner: Ship): void {
    if (this.reloadTimer > 0) this.reloadTimer -= dt;
  }
}

class GunMount extends WeaponMount {
  shellType: ShellType;
  maxRange: number;

  canEngage(target: CombatEntity, owner: Ship): boolean {
    const range = Vec2.distance(owner.position, target.position);
    const bearing = Vec2.bearing(owner.position, target.position) - owner.heading;
    return (
      range <= this.maxRange &&
      bearing >= this.arcOfFire.min &&
      bearing <= this.arcOfFire.max &&
      !this.damaged &&
      this.reloadTimer <= 0
    );
  }

  fire(target: CombatEntity, owner: Ship): Projectile {
    this.ammoRemaining--;
    this.reloadTimer = 60 / this.rateOfFire;
    return new ShellProjectile(owner.position, target, this.calibre, this.shellType);
  }
}

class MissileLauncher extends WeaponMount {
  missileType: MissileType;
  guidanceMode: GuidanceMode;
  maxRange: number;

  fire(target: CombatEntity, owner: Ship): Projectile {
    this.ammoRemaining--;
    this.reloadTimer = 60 / this.rateOfFire;
    return new MissileProjectile(owner.position, target, this.missileType, this.guidanceMode);
  }
}

// ── Projectile hierarchy ──────────────────────────────
class Projectile extends CombatEntity {
  damage: number;
  speed: number;
  target: CombatEntity | null;
  owner: Ship;

  update(dt: number): void {
    this.updateFlight(dt);
    this.checkImpact();
  }
}

class ShellProjectile extends Projectile {
  // Ballistic arc: no guidance, gravity-affected
  updateFlight(dt: number): void {
    /* ballistic trajectory */
  }
}

class MissileProjectile extends Projectile {
  guidanceMode: GuidanceMode;
  fuelRemaining: number;

  // Guided: tracks target, can be jammed/decoyed
  updateFlight(dt: number): void {
    /* proportional navigation */
  }
}
```

### 3.3 Game Loop (OO)

```typescript
class TacticalSimulation {
  ships: Ship[] = [];
  projectiles: Projectile[] = [];
  formations: Formation[] = [];

  update(dt: number): void {
    // 1. Process player input → modify ship orders
    this.processInput();

    // 2. Update all entities
    for (const ship of this.ships) ship.update(dt);
    for (const proj of this.projectiles) proj.update(dt);

    // 3. Collision detection (projectile → ship)
    this.resolveCollisions();

    // 4. Remove dead entities
    this.ships = this.ships.filter((s) => s.isAlive);
    this.projectiles = this.projectiles.filter((p) => p.isAlive);

    // 5. Render
    this.renderer.draw(this.ships, this.projectiles);
  }
}
```

### 3.4 OO Strengths & Weaknesses

|                                      |                                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Strengths**                        |                                                                                                                                                         |
| Intuitive domain mapping             | A `Ship` _has_ `Weapons`, a `GunMount` _is-a_ `WeaponMount` — mirrors reality                                                                           |
| Encapsulation                        | Each subsystem owns its state and logic; easy to reason about in isolation                                                                              |
| IDE support                          | Autocomplete, refactoring, go-to-definition all work naturally                                                                                          |
| Faster initial development           | Less boilerplate to get a working prototype                                                                                                             |
| **Weaknesses**                       |                                                                                                                                                         |
| Cache hostility                      | Each `ship.update()` jumps between `hull`, `propulsion`, `weapons[]`, `sensors` — scattered heap allocations, poor L1/L2 cache utilization              |
| Rigid hierarchy                      | Adding a "hybrid" entity (e.g., a submarine that surfaces and gains different sensors) requires either multiple inheritance or awkward adapter patterns |
| Cross-cutting concerns               | "Apply weather penalty to all engines and all sensors" requires touching every class                                                                    |
| Scaling pain                         | With 200 ships × 5 subsystems × 60 Hz, virtual dispatch overhead and pointer-chasing become measurable                                                  |
| Composition over inheritance tension | Weapon mounts, sensor types, and damage effects multiply combinatorially — deep hierarchies become brittle                                              |

### 3.5 OO Performance Profile

```
Per-frame cost (200 ships, 500 projectiles, 60 Hz):

  Ship.update()        → 200 × (propulsion + movement + sensors + weapons[] + DC)
                       → ~200 × 5 virtual calls + scattered memory access
                       → Est. 2-4ms per frame (pointer chasing, branch misprediction)

  Projectile.update()  → 500 × virtual dispatch (shell vs missile)
                       → Est. 0.5-1ms per frame

  Collision detection  → O(n×m) naive, O(n log n) spatial hash
                       → Est. 1-3ms per frame

  Total per frame:      ~4-8ms → fits in 16ms budget (60 Hz) but leaves little headroom
                        Scales poorly past ~500 total entities
```

---

## 4. Approach B — Entity-Component-System (ECS)

### 4.1 Core Concepts

```
┌──────────┐     ┌──────────────┐     ┌────────────┐
│  Entity   │────▶│  Components  │◀────│   System   │
│  (just    │     │  (pure data  │     │  (pure     │
│  an ID)   │     │   structs)   │     │   logic)   │
└──────────┘     └──────────────┘     └────────────┘
     u32          Position {x,y}       MovementSystem
                  Velocity {vx,vy}     WeaponSystem
                  Hull {hp, armor}     DamageSystem
                  Propulsion {...}     SensorSystem
                  ...                  ...
```

**Entity** = unique ID (number), nothing more.
**Component** = plain data, no methods. Stored in contiguous typed arrays.
**System** = stateless function that queries and mutates component data.

### 4.2 Component Definitions

```typescript
// ── Components are plain data structs ─────────────────
// Stored in contiguous typed arrays for cache efficiency

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  vx: number;
  vy: number;
}

interface Heading {
  angle: number; // radians
  turnRate: number; // radians/sec
}

interface HullComponent {
  maxHp: number;
  currentHp: number;
  armorBelt: number; // mm equivalent
  displacement: number; // tonnes
  structuralIntegrity: number; // 0.0–1.0
}

interface PropulsionComponent {
  configId: ConfigurationId; // references config data
  maxPower: number; // HP
  currentThrottle: number; // 0.0–1.0
  fuelCapacity: number; // tonnes
  fuelRemaining: number; // tonnes
  efficiency: number; // 0.0–1.0
  damaged: boolean;
}

interface WeaponSlot {
  type: "gun" | "missile" | "torpedo" | "ciws";
  calibre: number;
  rateOfFire: number;
  maxRange: number;
  ammoMax: number;
  ammoCurrent: number;
  reloadTimer: number;
  arcMin: number;
  arcMax: number;
  damaged: boolean;
}

interface WeaponsComponent {
  slots: WeaponSlot[]; // all mounts on this entity
}

interface SensorComponent {
  radarRange: number;
  sonarRange: number;
  esmRange: number;
  fireControlDirectors: number;
  radarCrossSection: number; // own detectability
}

interface DamageControlComponent {
  crewEfficiency: number; // 0.0–1.0
  repairRate: number; // HP/sec
  fires: number; // active fire count
  flooding: number; // 0.0–1.0 flood level
}

interface FactionTag {
  factionId: number;
}

interface OrderComponent {
  currentOrder: OrderType;
  targetEntity: EntityId | null;
  targetPosition: Position | null;
  autonomyLevel: AutonomyLevel;
}

// ── Projectile-specific components ────────────────────
interface ProjectileComponent {
  damage: number;
  ownerEntity: EntityId;
  targetEntity: EntityId | null;
  projectileType: "shell" | "missile" | "torpedo";
  timeToLive: number;
}

interface GuidanceComponent {
  mode: "unguided" | "radar" | "infrared" | "wire" | "inertial";
  trackingAccuracy: number;
  canBeJammed: boolean;
}

// ── Tags (marker components, zero data) ───────────────
interface ShipTag {}
interface ProjectileTag {}
interface SunkTag {} // marks entity for cleanup
interface DetectedTag {} // currently visible to enemy
```

### 4.3 Systems

```typescript
// ── World: the ECS container ──────────────────────────
class World {
  private nextId = 0;
  private components = new Map<string, Map<EntityId, any>>();

  createEntity(): EntityId {
    return this.nextId++;
  }
  addComponent<T>(entity: EntityId, name: string, data: T): void {
    /* ... */
  }
  getComponent<T>(entity: EntityId, name: string): T | undefined {
    /* ... */
  }
  query(...componentNames: string[]): EntityId[] {
    /* ... */
  }
  removeEntity(entity: EntityId): void {
    /* ... */
  }
}

// ── Movement System ───────────────────────────────────
function movementSystem(world: World, dt: number): void {
  // Operates on ALL entities with Position + Velocity + Heading
  // Ships AND projectiles move through the same system
  for (const entity of world.query("Position", "Velocity", "Heading")) {
    const pos = world.getComponent<Position>(entity, "Position")!;
    const vel = world.getComponent<Velocity>(entity, "Velocity")!;

    pos.x += vel.vx * dt;
    pos.y += vel.vy * dt;
  }
}

// ── Propulsion System ─────────────────────────────────
function propulsionSystem(world: World, dt: number): void {
  // Only entities with PropulsionComponent (ships, not projectiles)
  for (const entity of world.query("PropulsionComponent", "Velocity", "HullComponent")) {
    const prop = world.getComponent<PropulsionComponent>(entity, "PropulsionComponent")!;
    const vel = world.getComponent<Velocity>(entity, "Velocity")!;
    const hull = world.getComponent<HullComponent>(entity, "HullComponent")!;

    // Consume fuel
    const consumption = calculateFuelConsumption(prop, dt);
    prop.fuelRemaining = Math.max(0, prop.fuelRemaining - consumption);

    // No fuel → no power
    if (prop.fuelRemaining <= 0) prop.currentThrottle = 0;

    // Calculate speed from power and displacement
    const maxSpeed = calculateSpeedFromPower(prop, hull.displacement);
    const targetSpeed = maxSpeed * prop.currentThrottle;

    // Update velocity toward target speed (with acceleration curve)
    const currentSpeed = Math.sqrt(vel.vx ** 2 + vel.vy ** 2);
    const hdg = world.getComponent<Heading>(entity, "Heading")!;
    const newSpeed = lerp(currentSpeed, targetSpeed, dt * 0.5);
    vel.vx = Math.cos(hdg.angle) * newSpeed;
    vel.vy = Math.sin(hdg.angle) * newSpeed;
  }
}

// ── Weapon System ─────────────────────────────────────
function weaponSystem(world: World, dt: number): void {
  for (const entity of world.query("WeaponsComponent", "Position", "Heading", "FactionTag")) {
    const weapons = world.getComponent<WeaponsComponent>(entity, "WeaponsComponent")!;
    const pos = world.getComponent<Position>(entity, "Position")!;
    const hdg = world.getComponent<Heading>(entity, "Heading")!;
    const faction = world.getComponent<FactionTag>(entity, "FactionTag")!;

    for (const slot of weapons.slots) {
      // Tick reload
      if (slot.reloadTimer > 0) {
        slot.reloadTimer -= dt;
        continue;
      }
      // Fire control logic: find target in range and arc
      const target = findBestTarget(world, entity, slot, pos, hdg, faction);
      if (target !== null) {
        fireWeapon(world, entity, target, slot, pos, hdg);
      }
    }
  }
}

// ── Damage System ─────────────────────────────────────
function damageSystem(world: World, dt: number): void {
  for (const entity of world.query("HullComponent", "DamageControlComponent")) {
    const hull = world.getComponent<HullComponent>(entity, "HullComponent")!;
    const dc = world.getComponent<DamageControlComponent>(entity, "DamageControlComponent")!;

    // Fight fires
    if (dc.fires > 0) {
      hull.currentHp -= dc.fires * 2 * dt; // fire damage over time
      dc.fires -= dc.crewEfficiency * dt; // crew suppresses fires
      dc.fires = Math.max(0, dc.fires);
    }

    // Counter flooding
    if (dc.flooding > 0) {
      hull.currentHp -= dc.flooding * 5 * dt;
      dc.flooding -= dc.crewEfficiency * 0.1 * dt;
      dc.flooding = Math.max(0, dc.flooding);
    }

    // Repair
    hull.currentHp = Math.min(hull.maxHp, hull.currentHp + dc.repairRate * dc.crewEfficiency * dt);

    // Sinking check
    if (hull.currentHp <= 0 || dc.flooding >= 1.0) {
      world.addComponent(entity, "SunkTag", {});
    }
  }
}

// ── Sensor / Detection System ─────────────────────────
function sensorSystem(world: World, dt: number): void {
  const ships = world.query("SensorComponent", "Position", "FactionTag");

  for (const observer of ships) {
    const sensor = world.getComponent<SensorComponent>(observer, "SensorComponent")!;
    const obsPos = world.getComponent<Position>(observer, "Position")!;
    const obsFaction = world.getComponent<FactionTag>(observer, "FactionTag")!;

    for (const target of ships) {
      if (target === observer) continue;
      const tgtFaction = world.getComponent<FactionTag>(target, "FactionTag")!;
      if (tgtFaction.factionId === obsFaction.factionId) continue;

      const tgtPos = world.getComponent<Position>(target, "Position")!;
      const tgtSensor = world.getComponent<SensorComponent>(target, "SensorComponent")!;
      const dist = distance(obsPos, tgtPos);

      // Detection based on radar range vs target's radar cross section
      const effectiveRange = sensor.radarRange * (tgtSensor.radarCrossSection / 100);
      if (dist <= effectiveRange) {
        world.addComponent(target, "DetectedTag", {});
      }
    }
  }
}

// ── Cleanup System ────────────────────────────────────
function cleanupSystem(world: World): void {
  for (const entity of world.query("SunkTag")) {
    world.removeEntity(entity);
  }
  for (const entity of world.query("ProjectileComponent")) {
    const proj = world.getComponent<ProjectileComponent>(entity, "ProjectileComponent")!;
    if (proj.timeToLive <= 0) world.removeEntity(entity);
  }
}
```

### 4.4 Game Loop (ECS)

```typescript
class TacticalSimulation {
  world = new World();

  // Systems execute in defined order — explicit, debuggable pipeline
  private systems: Array<(world: World, dt: number) => void> = [
    inputSystem, // player commands → OrderComponent mutations
    aiSystem, // autonomous behavior → OrderComponent mutations
    orderExecutionSystem, // orders → throttle / heading / weapon target changes
    propulsionSystem, // throttle + fuel → velocity
    movementSystem, // velocity → position (ships + projectiles)
    guidanceSystem, // missile tracking / course correction
    weaponSystem, // fire control + spawning projectiles
    collisionSystem, // projectile × ship hit detection
    damageSystem, // HP reduction, fires, flooding
    sensorSystem, // radar/sonar detection
    cleanupSystem, // remove dead entities
    renderSystem, // position + heading → draw sprites
    networkSyncSystem, // serialize changed components → broadcast
  ];

  update(dt: number): void {
    for (const system of this.systems) {
      system(this.world, dt);
    }
  }
}
```

### 4.5 ECS Strengths & Weaknesses

|                                   |                                                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Strengths**                     |                                                                                                       |
| Cache-friendly iteration          | Systems iterate contiguous arrays of the _same_ component type — excellent L1/L2 cache utilization    |
| Composition over inheritance      | A submarine is just an entity with `SubmergeComponent` added — no class hierarchy changes             |
| Cross-cutting systems are trivial | "Apply weather" = one system that queries `PropulsionComponent` + `SensorComponent` and tweaks values |
| Parallelizable                    | Systems with non-overlapping component writes can run concurrently (Web Workers)                      |
| Serialization is free             | Components are plain data → `JSON.stringify` / binary encode for networking and save/load             |
| Hot-reload & modding              | Systems are stateless functions; swap them at runtime for modding or debugging                        |
| **Weaknesses**                    |                                                                                                       |
| Conceptual overhead               | Developers must think in data transformations, not objects — steeper learning curve                   |
| Boilerplate                       | Component registration, query building, archetype management add upfront cost                         |
| Debugging indirection             | "Why did this ship stop?" requires tracing through multiple systems rather than reading one class     |
| No mature TypeScript ECS          | Must build or adopt a lightweight ECS framework (bitECS, miniplex, or custom)                         |
| Refactoring friction              | Renaming a component touches every system that queries it                                             |

### 4.6 ECS Performance Profile

```
Per-frame cost (200 ships, 500 projectiles, 60 Hz):

  movementSystem       → 700 entities, contiguous Position+Velocity arrays
                       → Est. 0.1-0.3ms (SIMD-friendly, no branching)

  propulsionSystem     → 200 entities, contiguous PropulsionComponent arrays
                       → Est. 0.05-0.1ms

  weaponSystem         → 200 entities × avg 3 slots = 600 weapon checks
                       → Est. 0.3-0.5ms (includes target queries)

  collisionSystem      → Spatial hash on contiguous Position arrays
                       → Est. 0.3-0.8ms

  sensorSystem         → 200 × 200 enemy checks
                       → Est. 0.2-0.5ms

  damageSystem         → ~50 entities with active damage
                       → Est. 0.05-0.1ms

  Total per frame:      ~1-2.5ms → well within 16ms budget
                        Scales linearly to ~2000 entities before pressure
```

---

## 5. Side-by-Side Comparison

### 5.1 Feature Matrix

| Criterion                        | OO   | ECS    | Notes                                                                      |
| -------------------------------- | ---- | ------ | -------------------------------------------------------------------------- |
| **Raw performance (combat sim)** | ★★☆  | ★★★    | ECS: 3-4× better cache utilization on hot path                             |
| **Entity count ceiling**         | ~500 | ~2000+ | Before 16ms frame budget exceeded                                          |
| **Adding new ship subsystem**    | ★★☆  | ★★★    | OO: new class + integrate into Ship. ECS: new component + new system       |
| **Adding new entity type**       | ★★☆  | ★★★    | OO: new class in hierarchy. ECS: new component combination                 |
| **Cross-cutting features**       | ★☆☆  | ★★★    | Weather, ECM, status effects — OO requires visitor/observer patterns       |
| **Network serialization**        | ★★☆  | ★★★    | ECS: components are already serializable data. OO: need custom serializers |
| **Save/Load**                    | ★★☆  | ★★★    | Same advantage as serialization                                            |
| **Deterministic replay**         | ★★☆  | ★★★    | ECS: systems are pure functions of component state → easier to reproduce   |
| **Developer onboarding**         | ★★★  | ★★☆    | OO is familiar to most TypeScript developers                               |
| **Debugging / stepping**         | ★★★  | ★★☆    | OO: inspect one object. ECS: must trace across systems                     |
| **IDE tooling**                  | ★★★  | ★★☆    | OO: full autocomplete. ECS: string-keyed queries are weaker                |
| **Ship designer UI**             | ★★★  | ★★☆    | Event-driven UI maps naturally to objects, not to system pipelines         |
| **Modding support**              | ★★☆  | ★★★    | ECS: add/remove systems and components at runtime trivially                |
| **Multiplayer (state sync)**     | ★★☆  | ★★★    | ECS: diff component arrays → minimal delta packets                         |
| **Prototype speed**              | ★★★  | ★☆☆    | OO wins for getting something playable quickly                             |

### 5.2 Concrete Scenario: "Add Submarines"

**OO approach:**

1. Create `Submarine extends Ship` — but submarines have completely different sensor profiles, can submerge/surface, have depth as a third dimension, and don't have the same weapon arcs. Do they also extend `CombatEntity`? Multiple inheritance issue.
2. Override `update()` to handle dive logic — but `sensors.scan()` inside `Ship.update()` doesn't know about depth. Must modify `SensorSuite` to accept depth parameter.
3. Torpedo weapons need ocean floor/surface interactions — `TorpedoTube extends WeaponMount` works, but the `Projectile.updateFlight()` now needs bathymetric data it wasn't designed for.
4. **Cascading changes**: 5+ classes modified, 2 new classes, sensor system needs depth awareness.

**ECS approach:**

1. Add `DepthComponent { currentDepth, maxDepth, diveRate }` and `SubmersibleTag`.
2. Add `divingSystem()` — queries `DepthComponent + PropulsionComponent`, adjusts depth.
3. Modify `sensorSystem()` — add depth check to detection range calculation (3 lines).
4. Existing `movementSystem`, `weaponSystem`, `damageSystem` all work unchanged.
5. **Isolated changes**: 1 new component, 1 new system, 3 lines modified in 1 existing system.

### 5.3 Concrete Scenario: "Weather Affects Combat"

**OO approach:**

- Weather must propagate to `PropulsionSystem.update()` (speed penalty), `SensorSuite.scan()` (range penalty), `WeaponMount.fire()` (accuracy penalty), and rendering.
- Options: global singleton (couples everything), Observer pattern (complex wiring), or pass weather context through every `update()` call (signature pollution).

**ECS approach:**

```typescript
// One new system, runs before others:
function weatherSystem(world: World, weather: WeatherState, dt: number): void {
  // Penalize engines
  for (const e of world.query("PropulsionComponent")) {
    const prop = world.getComponent<PropulsionComponent>(e, "PropulsionComponent")!;
    prop.efficiency *= weather.seaStatePenalty; // e.g., 0.85 in rough seas
  }
  // Penalize sensors
  for (const e of world.query("SensorComponent")) {
    const sensor = world.getComponent<SensorComponent>(e, "SensorComponent")!;
    sensor.radarRange *= weather.radarPenalty;
  }
}
```

- **Zero changes to existing systems.** Insert `weatherSystem` into the pipeline before `propulsionSystem`.

---

## 6. Hybrid Recommendation

Given the project's goals (performance, extensibility, multiplayer, modding), the recommended approach is a **hybrid architecture**:

```
┌──────────────────────────────────────────────────────────┐
│                    APPLICATION SHELL                      │
│               (React UI, routing, state)                 │
├──────────────────────┬───────────────────────────────────┤
│   SHIP DESIGNER      │       TACTICAL COMBAT ENGINE      │
│   ─────────────      │       ───────────────────────     │
│   Object-Oriented    │       Entity-Component-System     │
│   React + forms      │       Pure TypeScript ECS         │
│   Event-driven       │       Fixed-timestep game loop    │
│   Single ship focus  │       100s of entities @ 60 Hz   │
├──────────────────────┤       Deterministic simulation    │
│   CAMPAIGN LAYER     │                                   │
│   ─────────────      │       Renders to <canvas> via     │
│   State machine      │       PixiJS / raw Canvas2D      │
│   Turn-based logic   │                                   │
│   OO or simple data  ├───────────────────────────────────┤
│   stores are fine    │       NETWORK LAYER               │
│                      │       ─────────────               │
│                      │       Component delta sync        │
│                      │       Deterministic lockstep or   │
│                      │       server-authoritative        │
└──────────────────────┴───────────────────────────────────┘
```

### Why Hybrid?

| Layer               | Architecture         | Rationale                                                                                                                                                             |
| ------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ship Designer**   | OO / React state     | No performance pressure. Object model maps naturally to the UI form. Reuse existing POC calculator.                                                                   |
| **Tactical Combat** | ECS                  | Performance-critical. Must scale to hundreds of entities. Cross-cutting systems (weather, ECM, damage) are trivial. Serializable state enables networking and replay. |
| **Campaign**        | Simple data store    | Turn-based, small entity count. Plain objects + reducer pattern (like Redux) work fine.                                                                               |
| **Multiplayer**     | Component-based sync | ECS components are the natural serialization unit. Delta-compress changed components per tick.                                                                        |

### Bridge: Designer → Combat

The ship designer produces a `ShipBlueprint` — a serializable data object. When combat begins, a factory function converts blueprints into ECS entities:

```typescript
interface ShipBlueprint {
  name: string;
  hullType: HullType;
  displacement: number;
  propulsionConfig: ConfigurationId;
  weaponLoadout: WeaponSlotDefinition[];
  sensorSuite: SensorDefinition;
  armorScheme: ArmorDefinition;
  // ... all designer outputs
}

function spawnShipFromBlueprint(
  world: World,
  blueprint: ShipBlueprint,
  spawnPos: Position,
  faction: number,
): EntityId {
  const entity = world.createEntity();

  world.addComponent(entity, "ShipTag", {});
  world.addComponent(entity, "Position", spawnPos);
  world.addComponent(entity, "Velocity", { vx: 0, vy: 0 });
  world.addComponent(entity, "Heading", { angle: 0, turnRate: 0.02 });
  world.addComponent(entity, "FactionTag", { factionId: faction });

  world.addComponent(entity, "HullComponent", {
    maxHp: blueprint.displacement * 0.8,
    currentHp: blueprint.displacement * 0.8,
    armorBelt: blueprint.armorScheme.beltThickness,
    displacement: blueprint.displacement,
    structuralIntegrity: 1.0,
  });

  world.addComponent(entity, "PropulsionComponent", {
    configId: blueprint.propulsionConfig,
    maxPower: calculateMaxPower(blueprint),
    currentThrottle: 0,
    fuelCapacity: blueprint.displacement * 0.35,
    fuelRemaining: blueprint.displacement * 0.35,
    efficiency: 1.0,
    damaged: false,
  });

  world.addComponent(entity, "WeaponsComponent", {
    slots: blueprint.weaponLoadout.map((w) => ({
      ...w,
      ammoCurrent: w.ammoMax,
      reloadTimer: 0,
      damaged: false,
    })),
  });

  world.addComponent(entity, "SensorComponent", { ...blueprint.sensorSuite });
  world.addComponent(entity, "DamageControlComponent", {
    crewEfficiency: 0.8,
    repairRate: 1.0,
    fires: 0,
    flooding: 0,
  });
  world.addComponent(entity, "OrderComponent", {
    currentOrder: "hold",
    targetEntity: null,
    targetPosition: null,
    autonomyLevel: "defensive",
  });

  return entity;
}
```

### Suggested ECS Libraries for TypeScript

| Library      | Size     | Performance | TypeScript                | Notes                                                   |
| ------------ | -------- | ----------- | ------------------------- | ------------------------------------------------------- |
| **bitECS**   | ~5 KB    | Excellent   | Typed arrays, numeric IDs | Best raw perf; SoA storage. Sparse API.                 |
| **miniplex** | ~8 KB    | Good        | Full generics             | More ergonomic; React bindings available.               |
| **becsy**    | ~30 KB   | Excellent   | Full generics             | Multi-threaded (SharedArrayBuffer). Advanced.           |
| **Custom**   | Variable | Tunable     | Full control              | Start simple, optimize later. Recommended for learning. |

**Recommendation for MVP**: Start with a **custom lightweight ECS** (~200 lines) to understand the patterns, then migrate to **bitECS** or **miniplex** when performance profiling shows the need.

---

## 7. Technology Stack

| Layer                | Technology               | Rationale                                                                               |
| -------------------- | ------------------------ | --------------------------------------------------------------------------------------- |
| **Rendering**        | PixiJS 8 or Canvas2D     | Top-down 2D sprites. PixiJS gives batched WebGL rendering. Canvas2D is simpler for MVP. |
| **UI Framework**     | React (existing)         | Ship designer, campaign menus, HUD overlays. Already in use in POC.                     |
| **ECS**              | Custom → bitECS          | Start custom for comprehension, migrate for perf.                                       |
| **Physics**          | Custom (simple)          | Naval physics are domain-specific; generic engines add unnecessary overhead.            |
| **Networking**       | WebSocket + WebRTC       | WebSocket for lobby/matchmaking. WebRTC DataChannel for low-latency combat sync.        |
| **State Management** | Zustand or Redux Toolkit | Campaign/UI state. Combat state lives in ECS world.                                     |
| **Build**            | Vite (existing)          | Already configured in POC.                                                              |
| **Testing**          | Vitest (existing)        | Unit test systems in isolation. Deterministic ECS makes testing trivial.                |

### Project Module Structure

```
src/
├── designer/              # Ship designer (OO, React)
│   ├── components/        # React UI components
│   ├── calculator/        # Engine/hull/weapon calculators (existing POC)
│   └── types/             # ShipBlueprint, design types
│
├── combat/                # Tactical combat engine (ECS)
│   ├── ecs/               # Core ECS framework
│   │   ├── World.ts       # Entity manager, component storage
│   │   ├── Query.ts       # Component queries
│   │   └── types.ts       # EntityId, ComponentType
│   ├── components/        # All component definitions
│   │   ├── physics.ts     # Position, Velocity, Heading
│   │   ├── ship.ts        # Hull, Propulsion, DamageControl
│   │   ├── weapons.ts     # WeaponSlot, Projectile, Guidance
│   │   ├── sensors.ts     # Radar, Sonar, ESM
│   │   └── tags.ts        # ShipTag, SunkTag, DetectedTag
│   ├── systems/           # All systems (pure functions)
│   │   ├── movement.ts
│   │   ├── propulsion.ts
│   │   ├── weapons.ts
│   │   ├── collision.ts
│   │   ├── damage.ts
│   │   ├── sensors.ts
│   │   ├── ai.ts
│   │   ├── weather.ts
│   │   └── cleanup.ts
│   ├── simulation.ts      # Game loop, system pipeline
│   └── factory.ts         # Blueprint → ECS entity spawner
│
├── campaign/              # Strategic layer
│   ├── state/             # Campaign state machine
│   ├── fleet/             # Fleet management
│   └── types/
│
├── network/               # Multiplayer
│   ├── sync.ts            # Component delta serialization
│   ├── lobby.ts           # Matchmaking
│   └── protocol.ts        # Message types
│
├── rendering/             # PixiJS / Canvas2D bridge
│   ├── CombatRenderer.ts  # Reads ECS Position+Heading → draws sprites
│   ├── sprites/           # Ship sprite assets/generators
│   └── ui/                # HUD overlays
│
└── shared/                # Cross-cutting utilities
    ├── math.ts            # Vec2, distance, bearing, lerp
    ├── config.ts          # Game constants
    └── types.ts           # Shared type definitions
```
