import { describe, it, expect } from 'vitest';
import {
  convertToNormalizedUnit,
  aggregateIngredients,
  formatQuantity,
} from './unitConverter';

describe('unitConverter', () => {
  describe('convertToNormalizedUnit', () => {
    it('should convert grams to grams', () => {
      const result = convertToNormalizedUnit(100, 'g');
      expect(result).toEqual({ quantity: 100, unit: 'g' });
    });

    it('should convert kilograms to grams', () => {
      const result = convertToNormalizedUnit(1.5, 'kg');
      expect(result).toEqual({ quantity: 1500, unit: 'g' });
    });

    it('should convert ounces to grams', () => {
      const result = convertToNormalizedUnit(4, 'oz');
      expect(result).toEqual({ quantity: 113.4, unit: 'g' });
    });

    it('should convert pounds to grams', () => {
      const result = convertToNormalizedUnit(2, 'lb');
      expect(result).toEqual({ quantity: 907.184, unit: 'g' });
    });

    it('should convert milliliters to milliliters', () => {
      const result = convertToNormalizedUnit(250, 'ml');
      expect(result).toEqual({ quantity: 250, unit: 'ml' });
    });

    it('should convert liters to milliliters', () => {
      const result = convertToNormalizedUnit(1.5, 'l');
      expect(result).toEqual({ quantity: 1500, unit: 'ml' });
    });

    it('should convert teaspoons to milliliters', () => {
      const result = convertToNormalizedUnit(2, 'tsp');
      expect(result).toEqual({ quantity: 10, unit: 'ml' });
    });

    it('should convert tablespoons to milliliters', () => {
      const result = convertToNormalizedUnit(3, 'tbsp');
      expect(result).toEqual({ quantity: 45, unit: 'ml' });
    });

    it('should convert cups to milliliters', () => {
      const result = convertToNormalizedUnit(2, 'cup');
      expect(result).toEqual({ quantity: 480, unit: 'ml' });
    });

    it('should convert fluid ounces to milliliters', () => {
      const result = convertToNormalizedUnit(8, 'fl oz');
      expect(result).toEqual({ quantity: 236.588, unit: 'ml' });
    });

    it('should handle pieces/count units', () => {
      const result = convertToNormalizedUnit(3, 'pcs');
      expect(result).toEqual({ quantity: 3, unit: 'pcs' });
    });

    it('should handle "pieces" as pcs', () => {
      const result = convertToNormalizedUnit(5, 'pieces');
      expect(result).toEqual({ quantity: 5, unit: 'pcs' });
    });

    it('should be case-insensitive', () => {
      const result = convertToNormalizedUnit(100, 'G');
      expect(result).toEqual({ quantity: 100, unit: 'g' });
    });

    it('should trim whitespace from units', () => {
      const result = convertToNormalizedUnit(100, ' ml ');
      expect(result).toEqual({ quantity: 100, unit: 'ml' });
    });

    it('should throw error for unknown units', () => {
      expect(() => convertToNormalizedUnit(100, 'unknown')).toThrow(
        'Unknown unit: unknown'
      );
    });
  });

  describe('aggregateIngredients', () => {
    it('should aggregate single ingredient', () => {
      const ingredients = [{ ingredientId: 'ing1', quantity: 100, unit: 'g' }];
      const result = aggregateIngredients(ingredients);

      expect(result.size).toBe(1);
      expect(result.get('ing1')).toEqual({ quantity: 100, unit: 'g' });
    });

    it('should aggregate multiple instances of same ingredient', () => {
      const ingredients = [
        { ingredientId: 'ing1', quantity: 100, unit: 'g' },
        { ingredientId: 'ing1', quantity: 50, unit: 'g' },
        { ingredientId: 'ing1', quantity: 25, unit: 'g' },
      ];
      const result = aggregateIngredients(ingredients);

      expect(result.size).toBe(1);
      expect(result.get('ing1')).toEqual({ quantity: 175, unit: 'g' });
    });

    it('should aggregate different ingredients separately', () => {
      const ingredients = [
        { ingredientId: 'ing1', quantity: 100, unit: 'g' },
        { ingredientId: 'ing2', quantity: 200, unit: 'ml' },
        { ingredientId: 'ing3', quantity: 2, unit: 'pcs' },
      ];
      const result = aggregateIngredients(ingredients);

      expect(result.size).toBe(3);
      expect(result.get('ing1')).toEqual({ quantity: 100, unit: 'g' });
      expect(result.get('ing2')).toEqual({ quantity: 200, unit: 'ml' });
      expect(result.get('ing3')).toEqual({ quantity: 2, unit: 'pcs' });
    });

    it('should convert units before aggregating', () => {
      const ingredients = [
        { ingredientId: 'ing1', quantity: 1, unit: 'kg' },
        { ingredientId: 'ing1', quantity: 500, unit: 'g' },
      ];
      const result = aggregateIngredients(ingredients);

      expect(result.size).toBe(1);
      expect(result.get('ing1')).toEqual({ quantity: 1500, unit: 'g' });
    });

    it('should convert volume units before aggregating', () => {
      const ingredients = [
        { ingredientId: 'ing1', quantity: 1, unit: 'l' },
        { ingredientId: 'ing1', quantity: 250, unit: 'ml' },
        { ingredientId: 'ing1', quantity: 2, unit: 'cup' },
      ];
      const result = aggregateIngredients(ingredients);

      expect(result.size).toBe(1);
      expect(result.get('ing1')).toEqual({ quantity: 1730, unit: 'ml' });
    });

    it('should throw error when aggregating incompatible units', () => {
      const ingredients = [
        { ingredientId: 'ing1', quantity: 100, unit: 'g' },
        { ingredientId: 'ing1', quantity: 100, unit: 'ml' },
      ];

      expect(() => aggregateIngredients(ingredients)).toThrow(
        'Cannot aggregate ingredient ing1 with different unit types: g vs ml'
      );
    });

    it('should handle empty array', () => {
      const result = aggregateIngredients([]);
      expect(result.size).toBe(0);
    });
  });

  describe('formatQuantity', () => {
    it('should format grams as g', () => {
      expect(formatQuantity(500, 'g')).toBe('500g');
    });

    it('should format large grams as kg', () => {
      expect(formatQuantity(1500, 'g')).toBe('1.5kg');
    });

    it('should format milliliters as ml', () => {
      expect(formatQuantity(250, 'ml')).toBe('250ml');
    });

    it('should format large milliliters as L', () => {
      expect(formatQuantity(2500, 'ml')).toBe('2.5L');
    });

    it('should format pieces without decimal', () => {
      expect(formatQuantity(3.7, 'pcs')).toBe('4 pcs');
    });

    it('should round to 1 decimal place', () => {
      expect(formatQuantity(123.456, 'g')).toBe('123.5g');
    });

    it('should handle exactly 1000g as 1.0kg', () => {
      expect(formatQuantity(1000, 'g')).toBe('1.0kg');
    });

    it('should handle exactly 1000ml as 1.0L', () => {
      expect(formatQuantity(1000, 'ml')).toBe('1.0L');
    });

    it('should handle small quantities', () => {
      expect(formatQuantity(5.2, 'g')).toBe('5.2g');
    });

    it('should handle zero', () => {
      expect(formatQuantity(0, 'g')).toBe('0g');
    });
  });
});
