import * as THREE from 'three';

export class AIPredictor {
    constructor() {
        this.predictionHistory = [];
        this.maxHistoryLength = 60; // 1 second at 60fps
        this.riskThresholds = {
            safe: 80,
            caution: 60,
            danger: 30,
            critical: 10
        };
    }

    predict(shipPosition, shipVelocity, icebergPositions, difficulty) {
        const prediction = {
            survivalPercentage: 100,
            riskLevel: 'safe',
            recommendations: [],
            confidence: 0.95,
            timeToImpact: null,
            nearestThreat: null
        };

        // Analyze current situation
        const threats = this.analyzeThreats(shipPosition, shipVelocity, icebergPositions);
        const environmentalFactors = this.getEnvironmentalFactors(difficulty);
        const shipFactors = this.getShipFactors(shipVelocity);

        // Calculate base survival rate
        let survivalRate = 100;

        if (threats.length > 0) {
            const primaryThreat = threats[0];
            prediction.nearestThreat = primaryThreat;
            prediction.timeToImpact = primaryThreat.timeToImpact;

            // Distance factor (closer = more dangerous)
            const distanceFactor = Math.max(0, 1 - primaryThreat.distance / 200);
            survivalRate -= distanceFactor * 40;

            // Speed factor (faster = more dangerous)
            const speedFactor = shipVelocity.length() / 20;
            survivalRate -= speedFactor * 20;

            // Trajectory factor (heading towards iceberg = more dangerous)
            const trajectoryFactor = this.calculateTrajectoryRisk(
                shipPosition, 
                shipVelocity, 
                primaryThreat.position
            );
            survivalRate -= trajectoryFactor * 30;

            // Multiple threats factor
            if (threats.length > 1) {
                survivalRate -= (threats.length - 1) * 10;
            }
        }

        // Apply environmental factors
        survivalRate *= environmentalFactors.visibilityMultiplier;
        survivalRate *= environmentalFactors.weatherMultiplier;

        // Apply ship factors
        survivalRate *= shipFactors.maneuverabilityMultiplier;

        // Clamp survival rate
        survivalRate = Math.max(0, Math.min(100, survivalRate));
        prediction.survivalPercentage = Math.round(survivalRate);

        // Determine risk level
        prediction.riskLevel = this.getRiskLevel(survivalRate);

        // Generate recommendations
        prediction.recommendations = this.generateRecommendations(
            shipPosition, 
            shipVelocity, 
            threats, 
            prediction.riskLevel
        );

        // Calculate confidence based on data quality
        prediction.confidence = this.calculateConfidence(threats, environmentalFactors);

        // Store in history for trend analysis
        this.addToHistory(prediction);

        return prediction;
    }

    analyzeThreats(shipPosition, shipVelocity, icebergPositions) {
        const threats = [];
        const lookAheadTime = 30; // seconds

        icebergPositions.forEach(iceberg => {
            const distance = shipPosition.distanceTo(iceberg.position);
            const dangerRadius = this.getDangerRadius(iceberg.size);

            if (distance < dangerRadius * 3) { // Only consider nearby icebergs
                const timeToImpact = this.calculateTimeToImpact(
                    shipPosition,
                    shipVelocity,
                    iceberg.position,
                    dangerRadius
                );

                if (timeToImpact !== null && timeToImpact < lookAheadTime) {
                    threats.push({
                        position: iceberg.position,
                        size: iceberg.size,
                        distance,
                        timeToImpact,
                        dangerRadius,
                        severity: this.calculateThreatSeverity(distance, timeToImpact, iceberg.size)
                    });
                }
            }
        });

        // Sort by severity (most dangerous first)
        threats.sort((a, b) => b.severity - a.severity);

        return threats;
    }

    calculateTimeToImpact(shipPosition, shipVelocity, icebergPosition, dangerRadius) {
        if (shipVelocity.length() < 0.1) return null; // Ship not moving

        // Calculate closest approach point
        const toIceberg = icebergPosition.clone().sub(shipPosition);
        const velocityNormalized = shipVelocity.clone().normalize();
        
        const projectionLength = toIceberg.dot(velocityNormalized);
        
        if (projectionLength < 0) return null; // Iceberg is behind ship

        const closestPoint = shipPosition.clone().add(
            velocityNormalized.multiplyScalar(projectionLength)
        );
        
        const closestDistance = closestPoint.distanceTo(icebergPosition);
        
        if (closestDistance > dangerRadius) return null; // Will miss

        // Calculate time to reach danger zone
        const timeToClosest = projectionLength / shipVelocity.length();
        const safeDistance = Math.sqrt(dangerRadius * dangerRadius - closestDistance * closestDistance);
        const timeToImpact = timeToClosest - safeDistance / shipVelocity.length();

        return Math.max(0, timeToImpact);
    }

    calculateTrajectoryRisk(shipPosition, shipVelocity, icebergPosition) {
        if (shipVelocity.length() < 0.1) return 0;

        const toIceberg = icebergPosition.clone().sub(shipPosition).normalize();
        const velocityNormalized = shipVelocity.clone().normalize();
        
        const dot = toIceberg.dot(velocityNormalized);
        return Math.max(0, dot); // 0 = perpendicular, 1 = heading directly towards
    }

    getDangerRadius(icebergSize) {
        const baseRadius = {
            small: 15,
            medium: 25,
            large: 40,
            massive: 60
        };
        
        return baseRadius[icebergSize] || 20;
    }

    calculateThreatSeverity(distance, timeToImpact, icebergSize) {
        const sizeMultiplier = {
            small: 1,
            medium: 1.5,
            large: 2,
            massive: 3
        };

        const distanceScore = Math.max(0, 100 - distance);
        const timeScore = timeToImpact > 0 ? Math.max(0, 100 - timeToImpact * 3) : 0;
        const sizeScore = (sizeMultiplier[icebergSize] || 1) * 20;

        return distanceScore + timeScore + sizeScore;
    }

    getEnvironmentalFactors(difficulty) {
        const factors = {
            visibilityMultiplier: 1,
            weatherMultiplier: 1,
            currentStrength: 0
        };

        switch (difficulty) {
            case 'Calm Seas':
                factors.visibilityMultiplier = 1.0;
                factors.weatherMultiplier = 1.0;
                break;
            case 'Rough Waters':
                factors.visibilityMultiplier = 0.9;
                factors.weatherMultiplier = 0.85;
                break;
            case 'Perfect Storm':
                factors.visibilityMultiplier = 0.7;
                factors.weatherMultiplier = 0.6;
                break;
        }

        return factors;
    }

    getShipFactors(shipVelocity) {
        const speed = shipVelocity.length();
        
        return {
            maneuverabilityMultiplier: Math.max(0.5, 1 - speed / 40), // Harder to turn at high speed
            stoppingDistance: speed * speed / 10, // Realistic stopping distance
            turnRadius: speed * 2 // Turn radius increases with speed
        };
    }

    getRiskLevel(survivalRate) {
        if (survivalRate >= this.riskThresholds.safe) return 'safe';
        if (survivalRate >= this.riskThresholds.caution) return 'caution';
        if (survivalRate >= this.riskThresholds.danger) return 'danger';
        return 'critical';
    }

    generateRecommendations(shipPosition, shipVelocity, threats, riskLevel) {
        const recommendations = [];

        if (threats.length === 0) {
            recommendations.push('maintain course');
            return recommendations;
        }

        const primaryThreat = threats[0];
        const toThreat = primaryThreat.position.clone().sub(shipPosition);
        const shipHeading = shipVelocity.clone().normalize();

        // Determine best evasion direction
        const cross = new THREE.Vector3().crossVectors(shipHeading, toThreat);
        const turnDirection = cross.y > 0 ? 'turn right' : 'turn left';

        switch (riskLevel) {
            case 'critical':
                recommendations.push('full stop');
                recommendations.push(turnDirection);
                recommendations.push('reverse engines');
                break;
            case 'danger':
                recommendations.push('reduce speed');
                recommendations.push(turnDirection);
                break;
            case 'caution':
                recommendations.push(turnDirection);
                recommendations.push('reduce speed');
                break;
            case 'safe':
                recommendations.push('maintain course');
                break;
        }

        // Add specific recommendations based on threat analysis
        if (primaryThreat.timeToImpact < 10) {
            recommendations.unshift('emergency maneuver');
        }

        if (threats.length > 2) {
            recommendations.push('navigate to open water');
        }

        return recommendations.slice(0, 3); // Limit to 3 recommendations
    }

    calculateConfidence(threats, environmentalFactors) {
        let confidence = 0.95;

        // Reduce confidence in poor visibility
        confidence *= environmentalFactors.visibilityMultiplier;

        // Reduce confidence with many threats (more complex situation)
        if (threats.length > 3) {
            confidence *= 0.8;
        }

        // Reduce confidence for very close threats (less prediction time)
        const closestThreat = threats[0];
        if (closestThreat && closestThreat.distance < 50) {
            confidence *= 0.7;
        }

        return Math.max(0.5, confidence);
    }

    addToHistory(prediction) {
        this.predictionHistory.push({
            timestamp: Date.now(),
            ...prediction
        });

        if (this.predictionHistory.length > this.maxHistoryLength) {
            this.predictionHistory.shift();
        }
    }

    getTrend() {
        if (this.predictionHistory.length < 10) return 'stable';

        const recent = this.predictionHistory.slice(-10);
        const older = this.predictionHistory.slice(-20, -10);

        const recentAvg = recent.reduce((sum, p) => sum + p.survivalPercentage, 0) / recent.length;
        const olderAvg = older.reduce((sum, p) => sum + p.survivalPercentage, 0) / older.length;

        const difference = recentAvg - olderAvg;

        if (difference > 5) return 'improving';
        if (difference < -5) return 'deteriorating';
        return 'stable';
    }

    reset() {
        this.predictionHistory = [];
    }
}