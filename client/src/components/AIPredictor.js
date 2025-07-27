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

        // Calculate base survival percentage
        prediction.survivalPercentage = this.calculateSurvivalRate(
            threats,
            environmentalFactors,
            shipFactors
        );

        // Determine risk level
        prediction.riskLevel = this.getRiskLevel(prediction.survivalPercentage);

        // Generate recommendations
        prediction.recommendations = this.generateRecommendations(
            threats,
            shipPosition,
            shipVelocity
        );

        // Find nearest threat and time to impact
        if (threats.length > 0) {
            prediction.nearestThreat = threats[0];
            prediction.timeToImpact = this.calculateTimeToImpact(
                shipPosition,
                shipVelocity,
                threats[0]
            );
        }

        // Update prediction history
        this.updateHistory(prediction);

        return prediction;
    }

    analyzeThreats(shipPosition, shipVelocity, icebergPositions) {
        const threats = [];
        const lookAheadTime = 30; // seconds
        const safetyMargin = 20; // meters

        icebergPositions.forEach(iceberg => {
            const distance = shipPosition.distanceTo(iceberg.position);
            const relativePosition = iceberg.position.clone().sub(shipPosition);
            
            // Calculate if ship is on collision course
            const projectedPosition = shipPosition.clone().add(
                shipVelocity.clone().multiplyScalar(lookAheadTime)
            );
            
            const futureDistance = projectedPosition.distanceTo(iceberg.position);
            const icebergRadius = this.getIcebergRadius(iceberg.size, iceberg.type);
            
            // Threat assessment
            const threat = {
                iceberg,
                distance,
                futureDistance,
                icebergRadius,
                threatLevel: 0,
                collisionProbability: 0,
                avoidanceOptions: []
            };

            // Calculate collision probability
            if (futureDistance < icebergRadius + safetyMargin) {
                threat.collisionProbability = Math.max(0, 
                    1 - (futureDistance / (icebergRadius + safetyMargin))
                );
            }

            // Calculate threat level based on distance and collision probability
            threat.threatLevel = this.calculateThreatLevel(
                distance,
                threat.collisionProbability,
                icebergRadius
            );

            // Generate avoidance options
            threat.avoidanceOptions = this.generateAvoidanceOptions(
                shipPosition,
                shipVelocity,
                iceberg.position,
                icebergRadius
            );

            if (threat.threatLevel > 0.1) {
                threats.push(threat);
            }
        });

        // Sort threats by level (highest first)
        threats.sort((a, b) => b.threatLevel - a.threatLevel);

        return threats;
    }

    getIcebergRadius(size, type) {
        const baseRadius = {
            small: 5,
            medium: 8,
            large: 12,
            massive: 18
        };
        
        return (baseRadius[type] || 5) * size;
    }

    calculateThreatLevel(distance, collisionProbability, icebergRadius) {
        const proximityFactor = Math.max(0, 1 - distance / 200);
        const sizeFactor = Math.min(1, icebergRadius / 20);
        
        return (proximityFactor * 0.4 + collisionProbability * 0.5 + sizeFactor * 0.1);
    }

    generateAvoidanceOptions(shipPosition, shipVelocity, icebergPosition, icebergRadius) {
        const options = [];
        const safeDistance = icebergRadius + 30;
        
        // Calculate avoidance vectors
        const toIceberg = icebergPosition.clone().sub(shipPosition).normalize();
        const leftAvoidance = new THREE.Vector3(-toIceberg.z, 0, toIceberg.x);
        const rightAvoidance = new THREE.Vector3(toIceberg.z, 0, -toIceberg.x);
        
        // Check left turn option
        const leftTarget = icebergPosition.clone().add(leftAvoidance.multiplyScalar(safeDistance));
        options.push({
            direction: 'left',
            target: leftTarget,
            difficulty: this.calculateManeuverDifficulty(shipPosition, shipVelocity, leftTarget)
        });
        
        // Check right turn option
        const rightTarget = icebergPosition.clone().add(rightAvoidance.multiplyScalar(safeDistance));
        options.push({
            direction: 'right',
            target: rightTarget,
            difficulty: this.calculateManeuverDifficulty(shipPosition, shipVelocity, rightTarget)
        });
        
        // Check stop option
        options.push({
            direction: 'stop',
            target: shipPosition.clone(),
            difficulty: shipVelocity.length() / 20 // Harder to stop at high speed
        });
        
        return options.sort((a, b) => a.difficulty - b.difficulty);
    }

    calculateManeuverDifficulty(shipPosition, shipVelocity, targetPosition) {
        const distance = shipPosition.distanceTo(targetPosition);
        const speed = shipVelocity.length();
        const angle = this.calculateTurnAngle(shipVelocity, targetPosition.clone().sub(shipPosition));
        
        // Difficulty factors
        const distanceFactor = Math.min(1, distance / 100);
        const speedFactor = Math.min(1, speed / 20);
        const angleFactor = Math.abs(angle) / Math.PI;
        
        return distanceFactor * 0.3 + speedFactor * 0.4 + angleFactor * 0.3;
    }

    calculateTurnAngle(velocity, direction) {
        const currentAngle = Math.atan2(velocity.z, velocity.x);
        const targetAngle = Math.atan2(direction.z, direction.x);
        
        let angle = targetAngle - currentAngle;
        
        // Normalize angle to [-π, π]
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        
        return angle;
    }

    getEnvironmentalFactors(difficulty) {
        const factors = {
            visibility: 1.0,
            waveHeight: 1.0,
            windSpeed: 1.0,
            temperature: 1.0
        };

        switch (difficulty) {
            case 'Calm Seas':
                factors.visibility = 0.9;
                factors.waveHeight = 0.5;
                factors.windSpeed = 0.3;
                break;
            case 'Rough Waters':
                factors.visibility = 0.7;
                factors.waveHeight = 1.2;
                factors.windSpeed = 0.8;
                break;
            case 'Perfect Storm':
                factors.visibility = 0.4;
                factors.waveHeight = 2.0;
                factors.windSpeed = 1.5;
                break;
        }

        return factors;
    }

    getShipFactors(shipVelocity) {
        const speed = shipVelocity.length();
        
        return {
            speed,
            maneuverability: Math.max(0.1, 1 - speed / 25), // Harder to turn at high speed
            stoppingDistance: speed * speed / 10, // Quadratic relationship
            reactionTime: Math.min(3, speed / 5) // Longer reaction time at high speed
        };
    }

    calculateSurvivalRate(threats, environmentalFactors, shipFactors) {
        let baseRate = 100;

        // Reduce survival rate based on threats
        threats.forEach(threat => {
            const threatReduction = threat.threatLevel * threat.collisionProbability * 50;
            baseRate -= threatReduction;
        });

        // Environmental factors
        baseRate *= environmentalFactors.visibility;
        baseRate *= (2 - environmentalFactors.waveHeight) / 2;
        baseRate *= (2 - environmentalFactors.windSpeed) / 2;

        // Ship factors
        if (shipFactors.speed > 15) {
            baseRate *= 0.8; // High speed penalty
        }

        // Ensure rate is within bounds
        return Math.max(0, Math.min(100, baseRate));
    }

    getRiskLevel(survivalPercentage) {
        if (survivalPercentage >= this.riskThresholds.safe) return 'safe';
        if (survivalPercentage >= this.riskThresholds.caution) return 'caution';
        if (survivalPercentage >= this.riskThresholds.danger) return 'danger';
        return 'critical';
    }

    generateRecommendations(threats, shipPosition, shipVelocity) {
        const recommendations = [];

        if (threats.length === 0) {
            recommendations.push('maintain course');
            return recommendations;
        }

        const primaryThreat = threats[0];
        const bestAvoidance = primaryThreat.avoidanceOptions[0];

        // Speed recommendations
        const speed = shipVelocity.length();
        if (speed > 15 && primaryThreat.distance < 100) {
            recommendations.push('reduce speed');
        } else if (speed < 5 && primaryThreat.distance > 200) {
            recommendations.push('increase speed');
        }

        // Direction recommendations
        if (bestAvoidance) {
            switch (bestAvoidance.direction) {
                case 'left':
                    recommendations.push('turn left');
                    break;
                case 'right':
                    recommendations.push('turn right');
                    break;
                case 'stop':
                    recommendations.push('full stop');
                    break;
            }
        }

        // Emergency recommendations
        if (primaryThreat.collisionProbability > 0.7) {
            recommendations.unshift('emergency maneuver');
        }

        return recommendations;
    }

    calculateTimeToImpact(shipPosition, shipVelocity, threat) {
        if (threat.collisionProbability < 0.1) return null;

        const relativeVelocity = shipVelocity.clone();
        const relativePosition = threat.iceberg.position.clone().sub(shipPosition);
        
        // Simple time to closest approach calculation
        const closingSpeed = -relativeVelocity.dot(relativePosition.normalize());
        
        if (closingSpeed <= 0) return null; // Moving away
        
        const distance = relativePosition.length() - threat.icebergRadius;
        return Math.max(0, distance / closingSpeed);
    }

    updateHistory(prediction) {
        this.predictionHistory.push({
            timestamp: Date.now(),
            prediction: { ...prediction }
        });

        // Limit history length
        if (this.predictionHistory.length > this.maxHistoryLength) {
            this.predictionHistory.shift();
        }
    }

    getConfidenceLevel(prediction) {
        // Base confidence on prediction stability
        if (this.predictionHistory.length < 10) return 0.5;

        const recentPredictions = this.predictionHistory.slice(-10);
        const variance = this.calculateVariance(
            recentPredictions.map(p => p.prediction.survivalPercentage)
        );

        // Lower variance = higher confidence
        return Math.max(0.1, Math.min(0.99, 1 - variance / 1000));
    }

    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    }
}