// srv/temi-service.js  (SAP CAP example)
const axios = require("axios");

const TEMI_URL = "http://192.168.4.27:8080"; // or your VPN-accessible IP

module.exports = (srv) => {

    // Called from BTP when a delivery order is created
    srv.on("dispatchRobot", async (req) => {
        const { stops } = req.data; // expect array from BTP event

        try {
            const res = await axios.post(`${TEMI_URL}/api/route`, {
                stops: stops.map(s => ({
                    location:       s.locationId.toLowerCase(),
                    label:          s.locationName,
                    object:         s.itemDescription,
                    waitForConfirm: true
                }))
            }, {
                headers: { "Content-Type": "application/json" },
                timeout: 5000
            });

            return { success: true, message: res.data.message };

        } catch (err) {
            req.error(500, `Temi unreachable: ${err.message}`);
        }
    });

    // Poll current robot status from BTP
    srv.on("getRobotStatus", async (req) => {
        const res  = await axios.get(`${TEMI_URL}/status`);
        return res.data;
    });
};