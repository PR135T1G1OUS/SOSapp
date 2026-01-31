const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/params");

admin.initializeApp();
const db = admin.firestore();

const MONEYUNIFY_AUTH_ID = defineString("MONEYUNIFY_AUTH_ID");

/**
 * HEALTH CHECK
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
  res.json({
    status: "OK",
    message: "Backend running 🚀",
    time: new Date().toISOString(),
  });
});

/**
 * REQUEST PAYMENT
 */
exports.requestMobileMoneyPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { phone, amount } = req.body;

      if (!phone || !amount) {
        return res.status(400).json({
          status: "error",
          message: "phone and amount required",
        });
      }

      const payload = new URLSearchParams({
        auth_id: MONEYUNIFY_AUTH_ID.value(),
        from_payer: phone,
        amount,
      });

      const response = await axios.post(
        "https://api.moneyunify.one/payments/request",
        payload.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const transactionId = response.data.transaction_id;

      // SAVE TO FIRESTORE (PENDING)
      await db.collection("payments").doc(transactionId).set({
        phone,
        amount,
        transactionId,
        status: "PENDING",
        provider: "MobileMoney",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        rawResponse: response.data,
      });

      return res.json({
        status: "success",
        transaction_id: transactionId,
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "error",
        message: "Payment initiation failed",
      });
    }
  });
});

/**
 * VERIFY PAYMENT (MANUAL CHECK)
 */
exports.verifyMobileMoneyPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { transaction_id } = req.body;

      if (!transaction_id) {
        return res.status(400).json({
          status: "error",
          message: "transaction_id required",
        });
      }

      const payload = new URLSearchParams({
        auth_id: MONEYUNIFY_AUTH_ID.value(),
        transaction_id,
      });

      const response = await axios.post(
        "https://api.moneyunify.one/payments/verify",
        payload.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      // UPDATE FIRESTORE
      await db.collection("payments").doc(transaction_id).update({
        status: response.data.status || "UNKNOWN",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        verificationResponse: response.data,
      });

      return res.json({
        status: "success",
        data: response.data,
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "error",
        message: "Verification failed",
      });
    }
  });
});

/**
 * 🔔 MONEYUNIFY WEBHOOK (AUTO UPDATE)
 */
exports.moneyUnifyWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const {
      transaction_id,
      status,
    } = req.body;

    if (!transaction_id || !status) {
      return res.status(400).send("Invalid webhook payload");
    }

    await db.collection("payments").doc(transaction_id).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      webhookPayload: req.body,
    });

    return res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).send("Webhook failed");
  }
});
