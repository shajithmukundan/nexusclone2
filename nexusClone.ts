/**
* MakeCode extension for micro:bit expansion board "Nexus:bit" and robot "NexusBot" from Taiwan Coding Education Association (TCEA)
* By Alan Wang, 2019
*/

enum boardType {
    //% block="Nexus:bit"
    nexusbit,
    //% block="Thunder:bit V2"
    thunderbit_v2,
    //% block="Thunder:bit V1"
    thunderbit_v1,
}


enum servoDir {
    //% block="min"
    min,
    //% block="max"
    max,
}


let _boardType: boardType = boardType.nexusbit

//% weight=200 color=#009fb7 icon="\uf1aa" block="NexusClone"
namespace nexusClone {

    let _servoNum = 12
    let _rLedPin = 15
    let _gLedPin = 14
    let _bLedPin = 13
    let _boardName = "Nexus:bit"
    let _initialized = false
    let _servoDefl = [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90]
    let _servoCurrent = [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90]
    let _servoMin = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    let _servoMax = [180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180]
    let _servoDelta = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]

    function _initialize() {
        if (!_initialized) {
            PCA9685.reset(106)
            _initialized = true
        }
    }

    //% block="Select board type %type" group="1. Setup"
    export function selectBoard(type: boardType) {
        _boardType = type
        if (_boardType == boardType.nexusbit) {
            _boardName = "Nexus:bit"
            _servoNum = 12
            _rLedPin = 15
            _gLedPin = 14
            _bLedPin = 13
        } else {
            _boardName = "Thunder:bit "
            _boardName += (_boardType == boardType.thunderbit_v2) ? "V2" : "V1"
            _servoNum = (_boardType == boardType.thunderbit_v2) ? 8 : 4
            _rLedPin = 9
            _gLedPin = 10
            _bLedPin = 11
        }
    }

    //% block="Board information (see serial output)" group="1. Setup" advanced=true
    export function info() {
        serial.writeLine("Nexus:bit/Thunder:bit/NexusBot are products of Taiwan Coding Education Association (TCEA) (www.beyond-coding.org.tw)")
        serial.writeLine("Extension by Alan Wang, 2019. (github.com/alankrantas/pxt-Nexusbit)")
        serial.writeLine("Current selected board: " + _boardName)
        serial.writeLine("PCA9685 servo num: " + _servoNum)
    }

    //% block="Configure PCA9685 servo no. %servo|default degree(s) = %deflDegree|min degree(s) = %minDegree|max degree(s) = %maxDegree|gradually turning degree(s) = %delta" servo.min=1 servo.max=12 servo.defl=1 deflDegree.shadow="protractorPicker" deflDegree.defl=90 minDegree.shadow="protractorPicker" minDegree.defl=0 maxDegree.shadow="protractorPicker" maxDegree.defl=180 delta.shadow="protractorPicker" delta.defl=5 group="4. PCA9685 Servos" advanced=true
    export function servoConfig(servo: number, deflDegree: number, minDegree: number, maxDegree: number, delta: number) {
        if (servo > 0 && servo <= _servoNum) {
            _servoMin[servo - 1] = Math.constrain(minDegree, 0, 180)
            _servoMax[servo - 1] = (Math.constrain(maxDegree, 0, 180) >= minDegree) ? Math.constrain(maxDegree, 0, 180) : _servoMin[servo - 1]
            _servoDefl[servo - 1] = Math.constrain(deflDegree, _servoMin[servo - 1], _servoMax[servo - 1])
            _servoDelta[servo - 1] = Math.constrain(delta, 0, 180)
        }
    }

    //% block="Adjust PCA9685 servos default position|by array %deflDegrees" group="4. PCA9685 Servos" blockExternalInputs=true advanced=true
    export function servosDeflAdjust(deflDegrees: number[]) {
        if (deflDegrees != null && deflDegrees.length <= _servoNum)
            for (let i = 0; i < deflDegrees.length; i++) _servoDefl[i] = Math.constrain(_servoDefl[i] + deflDegrees[i], _servoMin[i], _servoMax[i])
    }

    //% block="Set PCA9685 servos greadually turing degree(s)|by array %deltas" group="4. PCA9685 Servos" blockExternalInputs=true advanced=true
    export function servoSetDelta(deltas: number[]) {
        if (deltas != null && deltas.length <= _servoNum)
            for (let i = 0; i < deltas.length; i++) if (deltas[i] != null && deltas[i] > 0) _servoDelta[i] = Math.constrain(deltas[i], 0, 180)
    }

    //% block="PCA9685 servo no. %servo turn to %degree degree(s)" servo.min=1 servo.max=12 servo.defl=1 degree.shadow="protractorPicker" degree.defl=180 group="4. PCA9685 Servos"
    export function servoTo(servo: number, degree: number) {
        _initialize()
        degree = Math.constrain(degree, _servoMin[servo - 1], _servoMax[servo - 1])
        if (servo > 0 && servo <= _servoNum) {
            _servoCurrent[servo - 1] = degree
            PCA9685.setServoPosition(servo, degree, 64)
        }
    }

    //% block="Get PCA9685 servo no. %servo current position" servo.min=1 servo.max=12 servo.defl=1 deltaArray.min=0 deltaArray.max=180 deltaArray.defl=5 group="4. PCA9685 Servos" advanced=true
    export function getServoCurrent(servo: number): number {
        return (servo > 0 && servo <= _servoNum) ? _servoCurrent[servo - 1] : 0
    }

    //% block="PCA9685 servo no. %servo turn to %direction degree(s)" servo.min=1 servo.max=12 servo.defl=1 group="4. PCA9685 Servos"
    export function servoToMinMax(servo: number, direction: servoDir) {
        servoTo(servo, direction == servoDir.min ? _servoMin[servo - 1] : _servoMax[servo - 1])
    }

    //% block="PCA9685 servo no. %servo move %delta degree(s) from default" servo.min=1 servo.max=12 servo.defl=1 delta.min=-180 delta.max=180 delta.defl=0 group="4. PCA9685 Servos"
    export function servoDeltaFromDefl(servo: number, delta: number) {
        servoTo(servo, _servoDefl[servo - 1] + delta)
    }

    //% block="PCA9685 servo no. %servo gradually turn toward %degree degree(s)" servo.min=1 servo.max=12 servo.defl=1 degree.shadow="protractorPicker" degree.defl=90 group="4. PCA9685 Servos" advanced=true
    export function servoSlowTurn(servo: number, degree: number) {
        degree = Math.constrain(degree, _servoMin[servo - 1], _servoMax[servo - 1])
        let newDegree = _servoCurrent[servo - 1]
        if (Math.abs(degree - _servoCurrent[servo - 1]) > 0 && Math.abs(degree - _servoCurrent[servo - 1]) <= _servoDelta[servo - 1]) {
            servoTo(servo, degree)
        } else {
            if (degree > _servoCurrent[servo - 1]) newDegree = _servoCurrent[servo - 1] + _servoDelta[servo - 1]
            else if (degree < _servoCurrent[servo - 1]) newDegree = _servoCurrent[servo - 1] - _servoDelta[servo - 1]
            servoTo(servo, newDegree)
        }
    }

    //% block="PCA9685 servo no. %servo at %degree degree(s) %check ?" servo.min=1 servo.max=12 servo.defl=1 degree.shadow="protractorPicker" degree.defl=90 group="4. PCA9685 Servos" advanced=true
    export function ServoIsAtDegree(servo: number, degree: number, check: boolean) {
        if (servo > 0 && servo <= _servoNum) return check ? getServoCurrent(servo) == degree : !(getServoCurrent(servo) == degree)
        else return false
    }

    //% block="PCA9685 servo no. %servo gradually turn toward %direction degree(s)" servo.min=1 servo.max=12 servo.defl=1 group="4. PCA9685 Servos" advanced=true
    export function servoSlowTurnMinMax(servo: number, direction: servoDir) {
        servoSlowTurn(servo, direction == servoDir.min ? _servoMin[servo - 1] : _servoMax[servo - 1])
    }

    //% block="PCA9685 servo no. %servo at %direction degree(s) %check ?" servo.min=1 servo.max=12 servo.defl=1 group="4. PCA9685 Servos" advanced=true
    export function ServoIsAtMinMax(servo: number, direction: servoDir, check: boolean) {
        return ServoIsAtDegree(servo, direction == servoDir.min ? _servoMin[servo - 1] : _servoMax[servo - 1], check)
    }

    //% block="PCA9685 servo no. %servo gradually move %delta degree(s) from default" servo.min=1 servo.max=12 servo.defl=1 delta.min=-180 delta.max=180 delta.defl=0 group="4. PCA9685 Servos" advanced=true
    export function servoSlowTurnDeltaFromDefl(servo: number, delta: number) {
        let target = Math.constrain(_servoDefl[servo - 1] + delta, _servoMin[servo - 1], _servoMax[servo - 1])
        let newDegree = _servoCurrent[servo - 1]
        if (Math.abs(target - newDegree) > 0 && Math.abs(target - newDegree) <= _servoDelta[servo - 1]) {
            servoTo(servo, target)
        } else {
            if (target > _servoCurrent[servo - 1]) newDegree = _servoCurrent[servo - 1] + _servoDelta[servo - 1]
            else if (target < _servoCurrent[servo - 1]) newDegree = _servoCurrent[servo - 1] - _servoDelta[servo - 1]
            servoTo(servo, newDegree)
        }
    }

    //% block="PCA9685 servo no. %servo at degree(s) %delta from default %check ?" servo.min=1 servo.max=12 servo.defl=1 delta.min=-180 delta.max=180 delta.defl=0 group="4. PCA9685 Servos" advanced=true
    export function servoIsDeltaFromDefl(servo: number, delta: number, check: boolean) {
        return ServoIsAtDegree(servo, _servoDefl[servo - 1] + delta, check)
    }

    //% block="PCA9685 all servos gradually move from default|by array %deltas|turning delay (ms) = %delay" group="4. PCA9685 Servos" blockExternalInputs=true advanced=true
    export function servosSlowTurnDeltaFromDefl(deltas: number[], delay: number) {
        let check = true
        if (delay < 0) delay = 0
        if (deltas != null && deltas.length <= _servoNum) {
            while (true) {
                check = true
                for (let i = 0; i < deltas.length; i++) {
                    if (deltas[i] != null) {
                        if (servoIsDeltaFromDefl(i + 1, deltas[i], false)) {
                            servoSlowTurnDeltaFromDefl(i + 1, deltas[i])
                            if (check) check = false
                        }
                    }
                }
                if (check) break
                if (delay > 0) basic.pause(delay)
            }
        }
    }

    //% block="PCA9685 all servos gradually move %delta from default if not done" group="4. PCA9685 Servos" advanced=true
    export function servoSlowTurnDeltaFromDeflAndCheck(delta: number[]): boolean {
        let check = true
        if (delta != null && delta.length <= _servoNum) {
            for (let i = 0; i < delta.length; i++) {
                if (servoIsDeltaFromDefl(i + 1, delta[i], false)) {
                    servoSlowTurnDeltaFromDefl(i + 1, delta[i])
                    if (check) check = false
                }
            }
        }
        return !check
    }

    //% block="All PCA9685 servos turn to default" group="4. PCA9685 Servos"
    export function servosToDefl() {
        for (let i = 0; i < _servoNum; i++)
            servoTo(i + 1, _servoDefl[i])
    }

    //% block="All PCA9685 servos turn to degrees %degree" group="4. PCA9685 Servos"
    export function servosToDegree(degrees: number[]) {
        if (degrees != null && degrees.length <= _servoNum)
            for (let i = 0; i < degrees.length; i++)
                if (degrees[i] != null)
                    servoTo(i + 1, degrees[i])
    }

    //% block="All PCA9685 servos move to degrees %deltas from default" group="4. PCA9685 Servos" blockExternalInputs=true
    export function servosToDeltaFromDefl(deltas: number[]) {
        if (deltas != null && deltas.length <= _servoNum)
            for (let i = 0; i < deltas.length; i++)
                if (deltas[i] != null)
                    servoTo(i + 1, _servoDefl[i] + deltas[i])
    }

    //% block="(null)" group="4. PCA9685 Servos" advanced=true
    export function return_null(): number {
        return null
    }


    //% weight=15
    namespace PCA9685 {
    }

}