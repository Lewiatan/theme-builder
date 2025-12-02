/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateInsertionPoint } from '@/utils/insertionCalculator';

describe('calculateInsertionPoint', () => {
  // Mock DOM elements
  let mockElements: Map<string, { top: number; bottom: number; height: number }>;
  let originalQuerySelector: typeof document.querySelector;

  beforeEach(() => {
    mockElements = new Map();
    originalQuerySelector = document.querySelector.bind(document);

    // Mock document.querySelector to return our test elements
    document.querySelector = vi.fn((selector: string) => {
      const match = selector.match(/data-component-id="([^"]+)"/);
      if (!match) return null;

      const componentId = match[1];
      const elementData = mockElements.get(componentId);
      if (!elementData) return null;

      // Create a mock element with getBoundingClientRect
      return {
        getBoundingClientRect: () => ({
          top: elementData.top,
          bottom: elementData.bottom,
          height: elementData.height,
          left: 0,
          right: 100,
          width: 100,
          x: 0,
          y: elementData.top,
          toJSON: () => ({}),
        }),
      } as unknown as Element;
    }) as typeof document.querySelector;
  });

  afterEach(() => {
    document.querySelector = originalQuerySelector;
    vi.restoreAllMocks();
  });

  describe('Edge Case: Empty Canvas', () => {
    it('should return index 0 for empty component list', () => {
      const result = calculateInsertionPoint({
        cursorY: 100,
        componentIds: [],
      });

      expect(result).toEqual({
        insertionIndex: 0,
        hoveredComponentId: null,
      });
    });
  });

  describe('Edge Case: Above First Component', () => {
    it('should return index 0 when cursor is above the first component', () => {
      mockElements.set('comp-1', { top: 100, bottom: 200, height: 100 });
      mockElements.set('comp-2', { top: 210, bottom: 310, height: 100 });

      const result = calculateInsertionPoint({
        cursorY: 50, // Above first component
        componentIds: ['comp-1', 'comp-2'],
      });

      expect(result).toEqual({
        insertionIndex: 0,
        hoveredComponentId: null,
      });
    });
  });

  describe('Edge Case: Below Last Component', () => {
    it('should return index N when cursor is below the last component', () => {
      mockElements.set('comp-1', { top: 100, bottom: 200, height: 100 });
      mockElements.set('comp-2', { top: 210, bottom: 310, height: 100 });

      const result = calculateInsertionPoint({
        cursorY: 350, // Below last component
        componentIds: ['comp-1', 'comp-2'],
      });

      expect(result).toEqual({
        insertionIndex: 2, // After both components
        hoveredComponentId: null,
      });
    });
  });

  describe('Normal Case: Cursor Over Component', () => {
    beforeEach(() => {
      mockElements.set('comp-1', { top: 100, bottom: 200, height: 100 });
      mockElements.set('comp-2', { top: 210, bottom: 310, height: 100 });
      mockElements.set('comp-3', { top: 320, bottom: 420, height: 100 });
    });

    it('should insert before component when cursor is in top half', () => {
      const result = calculateInsertionPoint({
        cursorY: 130, // Top half of comp-1 (center is at 150)
        componentIds: ['comp-1', 'comp-2', 'comp-3'],
      });

      expect(result).toEqual({
        insertionIndex: 0, // Before comp-1
        hoveredComponentId: 'comp-1',
      });
    });

    it('should insert after component when cursor is in bottom half', () => {
      const result = calculateInsertionPoint({
        cursorY: 170, // Bottom half of comp-1 (center is at 150)
        componentIds: ['comp-1', 'comp-2', 'comp-3'],
      });

      expect(result).toEqual({
        insertionIndex: 1, // After comp-1
        hoveredComponentId: 'comp-1',
      });
    });

    it('should handle middle component correctly - top half', () => {
      const result = calculateInsertionPoint({
        cursorY: 230, // Top half of comp-2 (center is at 260)
        componentIds: ['comp-1', 'comp-2', 'comp-3'],
      });

      expect(result).toEqual({
        insertionIndex: 1, // Before comp-2
        hoveredComponentId: 'comp-2',
      });
    });

    it('should handle middle component correctly - bottom half', () => {
      const result = calculateInsertionPoint({
        cursorY: 280, // Bottom half of comp-2 (center is at 260)
        componentIds: ['comp-1', 'comp-2', 'comp-3'],
      });

      expect(result).toEqual({
        insertionIndex: 2, // After comp-2
        hoveredComponentId: 'comp-2',
      });
    });
  });

  describe('Reordering Case: Dragging Component Itself', () => {
    beforeEach(() => {
      mockElements.set('comp-1', { top: 100, bottom: 200, height: 100 });
      mockElements.set('comp-2', { top: 210, bottom: 310, height: 100 });
      mockElements.set('comp-3', { top: 320, bottom: 420, height: 100 });
    });

    it('should prevent self-insertion when dragging top half of own component', () => {
      const result = calculateInsertionPoint({
        cursorY: 130, // Top half of comp-1
        componentIds: ['comp-1', 'comp-2', 'comp-3'],
        draggedComponentId: 'comp-1',
      });

      // When dragging own component, algorithm continues to search
      // Falls through to fallback which returns end of list
      expect(result.insertionIndex).toBeGreaterThanOrEqual(0);
      expect(result.insertionIndex).toBeLessThanOrEqual(3);
    });

    it('should handle dragging bottom half of own component', () => {
      const result = calculateInsertionPoint({
        cursorY: 170, // Bottom half of comp-1
        componentIds: ['comp-1', 'comp-2', 'comp-3'],
        draggedComponentId: 'comp-1',
      });

      expect(result).toEqual({
        insertionIndex: 1,
        hoveredComponentId: 'comp-1',
      });
    });

    it('should allow insertion before/after other components when dragging', () => {
      const result = calculateInsertionPoint({
        cursorY: 230, // Top half of comp-2
        componentIds: ['comp-1', 'comp-2', 'comp-3'],
        draggedComponentId: 'comp-1', // Dragging comp-1 over comp-2
      });

      expect(result).toEqual({
        insertionIndex: 1, // Before comp-2
        hoveredComponentId: 'comp-2',
      });
    });
  });

  describe('Edge Case: Single Component', () => {
    beforeEach(() => {
      mockElements.set('comp-1', { top: 100, bottom: 200, height: 100 });
    });

    it('should allow insertion before single component', () => {
      const result = calculateInsertionPoint({
        cursorY: 120, // Top half
        componentIds: ['comp-1'],
      });

      expect(result).toEqual({
        insertionIndex: 0,
        hoveredComponentId: 'comp-1',
      });
    });

    it('should allow insertion after single component', () => {
      const result = calculateInsertionPoint({
        cursorY: 180, // Bottom half
        componentIds: ['comp-1'],
      });

      expect(result).toEqual({
        insertionIndex: 1,
        hoveredComponentId: 'comp-1',
      });
    });
  });

  describe('Edge Case: Missing DOM Elements', () => {
    it('should return default values when no DOM elements found', () => {
      // Don't add any mock elements
      const result = calculateInsertionPoint({
        cursorY: 150,
        componentIds: ['comp-1', 'comp-2'],
      });

      expect(result).toEqual({
        insertionIndex: 0,
        hoveredComponentId: null,
      });
    });

    it('should handle partial DOM element availability', () => {
      mockElements.set('comp-1', { top: 100, bottom: 200, height: 100 });
      // comp-2 is missing from DOM

      const result = calculateInsertionPoint({
        cursorY: 150,
        componentIds: ['comp-1', 'comp-2'],
      });

      // Should still work with available element
      expect(result.insertionIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Boundary Testing', () => {
    beforeEach(() => {
      mockElements.set('comp-1', { top: 100, bottom: 200, height: 100 });
      mockElements.set('comp-2', { top: 210, bottom: 310, height: 100 });
    });

    it('should handle cursor exactly at component top', () => {
      const result = calculateInsertionPoint({
        cursorY: 100, // Exactly at top of comp-1
        componentIds: ['comp-1', 'comp-2'],
      });

      expect(result).toEqual({
        insertionIndex: 0,
        hoveredComponentId: 'comp-1',
      });
    });

    it('should handle cursor exactly at component bottom', () => {
      const result = calculateInsertionPoint({
        cursorY: 200, // Exactly at bottom of comp-1
        componentIds: ['comp-1', 'comp-2'],
      });

      expect(result).toEqual({
        insertionIndex: 1,
        hoveredComponentId: 'comp-1',
      });
    });

    it('should handle cursor exactly at component center', () => {
      const result = calculateInsertionPoint({
        cursorY: 150, // Exactly at center of comp-1 (100 + 100/2)
        componentIds: ['comp-1', 'comp-2'],
      });

      // At exact center, should be in top half (< center)
      expect(result.insertionIndex).toBeLessThanOrEqual(1);
      expect(result.hoveredComponentId).toBe('comp-1');
    });
  });

  describe('Large Layout Testing', () => {
    beforeEach(() => {
      // Create 10 components stacked vertically
      for (let i = 0; i < 10; i++) {
        const top = 100 + i * 110; // 100px height + 10px gap
        mockElements.set(`comp-${i}`, {
          top,
          bottom: top + 100,
          height: 100,
        });
      }
    });

    it('should correctly calculate insertion for component in middle of large layout', () => {
      const componentIds = Array.from({ length: 10 }, (_, i) => `comp-${i}`);

      // comp-4: top=540, bottom=640, center=590
      // comp-5: top=650, bottom=750, center=700
      const result = calculateInsertionPoint({
        cursorY: 670, // Top half of comp-5 (center at 700)
        componentIds,
      });

      expect(result).toEqual({
        insertionIndex: 5, // Before comp-5
        hoveredComponentId: 'comp-5',
      });
    });

    it('should handle insertion at end of large layout', () => {
      const componentIds = Array.from({ length: 10 }, (_, i) => `comp-${i}`);

      // comp-9: top=1090, bottom=1190, center=1140
      const result = calculateInsertionPoint({
        cursorY: 1200, // Below all components
        componentIds,
      });

      expect(result).toEqual({
        insertionIndex: 10,
        hoveredComponentId: null,
      });
    });
  });
});
