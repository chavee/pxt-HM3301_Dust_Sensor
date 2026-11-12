/**
 * HM3301 I2C dust sensor
 */

enum DustValues {
    //% block="P1.0"
    P1 = 2,
    //% block="P2.5"
    P2 = 3,
    //% block="P10.0"
    P10 = 4,
    //% block="PM1.0 (atmospheric)"
    AtmosphericP1 = 5,
    //% block="PM2.5 (atmospheric)"
    AtmosphericP2 = 6,
    //% block="PM10 (atmospheric)"
    AtmosphericP10 = 7
}

//% color=#008272 icon="\uf0c2" block="HM3301"
namespace HM3301 {
    const ADDRESS = 0x40

    function checksum(buf: Buffer): boolean {
        if (buf.length != 29) {
            return false
        }

        let sum = 0
        let hasData = false

        for (let j = 0; j < 28; j++) {
            sum = (sum + buf[j]) & 0xff

            if (buf[j] != 0) {
                hasData = true
            }
        }

        // Reject an all-zero response.
        return hasData && sum == buf[28]
    }

    function readBytes(num: number): Buffer {
        // End the read transaction with STOP.
        return pins.i2cReadBuffer(ADDRESS, num, false)
    }

    /**
     * Read dust concentration in micrograms per cubic metre.
     * Returns -1 if the response is invalid.
     * Original P1.0/P2.5/P10.0 options use CF=1 values.
     * Atmospheric options use atmospheric environment values.
     */
    //% blockId=HM3301_read_value
    //% block="Read dust value|%i"
    //% weight=90
    export function readDustValue(i: DustValues): number {
        if (i < 2 || i > 7) {
            return -1
        }

        let bytes = readBytes(29)

        if (!checksum(bytes)) {
            return -1
        }

        let offset = i * 2
        return (bytes[offset] << 8) | bytes[offset + 1]
    }

    /**
     * Initialize the sensor once at startup.
     * Includes startup delays before measurements begin.
     */
    //% blockId=HM3301_init
    //% block="Initialize the sensor"
    //% weight=100
    export function init(): void {
        basic.pause(2000)

        // Send the command as a single byte.
        pins.i2cWriteNumber(
            ADDRESS,
            0x88,
            NumberFormat.UInt8BE,
            false
        )

        basic.pause(5000)
    }
}
