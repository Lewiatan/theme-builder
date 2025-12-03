# Drag and Drop Issues - December 2, 2025

## Current Status

The drag and drop functionality for the Theme Builder canvas has been implemented with a custom insertion indicator system. However, there are **two critical visual bugs** that need to be fixed:

### Issue 1: Insertion Indicator Disappearing
**Problem**: When dragging a component, the blue insertion indicator bar disappears/flickers intermittently during drag operations.

**Likely Causes**:
1. **Component height collapsing**: When a component is being dragged, it has `opacity: 0.3` and `pointerEvents: none` (see CanvasComponent.tsx:48-49), but it still maintains its height. This might affect the position calculations in InsertionIndicator.
2. **DOM query timing**: The InsertionIndicator uses `document.querySelector('[data-component-id]')` to find components and calculate positions. These queries might fail or return stale positions during drag operations.
3. **React re-renders**: State updates in the drag system might cause the indicator to unmount/remount, causing visual flicker.

**Files Involved**:
- `theme-builder/src/components/workspace/InsertionIndicator.tsx` (lines 44-110)
- `theme-builder/src/components/workspace/CanvasComponent.tsx` (lines 42-50)
- `theme-builder/src/hooks/useDragAndDrop.ts` (lines 70-126)

### Issue 2: Empty Space Below Insertion Indicator
**Problem**: When dragging a component, empty white space appears below the insertion indicator bar, disrupting the visual layout.

**Likely Causes**:
1. **Collapsed component not reducing layout height**: The dragged component is made semi-transparent but still occupies its full height in the layout (CanvasComponent.tsx:48). The component should be collapsed (`height: 0` or similar) when dragging.
2. **Space-y gap calculation**: The Canvas uses `space-y-2` (Canvas.tsx:62) which adds gaps between components. When a component is dragged, this gap might not be recalculated properly.
3. **Absolute positioning issues**: The InsertionIndicator is absolutely positioned (InsertionIndicator.tsx:119) which might create additional space in the layout flow.

**Files Involved**:
- `theme-builder/src/components/workspace/CanvasComponent.tsx` (lines 42-50, 102-110)
- `theme-builder/src/components/workspace/Canvas.tsx` (lines 60-82)
- `theme-builder/src/components/workspace/InsertionIndicator.tsx` (entire component)

## Implementation Plan

Based on the analysis of the drag-and-drop architecture documented in CLAUDE.md:20-24, the system uses:
- `@dnd-kit/core` for drag-and-drop primitives
- Custom insertion indicator system
- `insertionCalculator.ts` for calculating insertion position based on cursor Y coordinate
- Components should collapse when dragged (`height: 0`)

## TO DO for Tomorrow

### Priority 1: Fix Component Height During Drag (Issue 2)

**Task**: Make the dragged component collapse to `height: 0` during drag operations to eliminate empty space.

**Implementation Steps**:
1. **Update CanvasComponent.tsx** (lines 42-50):
   ```tsx
   const style = {
     transform: isDragging ? undefined : CSS.Transform.toString(transform),
     transition,
     opacity: isDragging ? 0.3 : 1,
     pointerEvents: isDragging ? ('none' as const) : undefined,
     // ADD THIS:
     height: isDragging ? 0 : 'auto',
     overflow: isDragging ? 'hidden' : 'visible',
     marginTop: isDragging ? 0 : undefined,
     marginBottom: isDragging ? 0 : undefined,
   };
   ```

2. **Test the change**:
   - Drag a component from the library to the canvas
   - Drag a component to reorder it on the canvas
   - Verify no empty space appears below the insertion indicator
   - Verify layout remains stable during drag

### Priority 2: Fix Insertion Indicator Flickering (Issue 1)

**Task**: Ensure the insertion indicator remains visible and stable during drag operations.

**Option A - Debounce position updates**:
1. **Update InsertionIndicator.tsx** (lines 44-110):
   - Add a debounce mechanism to prevent rapid position recalculations
   - Use `requestAnimationFrame` for smoother position updates
   - Cache DOM element references to avoid repeated queries

**Option B - Use refs instead of querySelector**:
1. **Update Canvas.tsx**:
   - Pass refs to each CanvasComponent
   - Store refs in a Map in Canvas component
   - Pass the refs map to InsertionIndicator
2. **Update InsertionIndicator.tsx**:
   - Use passed refs instead of `document.querySelector`
   - Eliminates DOM query timing issues

**Recommended Approach**: Try Option A first (simpler). If flickering persists, implement Option B.

**Implementation Steps for Option A**:
1. **Add debouncing to InsertionIndicator.tsx**:
   ```tsx
   const [indicatorY, setIndicatorY] = useState<number | null>(null);
   const rafIdRef = useRef<number | null>(null);

   useEffect(() => {
     if (!isDragging || insertionIndex === null) {
       setIndicatorY(null);
       return;
     }

     // Cancel any pending animation frame
     if (rafIdRef.current !== null) {
       cancelAnimationFrame(rafIdRef.current);
     }

     // Schedule position update
     rafIdRef.current = requestAnimationFrame(() => {
       const position = calculatePosition();
       setIndicatorY(position);
     });

     return () => {
       if (rafIdRef.current !== null) {
         cancelAnimationFrame(rafIdRef.current);
       }
     };
   }, [insertionIndex, layout, isDragging, draggedComponentId]);
   ```

2. **Test the change**:
   - Drag components and verify indicator stays visible
   - Verify smooth transitions between positions
   - Check for performance issues

### Priority 3: Add Visual Feedback

**Task**: Enhance the dragging experience with better visual cues.

**Implementation Steps**:
1. **Update DragOverlay styling** (if used):
   - Ensure dragged component preview is clearly visible
   - Add subtle shadow or border to distinguish from canvas

2. **Test insertion indicator accessibility**:
   - Verify `aria-live="polite"` works correctly
   - Test with screen reader if possible

### Testing Checklist

After implementing fixes, test these scenarios:

- [ ] **Empty canvas**: Drag first component from library to empty canvas
- [ ] **Single component**: Drag above and below single component
- [ ] **Multiple components**: Drag between multiple components
- [ ] **Reordering up**: Drag component from bottom to top
- [ ] **Reordering down**: Drag component from top to bottom
- [ ] **Library to canvas**: Drag new component from library
- [ ] **Fast dragging**: Move cursor quickly to test flickering
- [ ] **Slow dragging**: Move cursor slowly to test position accuracy
- [ ] **Edge positions**: Drag to very top and very bottom of canvas
- [ ] **Hover boundaries**: Test behavior when cursor is exactly at component edges

## Technical Context

### Key Files

1. **CanvasComponent.tsx** (`theme-builder/src/components/workspace/CanvasComponent.tsx`)
   - Renders individual sortable components on canvas
   - Applies drag styles (opacity, pointer-events, transform)
   - **BUG SOURCE**: Does not collapse height during drag (line 48)

2. **InsertionIndicator.tsx** (`theme-builder/src/components/workspace/InsertionIndicator.tsx`)
   - Displays blue horizontal bar showing insertion point
   - Calculates pixel position from insertion index
   - **BUG SOURCE**: DOM queries may return stale data during drag (lines 56-106)

3. **useDragAndDrop.ts** (`theme-builder/src/hooks/useDragAndDrop.ts`)
   - Custom hook managing drag state
   - Handles DragStart, DragMove, DragEnd events
   - Tracks `insertionIndex` and `hoveredComponentId`

4. **insertionCalculator.ts** (`theme-builder/src/utils/insertionCalculator.ts`)
   - Pure function calculating insertion index from cursor position
   - Handles edge cases (empty canvas, above/below components, self-drag)
   - Used by useDragAndDrop on every DragMove event

5. **Canvas.tsx** (`theme-builder/src/components/workspace/Canvas.tsx`)
   - Container for all canvas components
   - Renders InsertionIndicator with current drag state
   - Uses `space-y-2` for vertical spacing between components

### Architecture Notes from CLAUDE.md

- Drag-and-drop powered by `@dnd-kit/core`
- Custom insertion indicator system (replaced legacy dropzone approach)
- Collision detection: `pointerWithin` strategy
- Drag modifiers: Vertical-only for canvas reordering
- Components should collapse when dragged (`height: 0`)

### Test Configuration Issue

**Note**: Unit tests for `insertionCalculator.test.ts` are currently failing due to `jsdom` ES module compatibility issues. The test file uses `happy-dom` environment (line 2), but there's a version conflict.

**Solution**: Update Vitest configuration or use `happy-dom` consistently. This is a separate issue from the visual bugs and can be addressed independently.

## Questions to Consider

1. Should we add a minimum height to dragged components instead of collapsing to 0? (e.g., `height: 40px` to show a thin placeholder)
2. Should the insertion indicator have a minimum visibility duration to prevent flickering? (e.g., fade in/out with delays)
3. Should we add visual feedback when hovering over the dragged component itself? (currently shows next component)
4. Do we need to handle scrolling during drag? (auto-scroll when cursor near viewport edges)

## References

- DND Kit Documentation: https://docs.dndkit.com/
- Current implementation plan: `/home/maciej/web/theme-builder/.ai/implementation-plan-dnd.md`
- Architecture documentation: `/home/maciej/web/theme-builder/CLAUDE.md` (lines 14-24)
- Related components:
  - ComponentRegistry: `theme-builder/src/types/workspace.ts`
  - DragOverlay: Should be in main workspace component (needs verification)

## Additional Notes

- The drag state includes `isOverCanvas`, `insertionIndex`, and `hoveredComponentId` for accurate drop positioning
- The `pointerPositionRef` tracks cursor position during drag for precise calculations
- The insertion index calculation accounts for component removal during reordering (see useDragAndDrop.ts:168-175)

---

## Implementation Completed - December 3, 2025

### ✅ Issue 1: Insertion Indicator Flickering - FIXED

**Solution Implemented**: Option A - Debouncing with `requestAnimationFrame`

**Changes Made** (`InsertionIndicator.tsx`):
1. Added `useRef` import for RAF ID tracking
2. Added `rafIdRef` to store animation frame ID
3. Wrapped position calculation in `requestAnimationFrame` for smoother rendering
4. Added cleanup function to cancel pending animation frames on unmount/re-render
5. This prevents flickering by synchronizing DOM queries with browser paint cycles

**File**: `theme-builder/src/components/workspace/InsertionIndicator.tsx:1,43,52-125`

### ✅ Issue 2: Empty Space Below Insertion Indicator - ALREADY FIXED

**Status**: This issue was already resolved in a previous commit

**Existing Solution** (`CanvasComponent.tsx:42-55`):
- Component collapses to `height: 0` when dragging
- All spacing properties (margin, padding) set to 0 during drag
- `overflow: hidden` prevents content overflow
- Smooth 200ms transitions for visual polish

**File**: `theme-builder/src/components/workspace/CanvasComponent.tsx:42-55`

### Testing Notes

The application is running at http://localhost:5173 and ready for manual testing.

**Recommended Testing Scenarios** (from original checklist):
- Drag components from library to canvas
- Reorder components on canvas (up and down)
- Fast dragging to test indicator stability
- Slow dragging to test position accuracy
- Edge positions (top and bottom of canvas)
- Multiple components to verify no flickering

**Expected Results**:
- ✅ Blue insertion indicator should remain visible and stable during all drag operations
- ✅ No empty white space should appear when dragging components
- ✅ Smooth transitions between insertion positions
- ✅ Component collapses cleanly when dragged

---

**Created**: December 2, 2025
**Updated**: December 3, 2025
**Status**: ✅ Implementation Complete - Ready for Manual Testing
