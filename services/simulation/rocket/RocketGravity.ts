
import * as THREE from 'three';
import { CONSTANTS } from '../../physics/physicsConstants';

export class RocketGravity {
    /**
     * Computes the gravitational force vector.
     * F = G * M * m / r^2
     * Direction: Normalized vector from Body to Earth Center.
     */
    static computeForce(positionM: THREE.Vector3, massKg: number): THREE.Vector3 {
        const r = positionM.length();
        
        // Singularity protection (though rocket should crash before this)
        if (r < 100) return new THREE.Vector3(0, 0, 0);

        const magnitude = (CONSTANTS.G * CONSTANTS.M_EARTH * massKg) / (r * r);
        
        // Direction is opposite to position vector (Position is relative to Earth Center 0,0,0)
        return positionM.clone().normalize().negate().multiplyScalar(magnitude);
    }
}
