import { useState, useRef, useEffect } from "react";
import { 
  Rotate3d, ZoomIn, ZoomOut, RefreshCw, SunMedium, Moon, 
  Layers, Maximize2, Sparkles, Check, Info, Box, Bed, 
  Car, Utensils, Bath, Tv, Armchair, Compass, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProjectParams {
  name: string;
  length: number;
  width: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  parking: string;
  style: string;
  buildingType: string;
  height: number;
  location: string;
  budget: number;
}

interface FloorPlan3DProps {
  project: ProjectParams;
  initialMode?: "2d" | "3d-isometric" | "3d-interactive";
}

interface RoomInfo {
  id: string;
  name: string;
  category: "living" | "bed" | "kitchen" | "bath" | "parking" | "balcony";
  dim: string;
  areaSqFt: number;
  color: string;
  wallColor: string;
  floorPattern: string;
  description: string;
  features: string[];
}

export function FloorPlan3DViewer({ project, initialMode = "3d-interactive" }: FloorPlan3DProps) {
  const [viewMode, setViewMode] = useState<"2d" | "3d-isometric" | "3d-interactive">(initialMode);
  
  // Camera 3D Orbit States
  const [rotX, setRotX] = useState<number>(55); // Pitch (tilt down)
  const [rotZ, setRotZ] = useState<number>(-40); // Yaw (spin around)
  const [zoom, setZoom] = useState<number>(1);
  const [wallHeight, setWallHeight] = useState<"low" | "medium" | "full" | "glass">("low");
  const [selectedFloor, setSelectedFloor] = useState<"gf" | "ff" | "stacked">("gf");
  const [timeOfDay, setTimeOfDay] = useState<"day" | "warm" | "cyber">("day");
  const [activeRoomId, setActiveRoomId] = useState<string | null>("living");
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showFurniture, setShowFurniture] = useState<boolean>(true);

  // Drag interaction
  const isDragging = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (viewMode !== "3d-interactive") return;
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || viewMode !== "3d-interactive") return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    // deltaX rotates around Z axis (yaw), deltaY tilts X axis (pitch)
    setRotZ(z => (z + deltaX * 0.5) % 360);
    setRotX(x => Math.min(85, Math.max(15, x - deltaY * 0.4)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  // Preset Views
  const setPreset = (preset: "iso" | "top" | "front" | "corner") => {
    if (preset === "iso") { setRotX(58); setRotZ(-42); setZoom(1); }
    if (preset === "top") { setRotX(82); setRotZ(0); setZoom(1.05); }
    if (preset === "front") { setRotX(25); setRotZ(0); setZoom(1); }
    if (preset === "corner") { setRotX(45); setRotZ(45); setZoom(1); }
  };

  const resetView = () => {
    setRotX(55);
    setRotZ(-40);
    setZoom(1);
    setActiveRoomId(null);
  };

  // Wall height in px for 3D extrusion
  const wallHMap = {
    low: 28,     // 3ft cutaway to see furniture easily
    medium: 65,  // 6ft architectural cutaway
    full: 110,   // 10ft ceiling height
    glass: 40    // semi-transparent
  };
  const currentWallH = wallHMap[wallHeight];

  // Ground Floor Rooms Config
  const gfRooms: RoomInfo[] = [
    {
      id: "living",
      name: "Living & Foyer",
      category: "living",
      dim: "14 × 16 ft",
      areaSqFt: 224,
      color: "rgba(35, 65, 85, 0.4)",
      wallColor: "#38bdf8",
      floorPattern: "wood",
      description: "Spacious family gathering area with floor-to-ceiling glass fenestration, recessed LED cove lighting and entryway foyer.",
      features: ["L-Shaped Sectional", "Modern Coffee Table", "Media Console & TV", "Indoor Planter", "Recessed Downlights"]
    },
    {
      id: "kitchen",
      name: "Kitchen & Dining",
      category: "kitchen",
      dim: "10 × 12 ft",
      areaSqFt: 120,
      color: "rgba(45, 75, 60, 0.4)",
      wallColor: "#34d399",
      floorPattern: "tiles",
      description: "Open-concept modular kitchen with breakfast peninsula, quartz countertop, pantry cabinetry and dedicated 4-seater dining setup.",
      features: ["Modular Counter & Hob", "Breakfast Bar Stools", "Quartz Prep Island", "Dining Table (4-Seat)", "Ventilation Duct"]
    },
    {
      id: "bed1",
      name: "Master Suite",
      category: "bed",
      dim: "12 × 14 ft",
      areaSqFt: 168,
      color: "rgba(65, 45, 80, 0.4)",
      wallColor: "#c084fc",
      floorPattern: "wood-dark",
      description: "Private primary bedroom with king-sized platform bed, double side credenzas, floor-to-ceiling wardrobes and garden view window.",
      features: ["King Bed & Cushions", "Twin Nightstands & Lamps", "6-Door Wardrobe", "Dressing Mirror", "A/C Provision"]
    },
    {
      id: "bath1",
      name: "Ensuite Bathroom",
      category: "bath",
      dim: "6 × 8 ft",
      areaSqFt: 48,
      color: "rgba(40, 60, 75, 0.4)",
      wallColor: "#22d3ee",
      floorPattern: "granite",
      description: "Luxury wet-and-dry bath with frameless tempered glass shower partition, wall-hung commode and porcelain vanity basin.",
      features: ["Glass Shower Stall", "Porcelain Basin Vanity", "Wall-Hung Commode", "Concealed Geyser", "Anti-skid Flooring"]
    },
    {
      id: "parking",
      name: "Car Porch & Lawn",
      category: "parking",
      dim: "10 × 14 ft",
      areaSqFt: 140,
      color: "rgba(50, 50, 55, 0.4)",
      wallColor: "#94a3b8",
      floorPattern: "pavers",
      description: "Dedicated covered vehicular parking bay with heavy-duty interlocking pavers, pergola shade slats and side landscaped green strip.",
      features: ["Vehicular Driveway", "Overhead Pergola Beams", "EV Charging Point", "Lawn Border", "Paver Tiles"]
    }
  ];

  // First Floor Rooms Config
  const ffRooms: RoomInfo[] = [
    {
      id: "bed2",
      name: "Bedroom 02",
      category: "bed",
      dim: "14 × 12 ft",
      areaSqFt: 168,
      color: "rgba(65, 45, 80, 0.4)",
      wallColor: "#c084fc",
      floorPattern: "wood",
      description: "Generous secondary bedroom with queen bed, study desk corner, wardrobe and corner glazing.",
      features: ["Queen Bed", "Study Desk & Chair", "Full Wardrobe", "Attached Balcony Access"]
    },
    {
      id: "bed3",
      name: "Bedroom 03 / Studio",
      category: "bed",
      dim: "12 × 12 ft",
      areaSqFt: 144,
      color: "rgba(45, 60, 85, 0.4)",
      wallColor: "#818cf8",
      floorPattern: "wood",
      description: "Flexible room suitable as guest bedroom, home office, or creative design studio.",
      features: ["Double Bed / Daybed", "Workstation Desk", "Bookshelf Storage", "Large Window"]
    },
    {
      id: "lounge",
      name: "Family Lounge",
      category: "living",
      dim: "12 × 10 ft",
      areaSqFt: 120,
      color: "rgba(35, 65, 85, 0.4)",
      wallColor: "#38bdf8",
      floorPattern: "wood-dark",
      description: "Upper-level relaxation nook connecting bedrooms, with cozy seating and overlook to entryway.",
      features: ["Compact 2-Seater Sofa", "Reading Lamp", "Stairwell Balustrade"]
    },
    {
      id: "balcony",
      name: "Open Terrace Balcony",
      category: "balcony",
      dim: "10 × 12 ft",
      areaSqFt: 120,
      color: "rgba(40, 70, 55, 0.4)",
      wallColor: "#34d399",
      floorPattern: "pavers",
      description: "Front-facing sit-out balcony with glass railing, planter boxes, and views of the neighborhood.",
      features: ["Toughened Glass Railing", "Outdoor Bistro Chairs", "Planter Box Trellis"]
    }
  ];

  const currentRooms = selectedFloor === "ff" ? ffRooms : gfRooms;
  const activeRoom = (selectedFloor === "ff" ? ffRooms : gfRooms).find(r => r.id === activeRoomId) || gfRooms[0]!;

  // Dynamic Theme Colors
  const themeBg = {
    day: "linear-gradient(135deg, #09131f 0%, #0d1e2e 50%, #061019 100%)",
    warm: "linear-gradient(135deg, #1f150d 0%, #2a1b12 50%, #150d08 100%)",
    cyber: "linear-gradient(135deg, #030712 0%, #081026 50%, #020617 100%)"
  }[timeOfDay];

  const wallStroke = {
    day: "rgba(56, 189, 248, 0.75)",
    warm: "rgba(251, 146, 60, 0.8)",
    cyber: "rgba(45, 212, 191, 0.9)"
  }[timeOfDay];

  return (
    <div className="w-full space-y-4">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-md">
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
          <Button
            size="sm"
            variant={viewMode === "2d" ? "secondary" : "ghost"}
            onClick={() => setViewMode("2d")}
            className={`h-8 gap-1.5 text-xs font-semibold ${viewMode === "2d" ? "bg-accent text-primary" : "text-muted-foreground"}`}
          >
            <Layers size={14} /> 2D Blueprint
          </Button>
          <Button
            size="sm"
            variant={viewMode === "3d-isometric" ? "secondary" : "ghost"}
            onClick={() => { setViewMode("3d-isometric"); setRotX(58); setRotZ(-42); }}
            className={`h-8 gap-1.5 text-xs font-semibold ${viewMode === "3d-isometric" ? "bg-accent text-primary" : "text-muted-foreground"}`}
          >
            <Box size={14} /> 3D Isometric
          </Button>
          <Button
            size="sm"
            variant={viewMode === "3d-interactive" ? "secondary" : "ghost"}
            onClick={() => setViewMode("3d-interactive")}
            className={`h-8 gap-1.5 text-xs font-semibold ${viewMode === "3d-interactive" ? "bg-primary text-primary-foreground font-bold shadow-sm" : "text-muted-foreground"}`}
          >
            <Rotate3d size={14} /> 3D Orbit Studio
          </Button>
        </div>

        {/* Floor Selection if multi-floor */}
        {project.floors > 1 && (
          <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
            <span className="px-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Level:</span>
            <Button
              size="sm"
              variant={selectedFloor === "gf" ? "secondary" : "ghost"}
              onClick={() => setSelectedFloor("gf")}
              className={`h-7 px-2.5 text-xs ${selectedFloor === "gf" ? "bg-accent text-primary font-bold" : "text-muted-foreground"}`}
            >
              GF (Ground)
            </Button>
            <Button
              size="sm"
              variant={selectedFloor === "ff" ? "secondary" : "ghost"}
              onClick={() => setSelectedFloor("ff")}
              className={`h-7 px-2.5 text-xs ${selectedFloor === "ff" ? "bg-accent text-primary font-bold" : "text-muted-foreground"}`}
            >
              FF (1st Floor)
            </Button>
            <Button
              size="sm"
              variant={selectedFloor === "stacked" ? "secondary" : "ghost"}
              onClick={() => setSelectedFloor("stacked")}
              className={`h-7 px-2.5 text-xs ${selectedFloor === "stacked" ? "bg-accent text-primary font-bold" : "text-muted-foreground"}`}
            >
              Stacked (G+1)
            </Button>
          </div>
        )}

        {/* View Angle Presets (Only in 3D Mode) */}
        {viewMode !== "2d" && (
          <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
            <span className="hidden px-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase sm:inline">Camera:</span>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-xs" title="Isometric (45°)" onClick={() => setPreset("iso")}>
              <Box size={14} />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-xs" title="Top-Down 3D (82°)" onClick={() => setPreset("top")}>
              <Layers size={14} />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-xs" title="Front Elevation (25°)" onClick={() => setPreset("front")}>
              <Eye size={14} />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-xs" title="Reset Camera" onClick={resetView}>
              <RefreshCw size={14} />
            </Button>
          </div>
        )}

        {/* Lighting & Options */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
          <Button
            size="icon"
            variant="ghost"
            className={`h-7 w-7 ${timeOfDay === "day" ? "text-primary" : "text-muted-foreground"}`}
            title="Daylight Mode"
            onClick={() => setTimeOfDay("day")}
          >
            <SunMedium size={14} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={`h-7 w-7 ${timeOfDay === "warm" ? "text-amber-400" : "text-muted-foreground"}`}
            title="Warm Sunset Lighting"
            onClick={() => setTimeOfDay("warm")}
          >
            <Moon size={14} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={`h-7 w-7 ${timeOfDay === "cyber" ? "text-cyan-400" : "text-muted-foreground"}`}
            title="Cyber Technical Grid"
            onClick={() => setTimeOfDay("cyber")}
          >
            <Sparkles size={14} />
          </Button>
          <div className="h-4 w-px bg-border" />
          {/* Zoom buttons */}
          <Button size="icon" variant="ghost" className="h-7 w-7" title="Zoom Out" onClick={() => setZoom(z => Math.max(0.65, +(z - 0.1).toFixed(2)))}>
            <ZoomOut size={14} />
          </Button>
          <span className="w-8 text-center font-mono text-[10px] text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <Button size="icon" variant="ghost" className="h-7 w-7" title="Zoom In" onClick={() => setZoom(z => Math.min(1.6, +(z + 0.1).toFixed(2)))}>
            <ZoomIn size={14} />
          </Button>
        </div>
      </div>

      {/* Main 3D Viewport Stage */}
      <div 
        ref={containerRef}
        className="relative mx-auto min-h-[500px] w-full select-none overflow-hidden rounded-xl border border-border shadow-2xl transition-colors duration-500 sm:min-h-[580px] lg:min-h-[640px]"
        style={{ background: themeBg }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Subtle 3D Grid Flooring in background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(56, 189, 248, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.25) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        {/* Interactive HUD Overlay: Top Left Badges */}
        <div className="absolute left-4 top-4 z-20 flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/85 px-3 py-1.5 backdrop-blur-md">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="font-mono text-[11px] font-bold tracking-wider text-primary">
              {viewMode === "2d" ? "2D BLUEPRINT VIEW" : viewMode === "3d-isometric" ? "3D ISOMETRIC CUTAWAY" : "3D REALTIME ORBIT"}
            </span>
            <span className="text-[10px] text-muted-foreground">· {selectedFloor === "ff" ? "LEVEL 1" : "LEVEL 0"}</span>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border/40 bg-background/70 px-2.5 py-1 text-[10px] text-muted-foreground backdrop-blur-md">
            <Compass size={12} className="text-primary" />
            <span>Plot: {project.length} × {project.width} ft ({project.length * project.width} sq.ft)</span>
          </div>
        </div>

        {/* Top Right: Drag instruction badge in 3D Orbit */}
        {viewMode === "3d-interactive" && (
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-md border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md pointer-events-none">
            <Rotate3d size={14} className="text-primary animate-spin" style={{ animationDuration: "8s" }} />
            <span>Click & drag to rotate in 3D</span>
          </div>
        )}

        {/* 3D Perspective Stage Container */}
        <div 
          className="flex h-full min-h-[500px] w-full items-center justify-center p-4 sm:min-h-[580px] lg:min-h-[640px]"
          style={{ perspective: viewMode === "2d" ? "none" : "1400px" }}
        >
          {/* Transforming 3D Board */}
          <div
            className="relative transition-transform ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: viewMode === "2d" 
                ? `scale(${zoom})`
                : `scale(${zoom}) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`,
              transitionDuration: isDragging.current ? "0ms" : "350ms",
              width: "560px",
              height: "440px"
            }}
          >
            {/* Ground Shadow Layer in 3D */}
            {viewMode !== "2d" && (
              <div 
                className="absolute inset-0 rounded-2xl bg-black/60 blur-2xl"
                style={{
                  transform: "translateZ(-40px) scale(1.1)",
                }}
              />
            )}

            {/* Perimeter Plot Base Plate */}
            <div 
              className="absolute inset-0 rounded-xl border-2 transition-all duration-300"
              style={{
                borderColor: wallStroke,
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 30px rgba(56, 189, 248, 0.08)",
                transform: "translateZ(0px)"
              }}
            >
              {/* Plot Boundary Dimensions Annotations */}
              <div className="absolute -top-7 left-0 right-0 flex justify-between font-mono text-[10px] text-primary/80">
                <span>◀ FRONT SETBACK 5 FT</span>
                <span className="font-bold">WIDTH: {project.width} FT</span>
                <span>▶</span>
              </div>
              <div className="absolute -left-9 top-0 bottom-0 flex flex-col justify-between font-mono text-[10px] text-primary/80" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                <span>◀ LENGTH: {project.length} FT ▶</span>
              </div>
            </div>

            {/* If Stacked Mode (GF + FF stacked vertically in 3D) */}
            {selectedFloor === "stacked" && viewMode !== "2d" && (
              <div 
                className="absolute inset-0 transition-transform duration-500 pointer-events-none"
                style={{
                  transform: "translateZ(140px)",
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Upper Floor Slab */}
                <div 
                  className="absolute inset-0 rounded-xl border-2 border-primary/50 bg-slate-900/80 backdrop-blur-sm"
                  style={{
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                    transform: "translateZ(0px)"
                  }}
                >
                  <div className="absolute right-4 top-4 rounded bg-primary/20 px-2 py-1 font-mono text-[10px] text-primary font-bold">
                    LEVEL 1 / FIRST FLOOR SLAB (+10 FT)
                  </div>
                  {/* FF Rooms layout schematic in stacked view */}
                  <div className="grid h-full grid-cols-2 p-6 gap-3">
                    <div className="rounded border border-primary/40 bg-purple-950/40 p-3 flex flex-col justify-between">
                      <span className="text-xs font-bold text-purple-300">Bedroom 02 (14 × 12 ft)</span>
                      <Bed size={20} className="text-purple-400" />
                    </div>
                    <div className="rounded border border-primary/40 bg-indigo-950/40 p-3 flex flex-col justify-between">
                      <span className="text-xs font-bold text-indigo-300">Studio / Bed 03 (12 × 12 ft)</span>
                      <Tv size={20} className="text-indigo-400" />
                    </div>
                    <div className="rounded border border-primary/40 bg-sky-950/40 p-3 flex flex-col justify-between">
                      <span className="text-xs font-bold text-sky-300">Family Lounge (12 × 10 ft)</span>
                      <Armchair size={20} className="text-sky-400" />
                    </div>
                    <div className="rounded border border-primary/40 bg-emerald-950/40 p-3 flex flex-col justify-between">
                      <span className="text-xs font-bold text-emerald-300">Open Terrace Balcony</span>
                      <SunMedium size={20} className="text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Individual 3D Room Volumes & Floors (GF or FF) */}
            {selectedFloor !== "stacked" && (
              <div 
                className="absolute inset-0 p-4 transition-all duration-300"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* ROOM 1: Living & Foyer (Top-Left / Main) */}
                <div
                  onClick={() => setActiveRoomId("living")}
                  className={`absolute left-5 top-5 h-[210px] w-[290px] cursor-pointer rounded-lg border-2 transition-all duration-300 ${
                    activeRoomId === "living" ? "border-sky-400 ring-2 ring-sky-400/50 shadow-lg" : "border-slate-700/80 hover:border-sky-400/50"
                  }`}
                  style={{
                    backgroundColor: activeRoomId === "living" ? "rgba(56, 189, 248, 0.18)" : "rgba(30, 41, 59, 0.75)",
                    transformStyle: "preserve-3d",
                    transform: viewMode !== "2d" ? `translateZ(${activeRoomId === "living" ? 14 : 0}px)` : "none"
                  }}
                >
                  {/* 3D Extruded Walls */}
                  {viewMode !== "2d" && (
                    <div 
                      className="absolute inset-0 pointer-events-none rounded-lg"
                      style={{
                        boxShadow: `0 0 0 3px ${wallStroke}, 0 0 ${currentWallH}px rgba(56, 189, 248, 0.25)`,
                        transform: `translateZ(${currentWallH}px)`
                      }}
                    />
                  )}

                  {/* Floor Texture & Wood Planks Pattern */}
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none rounded-lg"
                    style={{
                      backgroundImage: "repeating-linear-gradient(0deg, #38bdf8 0, #38bdf8 1px, transparent 0, transparent 20px)"
                    }}
                  />

                  {/* 3D Furniture Models Inside Living Room */}
                  {showFurniture && (
                    <div className="absolute inset-0 p-3 pointer-events-none flex flex-col justify-between">
                      {/* Top Wall: TV Media Console */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 rounded bg-slate-800/90 px-2 py-1 border border-slate-600 shadow text-[9px] text-sky-300">
                          <Tv size={11} /> 65" 4K Smart TV Wall
                        </div>
                        <div className="size-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[8px] text-emerald-300">
                          🪴
                        </div>
                      </div>

                      {/* Center: L-Shaped Sectional Sofa & Coffee Table */}
                      <div className="my-auto flex items-center justify-center gap-2">
                        <div className="flex flex-col items-center">
                          <div className="h-14 w-24 rounded-md bg-slate-700/90 border border-slate-500 shadow-md flex items-center justify-center text-[10px] font-semibold text-slate-200">
                            <Armchair size={13} className="mr-1 text-sky-400" /> Sofa Suite
                          </div>
                          <div className="mt-1 h-5 w-16 rounded bg-amber-900/60 border border-amber-700 text-[8px] text-amber-200 flex items-center justify-center">
                            Coffee Table
                          </div>
                        </div>
                      </div>

                      {/* Bottom Entrance Swing Door */}
                      <div className="flex justify-between items-end text-[9px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-sky-300">
                          <span className="size-1.5 rounded-full bg-sky-400" /> MAIN ENTRANCE
                        </span>
                        <span>FOYER</span>
                      </div>
                    </div>
                  )}

                  {/* Room Label */}
                  {showLabels && (
                    <div className="absolute left-3 top-3 pointer-events-none rounded bg-slate-900/90 px-2 py-0.5 border border-slate-700 backdrop-blur-sm">
                      <div className="text-xs font-bold text-sky-300">Living Room</div>
                      <div className="font-mono text-[9px] text-slate-400">14 × 16 ft · 224 sq.ft</div>
                    </div>
                  )}
                </div>

                {/* ROOM 2: Master Bedroom (Top-Right) */}
                <div
                  onClick={() => setActiveRoomId("bed1")}
                  className={`absolute right-5 top-5 h-[175px] w-[215px] cursor-pointer rounded-lg border-2 transition-all duration-300 ${
                    activeRoomId === "bed1" ? "border-purple-400 ring-2 ring-purple-400/50 shadow-lg" : "border-slate-700/80 hover:border-purple-400/50"
                  }`}
                  style={{
                    backgroundColor: activeRoomId === "bed1" ? "rgba(192, 132, 252, 0.18)" : "rgba(30, 41, 59, 0.75)",
                    transformStyle: "preserve-3d",
                    transform: viewMode !== "2d" ? `translateZ(${activeRoomId === "bed1" ? 14 : 0}px)` : "none"
                  }}
                >
                  {/* Extruded Walls */}
                  {viewMode !== "2d" && (
                    <div 
                      className="absolute inset-0 pointer-events-none rounded-lg"
                      style={{
                        boxShadow: `0 0 0 3px ${wallStroke}, 0 0 ${currentWallH}px rgba(192, 132, 252, 0.25)`,
                        transform: `translateZ(${currentWallH}px)`
                      }}
                    />
                  )}

                  {/* Bed & Wardrobe 3D Furniture */}
                  {showFurniture && (
                    <div className="absolute inset-0 p-3 pointer-events-none flex flex-col justify-between">
                      {/* Top Wardrobe Closet */}
                      <div className="h-4 w-full rounded bg-slate-800 border border-slate-600 flex items-center justify-center font-mono text-[8px] text-purple-300">
                        SLIDING 4-DOOR WARDROBE
                      </div>

                      {/* King Bed with Headboard */}
                      <div className="flex justify-center items-center my-auto">
                        <div className="relative h-20 w-24 rounded-t-lg bg-indigo-950/90 border-2 border-purple-400/60 shadow-md flex flex-col items-center justify-center text-center">
                          {/* Pillows */}
                          <div className="absolute top-1 flex gap-1">
                            <span className="h-2.5 w-6 rounded bg-slate-200/80 shadow-xs" />
                            <span className="h-2.5 w-6 rounded bg-slate-200/80 shadow-xs" />
                          </div>
                          <Bed size={15} className="mt-2 text-purple-300" />
                          <span className="text-[9px] font-bold text-slate-200">King Bed</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-[8px] font-mono text-purple-300">
                        <span>NIGHTSTAND</span>
                        <span>DRESSER</span>
                      </div>
                    </div>
                  )}

                  {/* Room Label */}
                  {showLabels && (
                    <div className="absolute left-3 top-3 pointer-events-none rounded bg-slate-900/90 px-2 py-0.5 border border-slate-700 backdrop-blur-sm">
                      <div className="text-xs font-bold text-purple-300">Master Bedroom</div>
                      <div className="font-mono text-[9px] text-slate-400">12 × 14 ft · 168 sq.ft</div>
                    </div>
                  )}
                </div>

                {/* ROOM 3: Ensuite Bathroom (Middle-Right) */}
                <div
                  onClick={() => setActiveRoomId("bath1")}
                  className={`absolute right-5 top-[188px] h-[95px] w-[215px] cursor-pointer rounded-lg border-2 transition-all duration-300 ${
                    activeRoomId === "bath1" ? "border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg" : "border-slate-700/80 hover:border-cyan-400/50"
                  }`}
                  style={{
                    backgroundColor: activeRoomId === "bath1" ? "rgba(34, 211, 238, 0.2)" : "rgba(30, 41, 59, 0.75)",
                    transformStyle: "preserve-3d",
                    transform: viewMode !== "2d" ? `translateZ(${activeRoomId === "bath1" ? 14 : 0}px)` : "none"
                  }}
                >
                  {/* Extruded Walls */}
                  {viewMode !== "2d" && (
                    <div 
                      className="absolute inset-0 pointer-events-none rounded-lg"
                      style={{
                        boxShadow: `0 0 0 3px ${wallStroke}, 0 0 ${currentWallH}px rgba(34, 211, 238, 0.25)`,
                        transform: `translateZ(${currentWallH}px)`
                      }}
                    />
                  )}

                  {/* Bathroom fixtures */}
                  {showFurniture && (
                    <div className="absolute inset-0 p-2 pointer-events-none flex items-center justify-between">
                      {/* Glass Shower Cubicle */}
                      <div className="h-16 w-16 rounded border-2 border-cyan-400/60 bg-cyan-950/40 flex flex-col items-center justify-center text-[8px] text-cyan-300">
                        <Bath size={14} className="mb-0.5 text-cyan-400" />
                        <span>Shower</span>
                      </div>
                      {/* Vanity Counter */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-6 w-14 rounded bg-slate-800 border border-slate-600 text-[8px] text-slate-300 flex items-center justify-center">
                          Basin
                        </div>
                        <div className="h-5 w-8 rounded-full bg-slate-700 border border-slate-500 text-[7px] text-slate-300 flex items-center justify-center">
                          WC
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Room Label */}
                  {showLabels && (
                    <div className="absolute left-2 top-2 pointer-events-none rounded bg-slate-900/90 px-1.5 py-0.5 border border-slate-700 backdrop-blur-sm">
                      <div className="text-[10px] font-bold text-cyan-300">Bathroom</div>
                      <div className="font-mono text-[8px] text-slate-400">6 × 8 ft</div>
                    </div>
                  )}
                </div>

                {/* ROOM 4: Kitchen + Dining (Bottom-Left) */}
                <div
                  onClick={() => setActiveRoomId("kitchen")}
                  className={`absolute left-5 top-[223px] h-[195px] w-[290px] cursor-pointer rounded-lg border-2 transition-all duration-300 ${
                    activeRoomId === "kitchen" ? "border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg" : "border-slate-700/80 hover:border-emerald-400/50"
                  }`}
                  style={{
                    backgroundColor: activeRoomId === "kitchen" ? "rgba(52, 211, 153, 0.18)" : "rgba(30, 41, 59, 0.75)",
                    transformStyle: "preserve-3d",
                    transform: viewMode !== "2d" ? `translateZ(${activeRoomId === "kitchen" ? 14 : 0}px)` : "none"
                  }}
                >
                  {/* Extruded Walls */}
                  {viewMode !== "2d" && (
                    <div 
                      className="absolute inset-0 pointer-events-none rounded-lg"
                      style={{
                        boxShadow: `0 0 0 3px ${wallStroke}, 0 0 ${currentWallH}px rgba(52, 211, 153, 0.25)`,
                        transform: `translateZ(${currentWallH}px)`
                      }}
                    />
                  )}

                  {/* Kitchen Island & Dining Table 3D Furniture */}
                  {showFurniture && (
                    <div className="absolute inset-0 p-3 pointer-events-none flex flex-col justify-between">
                      {/* L-Shaped Kitchen Counter */}
                      <div className="flex justify-between items-start">
                        <div className="h-6 w-32 rounded bg-emerald-950/90 border border-emerald-600 flex items-center px-2 text-[8px] text-emerald-200">
                          🍳 Induction Hob & Sink
                        </div>
                        <div className="h-8 w-12 rounded bg-slate-800 border border-slate-600 flex items-center justify-center text-[7px] text-slate-300 font-mono">
                          FRIDGE
                        </div>
                      </div>

                      {/* 4-Seater Dining Table */}
                      <div className="my-auto flex items-center justify-center">
                        <div className="h-14 w-28 rounded-lg bg-amber-950/80 border-2 border-amber-600/70 shadow-md flex items-center justify-center gap-1.5 text-center">
                          <Utensils size={13} className="text-amber-400" />
                          <span className="text-[9px] font-bold text-amber-200">Dining Table</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-[8px] font-mono text-emerald-400">
                        <span>PREP ISLAND</span>
                        <span>PANTRY RACK</span>
                      </div>
                    </div>
                  )}

                  {/* Room Label */}
                  {showLabels && (
                    <div className="absolute left-3 top-3 pointer-events-none rounded bg-slate-900/90 px-2 py-0.5 border border-slate-700 backdrop-blur-sm">
                      <div className="text-xs font-bold text-emerald-300">Kitchen & Dining</div>
                      <div className="font-mono text-[9px] text-slate-400">10 × 12 ft · 120 sq.ft</div>
                    </div>
                  )}
                </div>

                {/* ROOM 5: Covered Car Parking Porch (Bottom-Right) */}
                <div
                  onClick={() => setActiveRoomId("parking")}
                  className={`absolute right-5 top-[290px] h-[128px] w-[215px] cursor-pointer rounded-lg border-2 transition-all duration-300 ${
                    activeRoomId === "parking" ? "border-amber-400 ring-2 ring-amber-400/50 shadow-lg" : "border-slate-700/80 hover:border-amber-400/50"
                  }`}
                  style={{
                    backgroundColor: activeRoomId === "parking" ? "rgba(251, 191, 36, 0.18)" : "rgba(30, 41, 59, 0.75)",
                    transformStyle: "preserve-3d",
                    transform: viewMode !== "2d" ? `translateZ(${activeRoomId === "parking" ? 14 : 0}px)` : "none"
                  }}
                >
                  {/* Paver Floor Texture */}
                  <div 
                    className="absolute inset-0 opacity-15 pointer-events-none rounded-lg"
                    style={{
                      backgroundImage: "radial-gradient(#fbbf24 1px, transparent 1px)",
                      backgroundSize: "12px 12px"
                    }}
                  />

                  {/* 3D Car Model in Driveway */}
                  {showFurniture && (
                    <div className="absolute inset-0 p-2.5 pointer-events-none flex flex-col justify-between">
                      <div className="flex justify-between text-[8px] font-mono text-amber-300">
                        <span>PERGOLA BEAMS</span>
                        <span>EV CHARGER</span>
                      </div>

                      {/* 3D Stylized Car Silhouette */}
                      <div className="my-auto flex items-center justify-center">
                        <div className="relative h-14 w-28 rounded-xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-500 shadow-xl flex items-center justify-center">
                          <Car size={18} className="mr-1.5 text-amber-400" />
                          <span className="text-[10px] font-bold text-slate-100">Sedan / SUV</span>
                          {/* Headlights */}
                          <span className="absolute -left-1 top-2 size-1.5 rounded-full bg-amber-300 shadow-sm shadow-amber-300" />
                          <span className="absolute -left-1 bottom-2 size-1.5 rounded-full bg-amber-300 shadow-sm shadow-amber-300" />
                        </div>
                      </div>

                      <div className="text-right text-[8px] font-mono text-slate-400">
                        1 CAR COVERED BAY
                      </div>
                    </div>
                  )}

                  {/* Room Label */}
                  {showLabels && (
                    <div className="absolute left-2 top-2 pointer-events-none rounded bg-slate-900/90 px-1.5 py-0.5 border border-slate-700 backdrop-blur-sm">
                      <div className="text-xs font-bold text-amber-300">Car Porch</div>
                      <div className="font-mono text-[9px] text-slate-400">10 × 14 ft</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Floating Control Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          {/* Wall Cutaway Height Selector */}
          {viewMode !== "2d" && (
            <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-background/90 p-1.5 backdrop-blur-md shadow-lg">
              <span className="px-2 text-[10px] font-bold text-muted-foreground uppercase">Walls:</span>
              <Button
                size="sm"
                variant={wallHeight === "low" ? "secondary" : "ghost"}
                onClick={() => setWallHeight("low")}
                className={`h-7 px-2 text-xs ${wallHeight === "low" ? "bg-accent text-primary font-bold" : "text-muted-foreground"}`}
              >
                Cutaway (3 ft)
              </Button>
              <Button
                size="sm"
                variant={wallHeight === "medium" ? "secondary" : "ghost"}
                onClick={() => setWallHeight("medium")}
                className={`h-7 px-2 text-xs ${wallHeight === "medium" ? "bg-accent text-primary font-bold" : "text-muted-foreground"}`}
              >
                Mid (6 ft)
              </Button>
              <Button
                size="sm"
                variant={wallHeight === "full" ? "secondary" : "ghost"}
                onClick={() => setWallHeight("full")}
                className={`h-7 px-2 text-xs ${wallHeight === "full" ? "bg-accent text-primary font-bold" : "text-muted-foreground"}`}
              >
                Full (10 ft)
              </Button>
            </div>
          )}

          {/* Toggle Furniture & Labels */}
          <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/90 p-1.5 backdrop-blur-md shadow-lg">
            <Button
              size="sm"
              variant={showFurniture ? "secondary" : "ghost"}
              onClick={() => setShowFurniture(f => !f)}
              className={`h-7 px-2 text-xs ${showFurniture ? "text-primary" : "text-muted-foreground"}`}
            >
              Furniture {showFurniture ? "ON" : "OFF"}
            </Button>
            <Button
              size="sm"
              variant={showLabels ? "secondary" : "ghost"}
              onClick={() => setShowLabels(l => !l)}
              className={`h-7 px-2 text-xs ${showLabels ? "text-primary" : "text-muted-foreground"}`}
            >
              Dimensions {showLabels ? "ON" : "OFF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Selected Room Details Card / Inspector HUD */}
      {activeRoom && (
        <div className="rounded-lg border border-border bg-card p-4 shadow-md transition-all duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded bg-accent text-primary">
                {activeRoom.category === "living" && <Armchair size={15} />}
                {activeRoom.category === "bed" && <Bed size={15} />}
                {activeRoom.category === "kitchen" && <Utensils size={15} />}
                {activeRoom.category === "bath" && <Bath size={15} />}
                {activeRoom.category === "parking" && <Car size={15} />}
              </span>
              <div>
                <h4 className="font-display text-sm font-bold">{activeRoom.name}</h4>
                <p className="font-mono text-xs text-muted-foreground">{activeRoom.dim} · {activeRoom.areaSqFt} sq.ft</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="rounded bg-accent/60 px-2 py-1 text-primary font-semibold">
                {Math.round((activeRoom.areaSqFt / (project.length * project.width)) * 100)}% of Plot Area
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {activeRoom.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {activeRoom.features.map(feat => (
              <span key={feat} className="flex items-center gap-1 rounded border border-border bg-background px-2 py-0.5 text-[11px] text-foreground">
                <Check size={11} className="text-primary" /> {feat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
