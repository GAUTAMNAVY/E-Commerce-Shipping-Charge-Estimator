/**
 * Transport Strategy Pattern Implementation
 * This module implements the Strategy design pattern for selecting
 * the appropriate transport mode based on distance.
 */

/**
 * Interface for transport mode strategies
 */
export interface TransportStrategy {
    /**
     * Check if this strategy can handle the given distance
     * @param distance - Distance in kilometers
     */
    canHandle(distance: number): boolean;

    /**
     * Get the rate per km per kg for this transport mode
     */
    getRate(): number;

    /**
     * Get the name of the transport mode
     */
    getMode(): string;

    /**
     * Get the minimum distance this mode handles
     */
    getMinDistance(): number;

    /**
     * Get the maximum distance this mode handles (null for unlimited)
     */
    getMaxDistance(): number | null;
}

/**
 * Aeroplane transport strategy for long distances (500km+)
 */
export class AeroplaneStrategy implements TransportStrategy {
    private readonly rate = 1.0; // Rs per km per kg
    private readonly minDistance = 500;

    canHandle(distance: number): boolean {
        return distance >= this.minDistance;
    }

    getRate(): number {
        return this.rate;
    }

    getMode(): string {
        return 'Aeroplane';
    }

    getMinDistance(): number {
        return this.minDistance;
    }

    getMaxDistance(): number | null {
        return null; // No upper limit
    }
}

/**
 * Truck transport strategy for medium distances (100-499km)
 */
export class TruckStrategy implements TransportStrategy {
    private readonly rate = 2.0; // Rs per km per kg
    private readonly minDistance = 100;
    private readonly maxDistance = 499.99;

    canHandle(distance: number): boolean {
        return distance >= this.minDistance && distance < 500;
    }

    getRate(): number {
        return this.rate;
    }

    getMode(): string {
        return 'Truck';
    }

    getMinDistance(): number {
        return this.minDistance;
    }

    getMaxDistance(): number | null {
        return this.maxDistance;
    }
}

/**
 * Mini Van transport strategy for short distances (0-99km)
 */
export class MiniVanStrategy implements TransportStrategy {
    private readonly rate = 3.0; // Rs per km per kg
    private readonly minDistance = 0;
    private readonly maxDistance = 99.99;

    canHandle(distance: number): boolean {
        return distance >= this.minDistance && distance < 100;
    }

    getRate(): number {
        return this.rate;
    }

    getMode(): string {
        return 'Mini Van';
    }

    getMinDistance(): number {
        return this.minDistance;
    }

    getMaxDistance(): number | null {
        return this.maxDistance;
    }
}

/**
 * Transport mode selector that uses the Strategy pattern
 */
export class TransportModeSelector {
    private strategies: TransportStrategy[];

    constructor() {
        // Order matters: check from longest to shortest distance
        this.strategies = [
            new AeroplaneStrategy(),
            new TruckStrategy(),
            new MiniVanStrategy(),
        ];
    }

    /**
     * Select the appropriate transport strategy based on distance
     * @param distance - Distance in kilometers
     * @returns The selected transport strategy
     * @throws Error if no suitable strategy is found
     */
    selectStrategy(distance: number): TransportStrategy {
        if (distance < 0) {
            throw new Error('Distance cannot be negative');
        }

        for (const strategy of this.strategies) {
            if (strategy.canHandle(distance)) {
                return strategy;
            }
        }

        throw new Error(`No transport mode available for distance: ${distance} km`);
    }

    /**
     * Get transport mode and rate for a given distance
     * @param distance - Distance in kilometers
     * @returns Object with mode name and rate
     */
    getTransportModeAndRate(distance: number): { mode: string; rate: number } {
        const strategy = this.selectStrategy(distance);
        return {
            mode: strategy.getMode(),
            rate: strategy.getRate(),
        };
    }

    /**
     * Get all available transport strategies
     * @returns Array of all transport strategies
     */
    getAllStrategies(): TransportStrategy[] {
        return [...this.strategies];
    }
}

/**
 * Factory function to create a transport mode selector
 * @returns New TransportModeSelector instance
 */
export function createTransportModeSelector(): TransportModeSelector {
    return new TransportModeSelector();
}
